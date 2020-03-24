from flask.testing import FlaskClient

from tests import endpoint


def test_widgets_return_models(client: FlaskClient, admin_login: dict):

    resp = client.get(endpoint('/widgets'))

    assert resp.status_code == 401
    assert resp.json['error'] == 'Token is missing!'
    resp = client.get(endpoint('/widgets'), headers=admin_login)
    assert resp.status_code == 200
    assert isinstance(resp.json, list)
    assert len(resp.json) == 9
    assert resp.json[2]['class'] == 'dal.user.UserMessage'
    assert len(resp.json[2]['fields']) == 6
    assert len(resp.json[2]['relationships']) == 1
    assert resp.json[2]['relationships'][0]['class'] == 'dal.user.User'
    assert resp.json[2]['relationships'][0]['name'] == 'user'


def test_widget_create_widget(client: FlaskClient, admin_login: dict):
    from dal.user import CompanyProfile
    from dal.user import User

    resp = client.post(endpoint('/widgets'), json={}, headers=admin_login)

    assert resp.status_code == 400
    assert 'description' in resp.json['error']
    assert 'name' in resp.json['error']
    assert 'schema' in resp.json['error']

    schema = {
        'name': 'Something else',
        'description': 'A description to show',
        'schema': []
    }

    resp = client.post(endpoint('/widgets'), json=schema, headers=admin_login)
    assert resp.status_code == 400
    assert resp.json['error']['name'] == 'Name may consists of letters, dashes and underscores'

    schema = {
        'name': 'schema_name',
        'description': 'A description to show',
        'schema': {
            'model': 'dal.customer.Customer',
            'conditions': [{'AND': [{'column': 'dal.customer.Customer.identification_number', 'value': '123-6556844-9', 'comparator': 'eq'}]}],
            'limit': 1,
            'order_dir': 'desc',
            'order_by': 'dal.customer.Customer.identification_number',
            'fields': [
                'dal.customer.Customer.first_name',
                'dal.customer.Customer.last_name',
                'dal.customer.Customer.identification_number',
                'dal.customer.Customer.primary_email',
                'dal.customer.Customer.primary_phone'
            ],
            'relationships': [
                'dal.customer.Customer.CustomerProject'
            ]
        }
    }

    resp = client.post(endpoint('/widgets'), json=schema, headers=admin_login)
    assert resp.status_code == 200
    c = CompanyProfile.query.first()
    assert 'widgets' in c.settings
    assert 'schema_name' in c.settings['widgets']
    assert c.settings['widgets']['schema_name']['name'] == 'schema_name'
    assert c.settings['widgets']['schema_name']['description'] == 'A description to show'
    assert c.settings['widgets']['schema_name']['schema']['model'] == 'dal.customer.Customer'

    schema2 = {
        'name': 'new_users',
        'private': True,
        'description': 'A 2ns description',
        'schema': {
            'model': 'dal.user.User',
            'conditions': [{'AND': [{'column': 'dal.user.User.created_at', 'value': 'today', 'comparator': 'le'}]}],
            'fields': ['dal.user.User.id', 'dal.user.User.first_name', 'dal.user.User.last_name']
        }
    }

    resp = client.post(endpoint('/widgets'), json=schema2, headers=admin_login)
    assert resp.status_code == 200
    admin = User.query.filter_by(email='testuser@testing.org').first()
    assert 'widgets' in admin.attributes.preferences
    assert 'new_users' in admin.attributes.preferences['widgets']
    assert admin.attributes.preferences['widgets']['new_users']['name'] == 'new_users'
    assert admin.attributes.preferences['widgets']['new_users']['description'] == 'A 2ns description'
    assert admin.attributes.preferences['widgets']['new_users']['schema']['model'] == 'dal.user.User'


def test_run_widget(client: FlaskClient, admin_login: dict):
    resp = client.get(endpoint('/widgets/dont-exist'), headers=admin_login)
    assert resp.status_code == 404

    # resp = client.get(endpoint('/widgets/schema_name'), headers=admin_login)
    # assert resp.status_code == 200
    # assert type(resp.json) == list

    resp = client.get(endpoint('/widgets/new_users?type=private'), headers=admin_login)
    assert resp.status_code == 200
    assert type(resp.json) == list
    assert len(resp.json) == 1
