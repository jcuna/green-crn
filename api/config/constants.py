# customer setup required documents per section
# This will need to be rethought to be created on demand
# and make use of global variables and local substitution variables

from dal.customer import Country, Province, SourceProject, ProjectType, PanelModel, InverterModel, Distributor, Rate, \
    Transformer, TrCapacity, Phase, Tension, Integration, Status, FinancialEntity

DOCUMENTS_SECTION_CLIENT = {
    'category': 'Cliente',
    'name': [
        'CEDULA',
        'RNC',
        'ASAMBLEA',
        'REGISTRO MERCANTIL',
    ]
}

DOCUMENTS_SECTION_LEGAL = {
    'category': 'Legal',
    'name': [
        'TITULO DE PROPIEDAD',
        'CONTRATO DE ALQUILER',
        'FACTURA ELECTRICA',
        'COTIZACIONES',  # multiple estimates
        'COTIZACION PFA',  # final estimate
        'FORM. CONOCE A TU CLIENTE ENESTAR',
        'FORM. CONOCE A TU CLIENTE ASEGURADORA',
        'CONTRATO DE ENESTAR',
        'CARTA COMPROMISO ITBIS',
        'SERIALES DE EQUIPOS',
        'DOCUMENTO DE RECEPCION DEL SISTEMA',
        'ANEXO LIBRE - NOMBRE/DOCUMENTO',
    ]
}
DOCUMENTS_SECTION_DISTRIBUTOR = {
    'category': 'Distribuidor',
        'name': [
        'ANEXO A',
        'ANEXO B',
        'ULTIMA FACTURA ELECTRICA',
        'CARTA DE AUTORIZACION',
        'DIAGRAMA UNIFILAR',
        'POLIZA RC',
        'CARTA DE DESCRIPCION DE FINALIZACION',
        'CARTA DE NO OBJECION',
        'CARTA DE ACUERDO DE INTERCONEXION',
        'ACUERDO DE INTERCONEXION',
        'ACUERDO DE MEDICION NETA',
        'CARTA DE GARANTIA DE EQUIPOS',
        'CARTA DEL MEDIDOR',
        'CARTA AUTORIZACION DEL INGENIERO',
    ]
}

DOCUMENTS_SECTION_CNE = {
    'category': 'CNE',
        'name': [
        'FORMULARIO FO-DIL 003',
        'FORMULARIO FO-DIL 005',
        'COTIZACION HACIENDA',
        'HOJA DE DATOS',
        'RESOLUCION CNE DE ITBIS',
        'APROBACION DGI ITBIS',
        'FACTURA DEL PROYECTO',
        'RESOLUCION CNE DE CF',
        'APROBACION 1 DGI CF',
        'APROBACION 2 DGI CF',
        'APROBACION 3 DGI CF',
        'NEGACIONES',
        'CARTAS DE REINTRODUCCION',
        'COMPROBANTES DE PAGO',
        'CARTAS SOLICITUDES',
    ]
}

OTHER = {
    'category': 'Otro',
    'name': []
}

DOCUMENT_CATEGORIES = [
    item['category'] for item in
    [OTHER, DOCUMENTS_SECTION_CLIENT, DOCUMENTS_SECTION_LEGAL, DOCUMENTS_SECTION_DISTRIBUTOR, DOCUMENTS_SECTION_CNE]
]


updatable_lists = [
    Country,
    Province,
    SourceProject,
    ProjectType,
    PanelModel,
    InverterModel,
    Distributor,
    Rate,
    Transformer,
    TrCapacity,
    Phase,
    Tension,
    Integration,
    Status,
    FinancialEntity
]
