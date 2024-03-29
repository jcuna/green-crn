import { STATUS } from '../constants';
import {
    CUSTOMER_FETCH_FAILED,
    CUSTOMER_FETCHED,
    CUSTOMERS_FETCH_FAILED,
    CUSTOMERS_FETCHED,
    CUSTOMERS_FETCHING,
    CUSTOMER_CURRENT_CLEAR, CUSTOMERS_CLEAR,
    CUSTOMER_DOCUMENT_FETCHED, CUSTOMER_DOCUMENT_CLEAR,
} from '../actions/customerAction';

const initState = {
    status: STATUS.PENDING,
    list: {
        status: STATUS.PENDING,
        page: 1,
        customers: [],
        total_pages: 1,
        searching: false,
    },
    current: {
        id: null,
        first_name: '',
        last_name: '',
        primary_email: '',
        secondary_email: '',
        primary_phone: '',
        secondary_phone: '',
        identification_number: '',
        address: '',
        province: {},
        source_project_id: 1,
        customer_installations: [],
        customer_projects: [],
    },
    document_list: {
        status: STATUS.PENDING,
        list: []
    },
};

export default function customerReducer(state = initState, action) {
    switch (action.type) {
        case CUSTOMERS_FETCHING:
            return { ...state, list: { ...state.list, status: STATUS.TRANSMITTING }};
        case CUSTOMERS_FETCHED:
            return {
                ...state,
                list: {
                    ...state.list,
                    page: action.payload.page,
                    customers: action.payload.list,
                    total_pages: action.payload.total_pages,
                    status: STATUS.COMPLETE,
                }
            };
        case CUSTOMERS_FETCH_FAILED:
            return { ...state, status: STATUS.FAILED };
        case CUSTOMER_FETCHED:
            return { ...state, current: action.payload };
        case CUSTOMER_FETCH_FAILED:
        case CUSTOMER_CURRENT_CLEAR:
            return { ...state, current: { ...initState.current }};
        case CUSTOMERS_CLEAR:
            return { ...state, list: { ...initState.list }};
        case CUSTOMER_DOCUMENT_FETCHED:
            return { ...state, document_list: { status: STATUS.COMPLETE, list: action.payload }};
        case CUSTOMER_DOCUMENT_CLEAR:
            return { ...state, document_list: { ...initState.document_list }};
        default:
            return state;
    }
}
