from app import db, init_app
from dal.customer import Country, Province, SourceProject, ProjectType, PanelModel, InverterModel,\
    Distributor, Rate, Transformer, TrCapacity, Phase, Tension


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
transformers = ['PROPIO', 'DISTRIBUIDORA', 'NO']
tr_capacities = [37.5, 50, 75, 112.5]
phases = ['MONOFASICO', 'TRIFASICO']
tensions = [120, 240, 208, 480]

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
