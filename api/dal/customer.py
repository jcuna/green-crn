from datetime import datetime

from sqlalchemy import UniqueConstraint
from sqlalchemy.dialects.postgresql import MACADDR
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.ext.mutable import MutableList, MutableDict
from sqlalchemy.orm import relationship, composite, deferred
from sqlalchemy.dialects import sqlite

from dal import db
from dal.shared import ModelIter, Point
from config import configs

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
    serials = db.Column(
        MutableList.as_mutable(db.JSON),
        comment='A JSON list of serial numbers, one per quantity',
        nullable=False,
        server_default='[]'
    )


class InstallationInverterModel(db.Model, ModelIter):
    __tablename__ = 'installations_inverter_models'

    id = db.Column(db.Integer, primary_key=True)
    installation_id = deferred(db.Column(db.Integer, db.ForeignKey('installations.id'), index=True))
    inverter_model_id = deferred(db.Column(db.Integer, db.ForeignKey('inverter_models.id'), index=True))
    inverter_quantity = db.Column(db.Integer, nullable=False)
    serials = db.Column(
        MutableList.as_mutable(db.JSON),
        comment='A JSON list of serial numbers, one per quantity',
        nullable=False,
        server_default='[]'
    ) # technically renders quantity useless


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


class SaleType(db.Model, ModelIter):
    __tablename__ = 'sale_types'

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


class Status(db.Model, ModelIter):
    __tablename__ = 'status'

    id = db.Column(SmallInteger, primary_key=True)
    label = db.Column(db.SmallInteger, unique=True, nullable=False)


class FinancialEntity(db.Model, ModelIter):
    __tablename__ = 'financial_entities'

    id = db.Column(SmallInteger, primary_key=True)
    name = db.Column(db.SmallInteger, unique=True, nullable=False)
    primary_phone = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=False, unique=True)
    secondary_phone = db.Column(db.String(10, collation=configs.DB_COLLATION), nullable=True)


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
    allowed_widget = True

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
    allowed_widget = True

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
    nic = db.Column(db.Integer)
    nic_title = db.Column(db.String(64, collation=configs.DB_COLLATION))
    rate = relationship(Rate, uselist=False, lazy='joined')
    circuit = db.Column(db.String(30, collation=configs.DB_COLLATION))
    transformer = relationship(Transformer, uselist=False, lazy='joined')
    ct = db.Column(db.String(32))  # transformer ID number
    capacity = relationship(TrCapacity, uselist=False, lazy='joined')
    phase = relationship(Phase, uselist=False, lazy='joined')
    tension = relationship(Tension, uselist=False, lazy='joined')
    project_metadata = db.Column(
        MutableDict.as_mutable(db.JSON),
        comment='A JSON schema that allows free form data, i.e. historical consumption data',
        server_default='{}'
    )

    project_type_id = deferred(db.Column(db.Integer, db.ForeignKey('project_types.id')))
    customer_id = deferred(db.Column(db.Integer, db.ForeignKey('customers.id'), index=True, nullable=False))
    province_id = deferred(db.Column(db.Integer, db.ForeignKey('provinces.id'), nullable=False))
    distributor_id = deferred(db.Column(db.Integer, db.ForeignKey('distributors.id')))
    rate_id = deferred(db.Column(db.Integer, db.ForeignKey('rates.id')))
    transformer_id = deferred(db.Column(db.Integer, db.ForeignKey('transformers.id')))
    tr_capacity_id = deferred(db.Column(db.Integer, db.ForeignKey('tr_capacities.id')))
    phase_id = deferred(db.Column(db.Integer, db.ForeignKey('phases.id')))
    tension_id = deferred(db.Column(db.Integer, db.ForeignKey('tensions.id')))


class Installation(db.Model, ModelIter):
    __tablename__ = 'installations'
    allowed_widget = True

    fillable = [
        'installed_capacity',
        'egauge_url',
        'egauge_serial',
        'egauge_mac',
        'start_date',
        'detailed_performance',
        'project_id',
        'sale_type_id',
        'price_per_kwp',
        'responsible_party'
    ]

    id = db.Column(db.Integer, primary_key=True)
    # project can have multiple installations because customers may ask to add more equipment after project is done
    project = relationship(CustomerProject, uselist=False, backref='installations', cascade='all, delete')
    responsible_party = db.Column(db.String(32))
    installed_capacity = db.Column(db.Numeric(8, 3), nullable=False)
    sale_type = relationship(SaleType, uselist=False, lazy='joined')
    price_per_kwp = db.Column(db.Numeric(10, 2), nullable=False)
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

    @property
    def installation_size(self):
        if self.installed_capacity < 50:
            return 'Pequeño'
        elif 51 <= self.installed_capacity <= 200:
            return 'Mediano'
        elif 201 <= self.installed_capacity <= 500:
            return 'Comercial Pequeño'
        elif 501 <= self.installed_capacity <= 1000:
            return 'Comercial Mediano'
        elif 1001 <= self.installed_capacity <= 1500:
            return 'Comercial Grande'
        else:
            return 'Utilidad'

    @property
    def total_investment(self):
        return self.installed_capacity * self.price_per_kwp

    @property
    def annual_production(self):
        return self.installed_capacity * self.detailed_performance

    sale_type_id = deferred(db.Column(db.Integer, db.ForeignKey('sale_types.id'), index=True, nullable=False))
    project_id = deferred(db.Column(db.Integer, db.ForeignKey('customer_projects.id'), index=True, nullable=False))


class InstallationFinancing(db.Model, ModelIter):
    __tablename__ = 'installation_financing'
    allowed_widget = True

    id = db.Column(db.Integer, primary_key=True)
    installation = relationship(Installation, uselist=False, backref='financing', cascade='all, delete')
    financial_entity = relationship(FinancialEntity, uselist=False, backref='installation_financing')
    request_date = db.Column(db.DateTime())
    response_date = db.Column(db.DateTime())
    requested_amount = db.Column(db.Numeric(10, 2), nullable=False)
    assigned_official = db.Column(db.String(60, collation=configs.DB_COLLATION))
    official_phone = db.Column(db.String(10, collation=configs.DB_COLLATION))
    official_email = db.Column(db.String(50, collation=configs.DB_COLLATION), nullable=False)
    approved_rate = db.Column(db.SmallInteger)
    retention_percentage = db.Column(db.SmallInteger)
    insurance = db.Column(db.Numeric(10, 2))
    number_of_payments = db.Column(db.SmallInteger)
    payments_amount = db.Column(db.Numeric(10, 2))
    status = relationship(Status, uselist=False, backref='financing')

    installation_id = deferred(db.Column(db.Integer, db.ForeignKey('installations.id'), index=True, nullable=False))
    financial_entity_id = deferred(db.Column(db.Integer, db.ForeignKey('financial_entities.id'), index=True, nullable=False))
    status_id = deferred(db.Column(db.Integer, db.ForeignKey('status.id'), index=True, nullable=False))


class InstallationStatus(db.Model, ModelIter):
    __tablename__ = 'installation_status'
    allowed_widget = True

    id = db.Column(db.Integer, primary_key=True)
    installation = relationship(Installation, uselist=False, backref='installation_status', cascade='all, delete')

    design_done = db.Column(db.DateTime()) # Carpeta Movida
    proposition_ready = db.Column(db.DateTime()) #
    proposition_delivered = db.Column(db.DateTime()) #
    approved = db.Column(db.Boolean)
    documents_filed = db.Column(db.DateTime()) # Recopilación de Documentos
    signed_contract = db.Column(db.DateTime()) # Firma de Contrato
    annex_a = db.Column(db.DateTime()) # Anexo A
    initial_payment = db.Column(db.DateTime()) # Pago Inicial
    structural_installation = db.Column(db.DateTime()) # Instalacion de Estructura
    no_objection_letter = db.Column(db.DateTime()) # Carta de No Objeción
    final_installation = db.Column(db.DateTime()) # Instalacion final
    annex_b = db.Column(db.DateTime()) # Anexo B
    distributor_supervision = db.Column(db.DateTime()) # Supervisión Distribuidora
    in_interconnection_agreement = db.Column(db.DateTime()) # Entrada Acuerdo de Interconexion
    out_interconnection_agreement = db.Column(db.DateTime()) # Salida Acuerdo de Interconexion
    rc_policy = db.Column(db.DateTime()) # Póliza RC
    in_metering_agreement = db.Column(db.DateTime()) # Entrada Acuerdo de Medición Neta
    out_metering_agreement = db.Column(db.DateTime()) # Salida Acuerdo de Medición Neta
    metering_letter = db.Column(db.DateTime()) # Carta Medidor
    metering_payment = db.Column(db.DateTime()) # Pago Medidor
    meter_deployment = db.Column(db.DateTime()) # Cambio Medidor
    service_start = db.Column(db.DateTime()) # Encendido

    installation_id = deferred(db.Column(db.Integer, db.ForeignKey('installations.id'), index=True, nullable=False))

    @property
    def status(self):
        if self.approved is False:
            return 'Declinado'
        elif self.design_done is not None:
            if self.proposition_ready is not None:
                if self.proposition_delivered is not None and self.approved is True and self.signed_contract is not None \
                        and self.annex_a is not None and self.initial_payment is not None:
                    if self.structural_installation is not None and self.no_objection_letter is not None \
                            and self.final_installation is not None:
                        if self.annex_b is not None:
                            if self.distributor_supervision is not None and \
                                    self.in_interconnection_agreement is not None and \
                                    self.out_interconnection_agreement is not None and self.rc_policy is not None and \
                                    self.in_metering_agreement is not None and self.out_metering_agreement is not None and \
                                    self.metering_letter is not None and self.metering_payment is not None and \
                                    self.meter_deployment is not None:
                                return 'Encendido'
                            return 'Distribuidura'
                        return 'Instalacion'
                    return 'Cerrado'
                return 'Negociación'
            return 'Diseño'
        return 'Levantamiendo'


class InstallationDocument(db.Model, ModelIter):
    __tablename__ = 'installation_documents'
    allowed_widget = True

    fillable = [
        'name',
        'category',
        'object_key',
        'installation_id',
    ]

    id = db.Column(db.Integer, primary_key=True)
    installation = relationship(Installation, backref='installation_documents')
    _name = db.Column('name', db.String(96, collation=configs.DB_COLLATION), nullable=False)
    category = db.Column(db.String(96, collation=configs.DB_COLLATION), nullable=False)
    object_key = db.Column(db.String(512, collation=configs.DB_COLLATION), index=True, nullable=False)

    installation_id = deferred(db.Column(db.Integer, db.ForeignKey('installations.id'), index=True))

    @hybrid_property
    def name(self):
        return self._name

    @name.setter
    def name(self, name: str):
        self._name = name.upper().strip()
