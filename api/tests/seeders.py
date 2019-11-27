from flask.testing import FlaskClient


install_sample = {
    'first_name': 'Test',
    'last_name': 'User',
    'email': 'testuser@testing.org',
    'password': 'secured',
    'company_name': 'Green CRN',
    'address': '1500 Sample St. Sunnyside CA 98996',
    'contact': '5555555555',
}


def seed_admin(client: FlaskClient):
    return client.post('/install', data=install_sample, content_type='multipart/form-data')
