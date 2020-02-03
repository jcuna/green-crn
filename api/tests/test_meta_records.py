from flask.testing import FlaskClient
from tests import endpoint


def test_countries(client: FlaskClient, admin_login):

    resp = client.get(endpoint('/meta/countries'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 2
    for country in resp.json:
        if country['name'] == 'Republica Dominicana':
            assert len(country['provinces']) == 32
        else:
            assert len(country['provinces']) == 59

    from dal.customer import Country

    countries = Country.query.all()
    assert len(countries) == 2
    for country in countries:
        assert len(country.provinces) > 30


def test_source_projects(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/source-projects'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 3
    assert 'ENESTAR' == resp.json[0]['label']


def test_project_types(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/project-types'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 2
    assert 'COMERCIAL' == resp.json[0]['label']


def test_distributors(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/distributors'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 4
    assert 'EDENORTE' == resp.json[0]['label']

def test_rates(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/rates'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 4
    assert 'BTS1' == resp.json[0]['label']


def test_transformers(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/transformers'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 3
    assert 'PROPIO' == resp.json[0]['label']


def test_tr_capacities(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/tr-capacities'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 4
    assert '37.50' == resp.json[0]['label']


def test_phases(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/phases'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 2
    assert 'MONOFASICO' == resp.json[0]['label']


def test_tensions(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/tensions'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 4
    assert 120 == resp.json[0]['label']


def test_panel_models(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/panel-models'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 2
    assert 'Q.PEAK L-G5.0.G 375' == resp.json[0]['label']


def test_inverter_models(client: FlaskClient, admin_login):
    resp = client.get(endpoint('/meta/inverter-models'), headers=admin_login)

    assert resp.status_code == 200
    assert len(resp.json) == 9
    assert 'SUNNY BOY 3.0-US-40 - 7.7-US-40' == resp.json[0]['label']
