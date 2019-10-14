from base64 import b64encode
from sqlalchemy.exc import OperationalError
import pytest
from tests import endpoint


def test_install(no_db_client):
    from dal.models import User
    from dal.models import CompanyProfile

    rv = no_db_client.get(endpoint('/user'))
    assert rv.json['error'] == 'install'
    assert rv.status_code == 501

    with pytest.raises(OperationalError) as ex:
        User.query.all()
        assert 'no such table' in ex.value

    no_db_client.get('/install')
    assert len(User.query.all()) == 0

    post = {
        'email': 'testuser@domain.com',
        'password': 'master',
        'first_name': 'John',
        'last_name': 'Smith',
        'company_name': 'Green CRN',
        'address': '1500 Sample St. Sunnyside CA 98996',
        'contact': '5555555555',
    }
    rv = no_db_client.post('/install', data=post)
    assert b'Redirecting' in rv.data
    u = User.query.all()
    assert len(u) == 1
    assert u[0].email == 'testuser@domain.com'

    c = CompanyProfile.query.all()
    assert len(c) == 1
    assert c[0].name == 'Green CRN'


def test_no_session(no_db_client):
    rv = no_db_client.get(endpoint('/user'))
    assert rv.json['error'] == 'no session'
    assert rv.status_code == 403


def test_login(no_db_client):

    auth = {
        'Authorization': 'Basic ' + b64encode(b'testuser@domain.com' + b':' + b'master').decode()
    }
    rv = no_db_client.post(endpoint('/login'), headers=auth)
    assert rv.json['user']['email'] == 'testuser@domain.com'
    assert 'value' in rv.json['token']
    assert rv.status_code == 200
