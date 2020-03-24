from base64 import b64encode

from flask.testing import FlaskClient

from tests import endpoint, secret_key
from tests.injector import resources


class LocalUser(object):
    id = None
    token = None
    pass


user = LocalUser()


def test_admin_create_user(client: FlaskClient, admin_login: dict):

    resp = client.post(
        endpoint('/users'),
        json={
            'first_name': 'John',
            'last_name': 'Smith',
            'email': 'jondmith@school.edu',
            'roles': [1],  # admin
            'attributes': {}
        },
        headers=admin_login
    )

    assert 'id' in resp.json
    assert resp.status_code == 200
    assert len(resources.mails) == 1

    user.id = resp.json['id']


def test_user_verifies_account(client: FlaskClient):
    from dal.user import UserToken

    verification_token = UserToken.query.first()
    assert verification_token is not None

    verification = client.get(endpoint('/user-tokens/badtoken'))
    assert verification.status_code == 400
    assert 'isValid' in verification.json
    assert verification.json['isValid'] == False

    verification = client.get(endpoint('/user-tokens/%s' % verification_token.token))
    assert verification.status_code == 200
    assert 'isValid' in verification.json
    assert verification.json['isValid'] == True

    user.token = verification_token.token


def test_user_activates_account(client: FlaskClient):
    resp = client.post(
        endpoint('/account/activate-pass'),
        json={
            'token': 'bad-token',
            'pw': 'badpassword',
            'pw2': 'badpassword',
        }
    )

    assert resp.status_code == 400
    assert 'Invalid token' in resp.json['error']

    resp = client.post(
        endpoint('/account/activate-pass'),
        json={
            'token': user.token,
            'pw': 'badpassword',
            'pw2': 'badpassword',
        }
    )

    assert resp.status_code == 400
    assert 'Invalid password' in resp.json['error']

    resp = client.post(
        endpoint('/account/activate-pass'),
        json={
            'token': user.token,
            'pw': 'mY$P@ssw0rd',
            'pw2': 'mY$P@ssw0rd',
        }
    )

    assert resp.status_code == 200


def test_token_cannot_be_reused(client: FlaskClient):
    verification = client.get(endpoint('/user-tokens/%s' % user.token))
    assert verification.status_code == 400
    assert 'isValid' in verification.json
    assert verification.json['isValid'] == False


def test_new_user_can_login(client: FlaskClient):
    auth = {
        'Authorization': 'Basic ' + b64encode(b'jondmith@school.edu:mY$P@ssw0rd').decode()
    }
    login_resp = client.post(endpoint('/login'), headers=auth)
    assert 'token' in login_resp.json, 'token expected'
    assert login_resp.status_code == 200


def test_user_changes_password(client: FlaskClient):
    from dal.user import UserToken

    resp = client.put(endpoint('/users/reset-password'))
    assert resp.status_code == 400
    assert 'error' in resp.json
    assert 'Missing email' in resp.json['error']

    resp = client.put(endpoint('/users/reset-password'), json={'email': 'jondmith2@school.edu'})
    assert resp.status_code == 200

    assert len(resources.mails) == 1, 'no email has been sent because user does not exist'

    resp = client.put(endpoint('/users/reset-password'), json={'email': 'jondmith@school.edu'})
    assert resp.status_code == 200

    assert UserToken.query.count() == 2
    assert len(resources.mails) == 2, 'an email should have been sent'

    token = UserToken.query.offset(1).first()

    assert token is not None

    resp = client.post(
        endpoint('/account/activate-pass'),
        json={
            'token': token.token,
            'pw': '@noth3rp@22w04d',
            'pw2': '@noth3rp@22w04d',
        }
    )

    assert resp.status_code == 200

    auth = {
        'Authorization': 'Basic ' + b64encode(b'jondmith@school.edu:@noth3rp@22w04d').decode()
    }
    login_resp = client.post(endpoint('/login'), headers=auth)
    assert 'token' in login_resp.json, 'token expected'
    assert login_resp.status_code == 200


def test_sending_messages(client: FlaskClient):
    from dal.user import UserMessage

    resp = client.post(
        endpoint('/messages'),
        json={
            'user_id': user.id,
            'subject': 'testing a subject',
            'body': '<h1>Hello test</h1><p>This is the body</p>'
        },
        headers={'X-System-Token': 'secret_key'}
    )

    assert resp.status_code == 401

    resp = client.post(
        endpoint('/messages'),
        json={
            'user_id': user.id,
            'subject': 'testing a subject',
            'body': '<h1>Hello test</h1><p>This is the body</p>'
        },
        headers={'X-System-Token': secret_key}
    )

    assert resp.status_code == 200

    messages = UserMessage.query.all()

    assert len(messages) == 1

    assert messages[0].user_id == user.id
    assert messages[0].read == False
    assert messages[0].subject == 'testing a subject'
    assert messages[0].message == '<h1>Hello test</h1><p>This is the body</p>'


def test_get_user_messages(client: FlaskClient, admin_login):
    from core.messages import send_message
    from dal.user import User

    admin = User.query.filter_by(email='testuser@testing.org').first()

    send_message(admin.id, 'testing a subject', '<h1>Hello test</h1><p>This is the body</p>')

    resp = client.get(endpoint('/messages'), headers=admin_login)
    assert resp.status_code == 200
    assert 'list' in resp.json
    assert len(resp.json['list']) == 1
    assert 'subject' in resp.json['list'][0]
    assert 'id' in resp.json['list'][0]
    assert 'message' in resp.json['list'][0]
    assert 'read' in resp.json['list'][0]
    assert 'date' in resp.json['list'][0]
    assert resp.json['list'][0]['read'] == False


def test_mark_notification_read(client: FlaskClient, admin_login):

    resp = client.get(endpoint('/messages'), headers=admin_login)
    _id = resp.json['list'][0]['id']

    resp = client.put(endpoint('/messages/%s' % _id))

    assert resp.status_code == 200

    resp = client.get(endpoint('/messages'), headers=admin_login)
    assert 'read' in resp.json['list'][0]
    assert resp.json['list'][0]['read'] == True
