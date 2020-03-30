import api from '../utils/api';
import token from '../utils/token';

export const COUNTRIES_FETCHED = 'COUNTRIES_FETCHED';
export const COUNTRIES_FAILED = 'COUNTRIES_FAILED';
export const SOURCE_PROJECTS_FETCHED = 'SOURCE_PROJECTS_FETCHED';
export const SOURCE_PROJECTS_FAILED = 'SOURCE_PROJECTS_FAILED';
export const PROJECT_TYPES_FETCHED = 'PROJECT_TYPES_FETCHED';
export const PROJECT_TYPES_FAILED = 'PROJECT_TYPES_FAILED';
export const PANEL_MODELS_FETCHED = 'PANEL_MODELS_FETCHED';
export const PANEL_MODELS_FAILED = 'PANEL_MODELS_FAILED';
export const INVERTER_MODELS_FETCHED = 'INVERTER_MODELS_FETCHED';
export const INVERTER_MODELS_FAILED = 'INVERTER_MODELS_FAILED';
export const DISTRIBUTORS_FETCHED = 'DISTRIBUTORS_FETCHED';
export const DISTRIBUTORS_FAILED = 'DISTRIBUTORS_FAILED';
export const RATES_FETCHED = 'RATES_FETCHED';
export const RATES_FAILED = 'RATES_FAILED';
export const TRANSFORMERS_FETCHED = 'TRANSFORMERS_FETCHED';
export const TRANSFORMERS_FAILED = 'TRANSFORMERS_FAILED';
export const TR_CAPACITIES_FETCHED = 'TR_CAPACITIES_FETCHED';
export const TR_CAPACITIES_FAILED = 'TR_CAPACITIES_FAILED';
export const PHASES_FETCHED = 'PHASES_FETCHED';
export const PHASES_FAILED = 'PHASES_FAILED';
export const TENSIONS_FETCHED = 'TENSIONS_FETCHED';
export const TENSIONS_FAILED = 'TENSIONS_FAILED';
export const INTEGRATIONS_FETCHED = 'INTEGRATIONS_FETCHED';
export const INTEGRATIONS_FAILED = 'INTEGRATIONS_FAILED';
export const DOCUMENT_CATEGORIES_FETCHED = 'DOCUMENT_CATEGORIES_FETCHED';
export const DOCUMENT_CATEGORIES_FAILED = 'DOCUMENT_CATEGORIES_FAILED';
export const DOCUMENT_TYPES_FETCHED = 'DOCUMENT_TYPES_FETCHED';
export const DOCUMENT_TYPES_FAILED = 'DOCUMENT_TYPES_FAILED';
export const SALE_TYPES_FETCHED = 'SALE_TYPES_FETCHED';
export const SALE_TYPES_FAILED = 'SALE_TYPES_FAILED';

export const fetchCountries = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/countries', headers: auth }).then(resp =>
        dispatch({ type: COUNTRIES_FETCHED, payload: resp.data }), dispatch({ type: COUNTRIES_FAILED })));
export const fetchSourceProjects = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/source-projects', headers: auth }).then(resp =>
        dispatch({ type: SOURCE_PROJECTS_FETCHED, payload: resp.data }), dispatch({ type: SOURCE_PROJECTS_FAILED })));
export const fetchProjectTypes = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/project-types', headers: auth }).then(resp =>
        dispatch({ type: PROJECT_TYPES_FETCHED, payload: resp.data }), dispatch({ type: PROJECT_TYPES_FAILED })));
export const fetchPanelModels = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/panel-models', headers: auth }).then(resp =>
        dispatch({ type: PANEL_MODELS_FETCHED, payload: resp.data }), dispatch({ type: PANEL_MODELS_FAILED })));
export const fetchInverterModels = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/inverter-models', headers: auth }).then(resp =>
        dispatch({ type: INVERTER_MODELS_FETCHED, payload: resp.data }), dispatch({ type: INVERTER_MODELS_FAILED })));
export const fetchDistributors = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/distributors', headers: auth }).then(resp =>
        dispatch({ type: DISTRIBUTORS_FETCHED, payload: resp.data }), dispatch({ type: DISTRIBUTORS_FAILED })));
export const fetchRates = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/rates', headers: auth }).then(resp =>
        dispatch({ type: RATES_FETCHED, payload: resp.data }), dispatch({ type: RATES_FAILED })));
export const fetchTransformers = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/transformers', headers: auth }).then(resp =>
        dispatch({ type: TRANSFORMERS_FETCHED, payload: resp.data }), dispatch({ type: TRANSFORMERS_FAILED })));
export const fetchTrCapacities = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/tr-capacities', headers: auth }).then(resp =>
        dispatch({ type: TR_CAPACITIES_FETCHED, payload: resp.data }), dispatch({ type: TR_CAPACITIES_FAILED })));
export const fetchPhases = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/phases', headers: auth }).then(resp =>
        dispatch({ type: PHASES_FETCHED, payload: resp.data }), dispatch({ type: PHASES_FAILED })));
export const fetchTensions = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/tensions', headers: auth }).then(resp =>
        dispatch({ type: TENSIONS_FETCHED, payload: resp.data }), dispatch({ type: TENSIONS_FAILED })));
export const fetchIntegrations = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/integrations', headers: auth }).then(resp =>
        dispatch({ type: INTEGRATIONS_FETCHED, payload: resp.data }), dispatch({ type: INTEGRATIONS_FAILED })));
export const fetchDocumentCategories = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/document-categories', headers: auth }).then(resp =>
        dispatch({ type: DOCUMENT_CATEGORIES_FETCHED, payload: resp.data }), dispatch({ type: DOCUMENT_CATEGORIES_FAILED })));
export const fetchDocumentTypes = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/document-types', headers: auth }).then(resp =>
        dispatch({ type: DOCUMENT_TYPES_FETCHED, payload: resp.data }), dispatch({ type: DOCUMENT_TYPES_FAILED })));
export const fetchSaleTypes = () =>
    (dispatch) => token.through().then(auth => api({ url: '/meta/sale-types', headers: auth }).then(resp =>
        dispatch({ type: SALE_TYPES_FETCHED, payload: resp.data }), dispatch({ type: SALE_TYPES_FAILED })));
