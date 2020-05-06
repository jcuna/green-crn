from app import db, init_app
from dal.customer import Country, Province, SourceProject, ProjectType, PanelModel, InverterModel, \
    Distributor, Rate, Transformer, TrCapacity, Phase, Tension, SaleType, FinancialStatus, FinancialEntity


def seed_meta():
    objects = []
    for source_project in source_projects:
        objects.append(SourceProject(label=source_project))

    for project_type in project_types:
        objects.append(ProjectType(label=project_type))

    for panel_model in panel_models:
        objects.append(PanelModel(label=panel_model))

    for inverter_model in inverter_models:
        objects.append(InverterModel(label=inverter_model))

    for distributor in distributors:
        objects.append(Distributor(label=distributor))

    for rate in rates:
        objects.append(Rate(label=rate))

    for transformer in transformers:
        objects.append(Transformer(label=transformer))

    for tr_capacity in tr_capacities:
        objects.append(TrCapacity(label=tr_capacity))

    for phase in phases:
        objects.append(Phase(label=phase))

    for tension in tensions:
        objects.append(Tension(label=tension))

    for sale_type in sale_types:
        objects.append(SaleType(label=sale_type))

    for status in financial_status:
        objects.append(FinancialStatus(label=status))

    for financial_entity in financial_entities:
        objects.append(
            FinancialEntity(
                name=financial_entity[0], primary_phone=financial_entity[1], secondary_phone=financial_entity[2] if len(financial_entity) == 3 else None
            )
        )

    db.session.bulk_save_objects(objects)
    db.session.commit()


def seed_countries():
    for country in countries:
        c = Country(name=country['name'], abbreviation=country['abb'])
        for province in country['states']:
            c.provinces.append(Province(name=province))
        db.session.add(c)

    db.session.commit()


def run_migration():
    app = init_app('sys')
    with app.app_context():
        db.create_all()
        db.session.commit()
        seed_countries()
        seed_meta()


def clear_cache():
    from core import cache
    cache.clear()


us_states = [
    'Alabama',
    'Alaska',
    'Arizona',
    'Arkansas',
    'California',
    'Colorado',
    'Connecticut',
    'Delaware',
    'Florida',
    'Georgia',
    'Hawaii',
    'Idaho',
    'Illinois',
    'Indiana',
    'Iowa',
    'Kansas',
    'Kentucky',
    'Louisiana',
    'Maine',
    'Maryland',
    'Massachusetts',
    'Michigan',
    'Minnesota',
    'Mississippi',
    'Missouri',
    'Montana',
    'Nebraska',
    'Nevada',
    'New Hampshire',
    'New Jersey',
    'New Mexico',
    'New York',
    'North Carolina',
    'North Dakota',
    'Ohio',
    'Oklahoma',
    'Oregon',
    'Pennsylvania',
    'Rhode Island',
    'South Carolina',
    'South Dakota',
    'Tennessee',
    'Texas',
    'Utah',
    'Vermont',
    'Virginia',
    'Washington',
    'West Virginia',
    'Wisconsin',
    'Wyoming',
    'American Samoa',
    'District of Columbia',
    'Federated States of Micronesia',
    'Guam',
    'Marshall Islands',
    'Northern Mariana Islands',
    'Palau',
    'Puerto Rico',
    'Virgin Islands',
]

do_states = [
    'Azua',
    'Bahoruco',
    'Barahona',
    'Dajabón',
    'Distrito Nacional',
    'Duarte',
    'Elías Piña',
    'El Seibo',
    'Espaillat',
    'Hato Mayor',
    'Hermanas Mirabal',
    'Independencia',
    'La Altagracia',
    'La Romana',
    'La Vega',
    'María Trinidad Sánchez',
    'Monseñor Nouel',
    'Monte Cristi',
    'Monte Plata',
    'Pedernales',
    'Peravia',
    'Puerto Plata',
    'Samaná',
    'Sánchez Ramírez',
    'San Cristóbal',
    'San José de Ocoa',
    'San Juan',
    'San Pedro de Macorís',
    'Santiago',
    'Santiago Rodríguez',
    'Santo Domingo',
    'Valverde',
]

countries = [
    {'name': 'Republica Dominicana', 'abb': 'DO', 'states': do_states},
    {'name': 'Estados Unidos', 'abb': 'US', 'states': us_states},
]

source_projects = ['ENESTAR', 'OCHOA', 'OTRA']
project_types = ['COMERCIAL', 'RESIDENCIAL']
distributors = ['EDENORTE', 'EDESUR', 'EDEESTE', 'UERS']
rates = ['BTS1', 'BTS2', 'MTD', 'MTD2']
transformers = ['PROPIO', 'DISTRIBUIDORA']
tr_capacities = [37.5, 50, 75, 112.5]
phases = ['MONOFASICO', 'TRIFASICO']
tensions = [120, 240, 208, 480]
sale_types = ['CONECTADO A RED', 'AISLADO/HIBRIDO', 'BOMBEO']
financial_status = ['INICIADO', 'ESPERANDO RESPUESTA', 'DECLINADO', 'APROVADO']
financial_entities = [
    ['BANCO MULTIPLE ACTIVO DOMINICANA, S. A.', '8096862585'],
    ['BANCO MULTIPLE BELLBANK, S. A.', '8297320002'],
    ['BANCO MULTIPLE ADEMI, S. A.', '8096830203'],
    ['BANCO MULTIPLE LAFISE, S. A.', '8095414100'],
    ['BANESCO BANCO MULTIPLE, S. A.', '8298938100'],
    ['BANCO MULTIPLE PROMERICA DE LA REPUBLICA DOMINICANA, S. A.', '8097328448'],
    ['BANCO MULTIPLE DE LAS AMERICAS, S. A. (BANCAMERICA)', '8095495050'],
    ['BANCO MULTIPLE LOPEZ DE HARO, S. A.', '8095358994'],
    ['BANCO MULTIPLE VIMENCA, S. A.', '8095329797'],
    ['BANCO MULTIPLE BDI, S. A.', '8095358586'],
    ['BANCO MULTIPLE CARIBE INTERNACIONAL, S. A.', '8093780505'],
    ['BANCO MULTIPLE SANTA CRUZ, S. A.', '8097262222'],
    ['BANCO MULTIPLE BHD LEON, S. A.', '8092433232'],
    ['BANCO DOMINICANO DEL PROGRESO, S. A. - BANCO MULTIPLE', '8095633233'],
    ['BANCO POPULAR DOMINICANO, S. A.- BANCO MULTIPLE', '8095445000'],
    ['CITIBANK, N. A.', '8095665611'],
    ['THE BANK OF NOVA SCOTIA', '8099602000'],
    ['BANCO DE RESERVAS DE LA REPUBLICA DOMINICANA - BANCO DE SERVICIOS MULTIPLE', '8099602000'],
    ['BANCO DE AHORRO Y CREDITO FONDESA, S. A. (BANFONDESA)', '8092263333'],
    ['BANCO DE AHORRO Y CREDITO UNION, S. A.', '8095656191'],
    ['BANCO DE AHORRO Y CREDITO FIHOGAR, S. A.', '8095662187'],
    ['BONANZA BANCO DE AHORRO Y CREDITO, S. A.', '8095376034'],
    ['BANCO DE AHORRO Y CREDITO COFACI, S. A.', '8095405660'],
    ['BANCO DE AHORRO Y CREDITO GRUFICORP, S. A.', '8095665824'],
    ['BANCO BACC DE AHORRO Y CREDITO DEL CARIBE, S. A.', '8095626473'],
    ['BANCO DE AHORRO Y CREDITO JMMB BANK, S. A.', '8096831333'],
    ['MOTOR CREDITO, S. A. BANCO DE AHORRO Y CREDITO', '8095403900'],
    ['BANCO DE AHORRO Y CREDITO EMPIRE, S. A.', '8096217000'],
    ['BANCO DE AHORRO Y CREDITO CONFISA, S. A.', '8092271066'],
    ['BANCO DE AHORRO Y CREDITO ADOPEM, S. A.', '8095633939'],
    ['BANCO DE AHORRO Y CREDITO BANCOTUI, S. A.', '8095852636'],
    ['BANCO ATLANTICO DE AHORRO Y CREDITO, S. A.', '8095665841'],
    ['OPTIMA CORPORACION DE CREDITO, S. A.', '8097324446'],
    ['CORPORACION DE CREDITO NORDESTANA DE PRESTAMOS, S. A.', '8095881369'],
    ['CORPORACION DE CREDITO MONUMENTAL, S. A.', '8095875131'],
    ['CORPORACION DE CREDITO REIDCO, S. A.', '8095625222'],
    ['CORPORACION DE CREDITO LEASING CONFISA, S.A.', '8092271066'],
    ['CORPORACION DE CREDITO OFICORP, S. A.', '8095665824'],
    ['ASOCIACION LA NACIONAL DE AHORROS Y PRESTAMOS', '8096886631'],
    ['ASOCIACION BONAO DE AHORROS Y PRESTAMOS', '8095253291'],
    ['ASOCIACION MOCANA DE AHORROS Y PRESTAMOS', '8095782321'],
    ['ASOCIACION MAGUANA DE AHORROS Y PRESTAMOS', '8095575501'],
    ['ASOCIACION DUARTE DE AHORROS Y PRESTAMOS', '8095882656'],
    ['ASOCIACION LA VEGA REAL DE AHORROS Y PRESTAMOS', '8095732655'],
    ['ASOCIACION ROMANA DE AHORROS Y PRESTAMOS', '8095565301'],
    ['ASOCIACION PERAVIA DE AHORROS Y PRESTAMOS', '8095223335'],
    ['ASOCIACION CIBAO DE AHORROS Y PRESTAMOS', '8095814433'],
    ['ASOCIACION POPULAR DE AHORROS Y PRESTAMOS', '8096890171'],
    ['BANCO NACIONAL DE LAS EXPORTACIONES (BANDEX)', '8095656621'],
    ['BANCO AGRICOLA DE LA REPUBLICA DOMINICANA', '8095358088'],
]

panel_models = [
    'Q.PEAK L-G5.0.G 375',
    'Q.PEAK L-G5 365',
]
inverter_models = [
    'SUNNY BOY 3.0-US-40 - 7.7-US-40',
    'SUNNY BOY 3.0-US-41 - 7.7-US-41',
    'SUNNY TRIPOWER 12000TL-US',
    'SUNNY TRIPOWER 20000TL-US',
    'SUNNY TRIPOWER 24000TL-US',
    'SUNNY TRIPOWER 30000TL-US',
    'SUNNY TRIPOWER CORE1 33-US',
    'SUNNY TRIPOWER CORE1 50-US',
    'SUNNY TRIPOWER CORE1 62-US',
]
