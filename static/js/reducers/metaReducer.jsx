/**
 * Created by Jon on 10/21/19.
 */

import { STATUS } from '../constants';
import {
    COUNTRIES_FETCHED,
    SOURCE_PROJECTS_FETCHED,
    PROJECT_TYPES_FETCHED,
    PANEL_MODELS_FETCHED,
    INVERTER_MODELS_FETCHED,
    DISTRIBUTORS_FETCHED,
    RATES_FETCHED,
    TRANSFORMERS_FETCHED,
    TR_CAPACITIES_FETCHED,
    PHASES_FETCHED,
    TENSIONS_FETCHED,
    INTEGRATIONS_FETCHED,
} from '../actions/metaActions';

const initState = {
    countries: {
        status: STATUS.PENDING,
        list: []
    },
    source_projects: {
        status: STATUS.PENDING,
        list: []
    },
    project_types: {
        status: STATUS.PENDING,
        list: []
    },
    panel_models: {
        status: STATUS.PENDING,
        list: []
    },
    inverter_models: {
        status: STATUS.PENDING,
        list: []
    },
    distributors: {
        status: STATUS.PENDING,
        list: []
    },
    rates: {
        status: STATUS.PENDING,
        list: []
    },
    transformers: {
        status: STATUS.PENDING,
        list: []
    },
    tr_capacities: {
        status: STATUS.PENDING,
        list: []
    },
    phases: {
        status: STATUS.PENDING,
        list: []
    },
    tensions: {
        status: STATUS.PENDING,
        list: []
    },
    integrations: {
        status: STATUS.PENDING,
        list: []
    },
};

export default function metaReducer(state = initState, action) {
    switch (action.type) {
        case COUNTRIES_FETCHED:
            return { ...state, countries: { status: STATUS.COMPLETE, list: action.payload }};
        case SOURCE_PROJECTS_FETCHED:
            return { ...state, source_projects: { status: STATUS.COMPLETE, list: action.payload }};
        case PROJECT_TYPES_FETCHED:
            return { ...state, project_types: { status: STATUS.COMPLETE, list: action.payload }};
        case PANEL_MODELS_FETCHED:
            return { ...state, panel_models: { status: STATUS.COMPLETE, list: action.payload }};
        case INVERTER_MODELS_FETCHED:
            return { ...state, inverter_models: { status: STATUS.COMPLETE, list: action.payload }};
        case DISTRIBUTORS_FETCHED:
            return { ...state, distributors: { status: STATUS.COMPLETE, list: action.payload }};
        case RATES_FETCHED:
            return { ...state, rates: { status: STATUS.COMPLETE, list: action.payload }};
        case TRANSFORMERS_FETCHED:
            return { ...state, transformers: { status: STATUS.COMPLETE, list: action.payload }};
        case TR_CAPACITIES_FETCHED:
            return { ...state, tr_capacities: { status: STATUS.COMPLETE, list: action.payload }};
        case PHASES_FETCHED:
            return { ...state, phases: { status: STATUS.COMPLETE, list: action.payload }};
        case TENSIONS_FETCHED:
            return { ...state, tensions: { status: STATUS.COMPLETE, list: action.payload }};
        case INTEGRATIONS_FETCHED:
            return { ...state, integrations: { status: STATUS.COMPLETE, list: action.payload }};
        default:
            return state;
    }
}
