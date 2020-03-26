import io
from flask.testing import FlaskClient

from tests.injector import resources
from tests import endpoint, front_end_date


def test_new_customer(client: FlaskClient, admin_login):

    data = {
        'first_name': 'James',
        'last_name': 'Smith',
        'primary_email': 'jsmith@domain.com',
        'identification_number': 423545689,
        'primary_phone': '1236589785',
        'secondary_phone': '6345642356',
        'address': 'Calle 1 #245 Barrio Nuevo Santiago',
        'source_project_id': 1,
        'province_id': 1,
    }
    error = client.post(endpoint('/customers'), json=data)
    assert error.status_code == 401
    assert 'error' in error.json

    resp = client.post(endpoint('/customers'), json=data, headers=admin_login)
    assert resp.status_code == 200
    assert 'id' in resp.json


def test_update_customer_info(client: FlaskClient, admin_login):
    from dal.customer import Customer

    c_id = Customer.query.first().id
    assert c_id is not None
    data = {
        'id': c_id,
        'first_name': 'Jon',
        'secondary_email': 'email@place.com'
    }

    resp = client.put(endpoint('/customers/%s' % c_id), json=data, headers=admin_login)
    assert resp.status_code == 201
    customer = Customer.query.first()
    assert customer.first_name == 'Jon'
    assert customer.secondary_email == 'email@place.com'


def test_customer_add_project(client: FlaskClient, admin_login):
    customer = client.get(endpoint('/customers'), headers=admin_login)

    assert 'list' in customer.json
    assert 'page' in customer.json
    assert 'total_pages' in customer.json
    assert len(customer.json['list']) == 1

    _id = customer.json['list'][0]['id']

    assert isinstance(_id, int)

    data = {
        'name': 'Solar Panels',
        'address': 'C/2 #567 Villa Eliza',
        'lat': '19.473475',
        'long': '-70.714767',
        'nic': 4654,
        'nic_title': 'Emmanuel Reinoso',
        'circuit': 'Something something',
        'ct': 64545,
        'province_id': 5, # Distrito Nacional
        'project_type_id': 1, # COMERCIAL
        'customer_id': _id,
        'distributor_id': 2, # EDESUR
        'rate_id': 2, # BTS2
        'transformer_id': 1, # PROPIO
        'tr_capacity_id': 3, # 75
        'phase_id': 2, # TRIFASICO
        'tension_id': 2, # 240
    }

    error = client.post(endpoint('/customers/projects'), json=data)
    assert error.status_code == 401
    assert 'error' in error.json

    resp = client.post(endpoint('/customers/projects'), json=data, headers=admin_login)

    assert resp.status_code == 200
    assert 'id' in resp.json


def test_project_add_installation(client: FlaskClient, admin_login):
    customer = client.get(endpoint('/customers'), headers=admin_login)

    customer_id = customer.json['list'][0]['id']
    customer = client.get(endpoint('/customers/%s' % customer_id), headers=admin_login)
    project_id = customer.json['customer_projects'][0]['id']

    data = {
        'installed_capacity': 1325.362,
        'egauge_url': 'http://enestar170.egaug.es',
        'egauge_serial': 'AC4654S5E6H46455',
        'egauge_mac': 'ec:35:86:2e:8c:0c',
        'start_date': front_end_date(),
        'specific_yield': 135,
        'project_id': project_id,
        'sale_type_id': 1,
        'price_per_kwp': 250,
        'responsible_party': 'Juan Pedro',
        'panels': [
            {'id': 1, 'quantity': 5, 'serials': ['AD2', 'AG3', 'TG4', 'GT5', '5G5']},
            {'id': 2, 'quantity': 2, 'serials': ['GT5', '5G5']}
        ],
        'inverters': [{'id': 2, 'quantity': 2, 'serials': ['GF5', '5P5']}, {'id': 2, 'quantity': 1, 'serials': ['JT5', '5GF']}],
        'setup_summary': {
            'historical_consumption': [
                {'year': 2018, 'month': 1, 'value': 200},
                {'year': 2018, 'month': 2, 'value': 220},
                {'year': 2018, 'month': 3, 'value': 170}
            ],
            'historical_power': [
                {'year': 2018, 'month': 1, 'value': 10},
                {'year': 2018, 'month': 2, 'value': 9},
                {'year': 2018, 'month': 3, 'value': 15}
            ],
            'expected_generation': [
                {'year': 2018, 'month': 1, 'value': 210},
                {'year': 2018, 'month': 2, 'value': 215},
                {'year': 2018, 'month': 3, 'value': 240}
            ]
        }
    }

    error = client.post(endpoint('/customers/installations'), json=data)
    assert error.status_code == 401
    assert 'error' in error.json

    resp = client.post(endpoint('/customers/installations'), json=data, headers=admin_login)

    assert resp.status_code == 200
    assert 'id' in resp.json


def test_add_invalid_installation_documents(client: FlaskClient, admin_login: dict):
    from dal.customer import Installation

    data = {
        'category': 'Bad',
        'name': 'bad_file',
        'installation_id': Installation.query.first().id,
        'file': (io.BytesIO(b'12345AF3DC13D'), 'file.pdf'),
    }

    error = client.post(endpoint('/customers/documents'), data={}, content_type='multipart/form-data')
    assert error.status_code == 401
    assert 'error' in error.json

    resp1 = client.post(
        endpoint('/customers/documents'), data=data, content_type='multipart/form-data', headers=admin_login
    )

    assert resp1.status_code == 400
    assert 'Invalid Category' in resp1.json['error']


def test_add_installation_documents(client: FlaskClient, admin_login: dict):
    from dal.customer import Installation

    data = {
        'category': 'Legal',
        'name': 'something',
        'installation_id': Installation.query.first().id,
        'file': (io.BytesIO(b'F23DD5AF3DC13DF23DD5AF3DC13D'), 'file.pdf'),
    }

    resp = client.post(
        endpoint('/customers/documents'), data=data, content_type='multipart/form-data', headers=admin_login
    )

    assert resp.status_code == 200
    assert resp.json['message'] == 'Success'

    assert hasattr(resources, 'buckets')
    assert 'mytestbucket' in resources.buckets
    assert 'documents' in resources.buckets['mytestbucket']
    assert len(resources.buckets['mytestbucket']['documents']) == 1


def test_customer_data(client: FlaskClient, admin_login):
    from dal.customer import Customer
    customer_id = Customer.query.first().id

    error = client.get(endpoint('/customers/%s' % customer_id))
    assert error.status_code == 401
    assert 'error' in error.json

    customer = client.get(endpoint('/customers/%s' % customer_id), headers=admin_login)

    assert customer.status_code == 200
    assert customer.json['first_name'] == 'Jon'
    assert customer.json['primary_phone'] == '1236589785'
    assert customer.json['source_project']['label'] == 'ENESTAR'

    assert isinstance(customer.json['customer_projects'], list)
    assert isinstance(customer.json['customer_projects'][0]['project_type'], dict)
    assert isinstance(customer.json['customer_projects'][0]['province'], dict)
    assert isinstance(customer.json['customer_projects'][0]['distributor'], dict)
    assert isinstance(customer.json['customer_projects'][0]['transformer'], dict)
    assert isinstance(customer.json['customer_projects'][0]['capacity'], dict)
    assert isinstance(customer.json['customer_projects'][0]['phase'], dict)
    assert isinstance(customer.json['customer_projects'][0]['tension'], dict)
    assert isinstance(customer.json['customer_projects'][0]['installations'], list)
    assert isinstance(customer.json['customer_projects'][0]['installations'][0]['panels'], list)
    assert isinstance(customer.json['customer_projects'][0]['installations'][0]['panels'][0], dict)
    assert customer.json['customer_projects'][0]['installations'][0]['panels'][0]['quantity'] == 5
    assert isinstance(customer.json['customer_projects'][0]['installations'][0]['panels'][0]['serials'], list)
    assert len(customer.json['customer_projects'][0]['installations'][0]['panels'][0]['serials']) == 5

    assert isinstance(customer.json['customer_projects'][0]['installations'][0]['inverters'], list)
    assert isinstance(customer.json['customer_projects'][0]['installations'][0]['inverters'][0], dict)
    assert customer.json['customer_projects'][0]['installations'][0]['inverters'][0]['quantity'] == 2
    assert isinstance(customer.json['customer_projects'][0]['installations'][0]['inverters'][0]['serials'], list)
    assert len(customer.json['customer_projects'][0]['installations'][0]['inverters'][0]['serials']) == 2

    assert isinstance(customer.json['customer_projects'][0]['installations'][0]['installation_documents'], list)
    assert len(customer.json['customer_projects'][0]['installations'][0]['installation_documents']) == 1
    assert customer.json['customer_projects'][0]['installations'][0]['installation_documents'][0]['name'] == 'SOMETHING'
    assert customer.json['customer_projects'][0]['installations'][0]['installation_documents'][0]['category'] == 'Legal'
    assert 'documents/1/' in \
        customer.json['customer_projects'][0]['installations'][0]['installation_documents'][0]['object_key']

    assert isinstance(customer.json['customer_projects'][0]['installations'][0]['setup_summary'], dict)
    assert 'historical_consumption' in customer.json['customer_projects'][0]['installations'][0]['setup_summary']
    assert isinstance(
        customer.json['customer_projects'][0]['installations'][0]['setup_summary']['historical_consumption'], list
    )
    assert len(customer.json['customer_projects'][0]['installations'][0]['setup_summary']['historical_consumption']) == 3
    assert customer.json['customer_projects'][0]['installations'][0]['setup_summary']['historical_consumption'][1]['value'] == 220

    assert 'historical_power' in customer.json['customer_projects'][0]['installations'][0]['setup_summary']
    assert isinstance(
        customer.json['customer_projects'][0]['installations'][0]['setup_summary']['historical_power'], list
    )
    assert customer.json['customer_projects'][0]['installations'][0]['setup_summary']['historical_power'][2]['value'] == 15

    assert 'expected_generation' in customer.json['customer_projects'][0]['installations'][0]['setup_summary']
    assert isinstance(
        customer.json['customer_projects'][0]['installations'][0]['setup_summary']['expected_generation'], list
    )
    assert customer.json['customer_projects'][0]['installations'][0]['setup_summary']['expected_generation'][0]['value'] == 210

    assert 'installation_status' in customer.json['customer_projects'][0]['installations'][0]
    assert customer.json['customer_projects'][0]['installations'][0]['installation_status']['status'] == 'Levantamiendo', \
        'Should have initial status as no dates have been input'
