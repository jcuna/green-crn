import sys
from base64 import b64encode
from importlib import import_module
from multiprocessing import Process
from time import sleep
import pytest
from flask.testing import FlaskClient
from tests import tear_files, init, endpoint
from tests.seeders import seed_admin


injector = import_module('tests.injector')
del sys.modules['boto3']
sys.modules['boto3'] = injector
sys.modules['boto3.dynamodb'] = injector
sys.modules['boto3.dynamodb.conditions'] = injector
sys.modules['psycopg2'] = injector



@pytest.fixture(scope='module')
def client():
    """
    Creates a new database for the unit test to use
    """
    init()

    from app import init_app
    from helpers import run_migration

    app = init_app()
    with app.test_client() as client:
        with app.app_context():
            run_migration()
        yield client
    tear_files()


@pytest.fixture(scope='module')
def no_db_client():
    """
    Returns client with no db
    """
    init()

    from app import init_app

    app = init_app()
    with app.test_client() as client:
        yield client
    tear_files()


@pytest.fixture(scope='module')
def admin_login(client: FlaskClient):
    admin_resp = seed_admin(client)
    assert b'Redirecting...' in admin_resp.data, 'Must redirect upon valid admin creation'
    assert admin_resp.status_code == 302

    auth = {
        'Authorization': 'Basic ' + b64encode(b'testuser@testing.org:' + b'secured').decode()
    }
    # create a session
    login_resp = client.post(endpoint('/login'), headers=auth)
    assert 'token' in login_resp.json, 'token expected'
    assert login_resp.status_code == 200
    return {
        'X-Access-Token': login_resp.json['token']['value']
    }


@pytest.fixture(scope='module')
def queue_process():
    init()

    from app import init_app
    from core.queue_worker import run
    app = init_app()

    # run queue worker in different process
    p = Process(target=run, name='mem_queue_worker')

    with app.test_client() as client:
        p.start()
        sleep(0.1)
        yield p

    p.terminate()
    tear_files()
    p.join()
