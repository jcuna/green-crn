from base64 import b64encode
from tests import endpoint
from tests.seeders import seed_admin


def test_install(no_db_client):
    rv = no_db_client.get(endpoint('/user'))
    assert rv.json['error'] == 'install'
    assert rv.status_code == 501


def test_no_session(client):
    rv = client.get(endpoint('/user'))
    assert rv.json['error'] == 'no session'
    assert rv.status_code == 403


def test_login(client):

    seed_admin(client)

    auth = {
        'Authorization': 'Basic ' + b64encode(b'testuser@testing.org' + b':' + b'secured').decode()
    }
    rv = client.post(endpoint('/login'), headers=auth)
    assert rv.json['user']['email'] == 'testuser@testing.org'
    assert 'value' in rv.json['token']
    assert rv.status_code == 200
