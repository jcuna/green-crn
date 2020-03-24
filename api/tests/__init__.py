import os
from cryptography.fernet import Fernet
from datetime import datetime, time

secret_key = Fernet.generate_key().decode()

config = """
TESTING = True
DEBUG = False
SQLALCHEMY_DATABASE_URI = 'sqlite:///%s'
SQLALCHEMY_TRACK_MODIFICATIONS = False
SQLALCHEMY_ENGINE_OPTIONS = {
    'pool_recycle': True
}
SOCKET_ADDRESS = '/var/run/mem_queue-test.sock'
DB_COLLATION = 'BINARY'
APP_ENV = 'testing'
SECRET_KEY = '%s'
CACHE_CONFIG = {
    'CACHE_TYPE': 'simple',
    'CACHE_KEY_PREFIX': 'local_dev'
}
TIME_ZONE = 'America/New_York'

AWS_ACCESS_KEY_ID = 'testid'
AWS_SECRET_ACCESS_KEY = 'testsecretkey'
UPLOAD_FILE_BUCKET = 'mytestbucket'

""" % (os.path.dirname(os.environ['APP_SETTINGS_PATH']) + '/testdb', secret_key)


def init():
    tear_files()  ## just in case
    settings_fd = open(os.environ['APP_SETTINGS_PATH'], 'w+')
    settings_fd.write(config)
    settings_fd.close()


def tear_files():
    try:
        os.unlink(os.path.dirname(os.environ['APP_SETTINGS_PATH']) + '/testdb')
    except OSError:
        if os.path.exists(os.path.dirname(os.environ['APP_SETTINGS_PATH']) + '/testdb'):
            raise
    try:
        os.unlink(os.environ['APP_SETTINGS_PATH'])
    except OSError:
        if os.path.exists(os.environ['APP_SETTINGS_PATH']):
            raise


def endpoint(uri):
    return '/v1.0' + uri


def front_end_date(date: datetime = datetime.utcnow(), _time: str = str(time.min)):
    return ' '.join([str(date.date()), _time])


class Mock(object):
    pass
