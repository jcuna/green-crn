import json
from socket import timeout
from datetime import timedelta
from time import sleep, time
from flask import request
from config import configs
from dal.user import Audit
from flask_restful import Resource
from dal.shared import access_map
from .router import Router
from .utils import get_logger, app_path
from .middleware import Middleware, error_handler
from flask_caching import Cache as CacheService
from cryptography.fernet import Fernet
from base64 import b64encode, b64decode
from core.queue_worker import MaxMessageSizeExceededError
from core import mem_queue
from config.routes import no_permissions, default_access

class Cache:

    def __init__(self):
        raise Exception('Static use class only')

    @staticmethod
    def set(key, value, timeout=3600):
        return cache.add(timeout=timeout, key=key, value=value)

    @staticmethod
    def get(key):
        value = cache.get(key=key)
        if not value:
            cache.delete(key=key)
        return value

    @staticmethod
    def remember(key, func, timeout=3600):
        value = Cache.get(key)
        if not value:
            value = func()
            Cache.set(key, value, timeout)
        return value

    @staticmethod
    def delete(key):
        return cache.delete(key=key)


class API(Resource):

    audit_tasks = []

    def dispatch_request(self, *args, **kwargs):
        output = super(Resource, self).dispatch_request(*args, **kwargs)

        view_name = '%s.%s' %( self.__class__.__module__, self.__class__.__name__)
        if view_name in no_permissions or \
                view_name in default_access and access_map[request.method.upper()] in default_access[view_name]:
            return output

        user_id = None
        if hasattr(request, 'user'):
            user_id = request.user.id

        audit = {
            'user_id': user_id,
            'ip': request.remote_addr,
            'endpoint': request.path,
            'headers': json.dumps([{key: request.environ[key]} for key in request.environ if 'HTTP_' in key]),
            'method': request.method,
            'response': json.dumps(output),
            'payload': json.dumps({
                'json': request.get_json(silent=True),
                'query': request.args.to_dict(),
                'form': request.form.to_dict(),
                'all': request.get_data(as_text=True)
            })
        }
        # TODO: Identify if this is the best approach given that the
        #  queue is not active on test unless running queue tests
        if not hasattr(configs, 'TESTING'):
            try:
                mem_queue.send_msg(json.dumps(audit))
            except (ConnectionRefusedError, MaxMessageSizeExceededError, FileNotFoundError, timeout):
                get_logger('app').exception('message error')

        return output


def audit_runner():
    # this long running is used to read from queue and save audit info from request
    from app import init_app, db

    app = init_app('sys')
    logger = get_logger('audit_runner')
    logger.info('starting async audit thread')

    with app.app_context():
        # give queue time time to start
        sleep(5)
        try:
            while True:
                msg = mem_queue.receive_msg()
                if msg:
                    start = time()
                    task = Audit(**json.loads(msg))
                    logger.debug('new audit record')
                    task.payload = encryptor.encrypt(task.payload)
                    db.session.add(task)
                    db.session.commit()
                    logger.debug('Took: ' + str(timedelta(seconds=(time() - start))))
                else: sleep(5)
        except (ConnectionRefusedError, FileNotFoundError, timeout):
            logger.exception('message error')


class Encryptor:

    def __init__(self, password):
        self.package = Fernet(password)

    def encrypt(self, string: str) -> str:
        return b64encode(self.package.encrypt(string.encode('utf8')))

    def decrypt(self, string: str) -> str:
        return self.package.decrypt(b64decode(string)).decode('utf8')


# auto exec
cache = CacheService()
encryptor = Encryptor(configs.SECRET_KEY)
