from flask.testing import FlaskClient
from tests import endpoint, front_end_date

admin_sample = {
    'first_name': 'Test',
    'last_name': 'User',
    'email': 'testuser@testing.org',
    'password': 'secured'
}

company_sample = {
    'active': True,
    'address': '1500 Sample St. Sunnyside CA 98996',
    'name': 'Sample',
    'phone': '1234567890',
}


def seed_admin(client: FlaskClient):
    return client.post('/install', data=admin_sample)


def seed_company(client: FlaskClient, token: str):
    auth = {
        'X-Access-Token': token
    }
    return client.post(endpoint('/company'), json=company_sample, headers=auth)

