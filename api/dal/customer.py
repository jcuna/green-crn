from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import MACADDR
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.ext.mutable import MutableList
from dal import db
from sqlalchemy.orm import relationship, composite, deferred
from datetime import datetime
from dal.shared import ModelIter, Point
from config import configs
from sqlalchemy.dialects import sqlite

# sqlite is used for testing. this adds compatibility
BigInteger = db.BigInteger().with_variant(sqlite.INTEGER(), 'sqlite')
SmallInteger = db.SmallInteger().with_variant(sqlite.INTEGER(), 'sqlite')
MacAddress = MACADDR().with_variant(db.String, 'sqlite')


# many to many associations
class InstallationPanelModel(db.Model, ModelIter):
    __tablename__ = 'installations_panel_models'

    id = db.Column(db.Integer, primary_key=True)
    installation_id = deferred(db.Column(db.Integer, db.ForeignKey('installations.id'), index=True))
    panel_model_id = deferred(db.Column(db.Integer, db.ForeignKey('panel_models.id'), index=True))
    panel_quantity = db.Column(db.Integer, nullable=False)


class InstallationInverterModel(db.Model, ModelIter):
    __tablename__ = 'installations_inverter_models'

    id = db.Column(db.Integer, primary_key=True)
    installation_id = deferred(db.Column(db.Integer, db.ForeignKey('installations.id'), index=True))
    inverter_model_id = deferred(db.Column(db.Integer, db.ForeignKey('inverter_models.id'), index=True))
    inverter_quantity = db.Column(db.Integer, nullable=False)


# meta fields
class Country(db.Model, ModelIter):
    __tablename__ = 'countries'

    id = db.Column(SmallInteger, primary_key=True)
    name = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)
    abbreviation = db.Column(db.String(2, collation=configs.DB_COLLATION), nullable=False)
    provinces = relationship('Province')


class Province(db.Model, ModelIter):
    __tablename__ = 'provinces'  # AKA states

    id = db.Column(db.Integer, primary_key=True)
    country = relationship(Country, uselist=False, backref='countries')
    name = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)
    __table_args__ = (
        UniqueConstraint('country_id', 'name', name='province_country_id'),
    )

    country_id = db.Column(db.Integer, db.ForeignKey('countries.id'), index=True)


class SourceProject(db.Model, ModelIter):
    __tablename__ = 'source_projects'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)


class ProjectType(db.Model, ModelIter):
    __tablename__ = 'project_types'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)


class PanelModel(db.Model, ModelIter):
    __tablename__ = 'panel_models'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.String(255, collation=configs.DB_COLLATION), unique=True, nullable=False)
    quantity = relationship(
        InstallationPanelModel,
        backref='panel_model',
        primaryjoin=id == InstallationPanelModel.panel_model_id,
    )


class InverterModel(db.Model, ModelIter):
    __tablename__ = 'inverter_models'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.String(255, collation=configs.DB_COLLATION), unique=True, nullable=False)
    quantity = relationship(
        InstallationInverterModel,
        backref='inverter_model',
        primaryjoin=id == InstallationInverterModel.inverter_model_id,
    )


class Distributor(db.Model, ModelIter):
    __tablename__ = 'distributors'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)


class Rate(db.Model, ModelIter):
    __tablename__ = 'rates'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.String(10, collation=configs.DB_COLLATION), unique=True, nullable=False)


class Transformer(db.Model, ModelIter):
    __tablename__ = 'transformers'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)


class TrCapacity(db.Model, ModelIter):
    __tablename__ = 'tr_capacities'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.Numeric(5, 1), unique=True, nullable=False)


class Phase(db.Model, ModelIter):
    __tablename__ = 'phases'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)


class Tension(db.Model, ModelIter):
    __tablename__ = 'tensions'  # AKA electric tension

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.SmallInteger, unique=True, nullable=False)


class Integration(db.Model, ModelIter):
    __tablename__ = 'integrations'

    fillable = [
        'service',
        'data'
    ]

    id = db.Column(db.Integer, primary_key=True)
    service = db.Column(db.String(30, collation=configs.DB_COLLATION), unique=True, nullable=False)
    data = db.Column(
        MutableList.as_mutable(db.JSON),
        comment='A JSON schema of integration service',
        nullable=False,
        server_default='[]')


class Customer(db.Model, ModelIter):
    __tablename__ = 'customers'

    fillable = [
        'first_name',
        'last_name',
        'identification_number',
        'primary_email',
        'secondary_email',
        'primary_phone',
        'secondary_phone',
        'address',
        'source_project_id',
        'province_id',
    ]

    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String(30, collation=configs.DB_COLLATION), nullable=False)
    last_name = db.Column(db.String(30, collation=configs.DB_COLLATION), nullable=False, index=True)
    identification_number = db.Column(
        db.String(25, collation=configs.DB_COLLATION),
        comment='National ID. i.e. Cedula, License',
        unique=True
    )
    primary_email = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=False, unique=True)
    secondary_email = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=True)
    primary_phone = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=False, unique=True)
    secondary_phone = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=True)
    address = db.Column(db.Text(collation=configs.DB_COLLATION), nullable=False)
    source_project = relationship(SourceProject, uselist=False, lazy='joined')
    province = relationship(Province, uselist=False, lazy='joined')
    created_on = db.Column(db.DateTime(), nullable=False, default=datetime.utcnow)
    updated_on = db.Column(
        db.DateTime(),
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )
    province_id = deferred(db.Column(db.Integer, db.ForeignKey('provinces.id'), nullable=False))
    source_project_id = db.Column(db.Integer, db.ForeignKey('source_projects.id'))


class CustomerProject(db.Model, ModelIter):
    __tablename__ = 'customer_projects'

    fillable = [
        'name',
        'address',
        'lat',
        'long',
        'coordinates',
        'nic',
        'nic_title',
        'circuit',
        'ct',
        'project_type_id',
        'customer_id',
        'province_id',
        'distributor_id',
        'rate_id',
        'transformer_id',
        'tr_capacity_id',
        'phase_id',
        'tension_id',
    ]

    id = db.Column(db.Integer, primary_key=True)
    customer = relationship(Customer, uselist=False, backref='customer_projects', cascade='all, delete')
    project_type = relationship(ProjectType, uselist=False, lazy='joined')
    name = db.Column(db.String(30, collation=configs.DB_COLLATION), nullable=False)
    address = db.Column(db.Text(collation=configs.DB_COLLATION), nullable=False)
    province = relationship(Province, uselist=False, lazy='joined')
    lat = db.Column(db.Float)
    long = db.Column(db.Float)
    coordinates = composite(Point, lat, long)
    distributor = relationship(Distributor, uselist=False, lazy='joined')
    nic = db.Column(db.SmallInteger)
    nic_title = db.Column(db.String(64, collation=configs.DB_COLLATION))
    rate = relationship(Rate, uselist=False, lazy='joined')
    circuit = db.Column(db.String(30, collation=configs.DB_COLLATION))
    transformer = relationship(Transformer, uselist=False, lazy='joined')
    ct = db.Column(db.SmallInteger)  # transformer ID number
    capacity = relationship(TrCapacity, uselist=False, lazy='joined')
    phase = relationship(Phase, uselist=False, lazy='joined')
    tension = relationship(Tension, uselist=False, lazy='joined')

    project_type_id = deferred(db.Column(db.Integer, db.ForeignKey('project_types.id')))
    customer_id = deferred(db.Column(db.Integer, db.ForeignKey('customers.id'), index=True))
    province_id = deferred(db.Column(db.Integer, db.ForeignKey('provinces.id'), nullable=False))
    distributor_id = deferred(db.Column(db.Integer, db.ForeignKey('distributors.id')))
    rate_id = deferred(db.Column(db.Integer, db.ForeignKey('rates.id')))
    transformer_id = deferred(db.Column(db.Integer, db.ForeignKey('transformers.id')))
    tr_capacity_id = deferred(db.Column(db.Integer, db.ForeignKey('tr_capacities.id')))
    phase_id = deferred(db.Column(db.Integer, db.ForeignKey('phases.id')))
    tension_id = deferred(db.Column(db.Integer, db.ForeignKey('tensions.id')))


class Installations(db.Model, ModelIter):
    __tablename__ = 'installations'

    fillable = [
        'installed_capacity',
        'egauge_url',
        'egauge_serial',
        'egauge_mac',
        'start_date',
        'detailed_performance',
        'project_id',
    ]

    id = db.Column(db.Integer, primary_key=True)
    project = relationship(CustomerProject, uselist=False, backref='installations', cascade='all, delete')
    installed_capacity = db.Column(db.Numeric(8, 3))
    panels = relationship(
        InstallationPanelModel,
        backref='installations',
        primaryjoin=id == InstallationPanelModel.installation_id,
        lazy='joined'
    )
    inverters = relationship(
        InstallationInverterModel,
        backref='installations',
        primaryjoin=id == InstallationInverterModel.installation_id,
        lazy='joined'
    )
    egauge_url = db.Column(db.String(255, collation=configs.DB_COLLATION))
    egauge_serial = db.Column(db.String(255, collation=configs.DB_COLLATION))
    egauge_mac = db.Column(MacAddress)
    start_date = db.Column(db.DateTime)
    detailed_performance = db.Column(db.SmallInteger)

    project_id = deferred(db.Column(db.Integer, db.ForeignKey('customer_projects.id'), index=True, nullable=False))


class InstallationDocument(db.Model, ModelIter):
    __tablename__ = 'installation_documents'

    fillable = [
        'name',
        'file_extension',
        'object_key',
        'installation_id',
    ]

    id = db.Column(db.Integer, primary_key=True)
    installation = relationship(Installations, backref='installation_documents')
    _name = db.Column('name', db.String(96, collation=configs.DB_COLLATION))
    file_extension = db.Column(db.String(5, collation=configs.DB_COLLATION))
    object_key = db.Column(db.String(512, collation=configs.DB_COLLATION))

    installation_id = deferred(db.Column(db.Integer, db.ForeignKey('installations.id'), index=True))

    @hybrid_property
    def name(self):
        return self._name

    @name.setter
    def name(self, name: str):
        self._name = name.upper().strip()


class Note(db.Model, ModelIter):
    __tablename__ = 'notes'
    id = db.Column(db.Integer, primary_key=True)
    comment = db.Column(db.String)

    customer_id = deferred(db.Column(
        db.Integer,
        db.ForeignKey('customers.id'),
        index=True,
        nullable=True
    ))
    customer_project_id = deferred(db.Column(
        db.Integer,
        db.ForeignKey('customer_projects.id'),
        index=True,
        nullable=True
    ))
