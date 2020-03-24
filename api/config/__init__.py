import hashlib
import uuid
from datetime import datetime
from random import random
import os
from importlib.machinery import SourceFileLoader

configs = SourceFileLoader('settings', os.environ.get('APP_SETTINGS_PATH')).load_module()


def debug():
    """
    turns on pycharm debugger on runtime
    :return:
    """
    import pydevd
    pydevd.settrace('host.docker.internal', port=9001, stdoutToServer=False, stderrToServer=False)


def random_token(more_entropy=random() * random()):
    s = str(datetime.utcnow().timestamp()) + str(uuid.uuid4().hex[:32] + str(more_entropy))
    return hashlib.sha256(s.encode('utf8')).hexdigest()
