import { STATUS } from '../constants';
import { CUSTOMERS_FETCH_FAILED, CUSTOMERS_FETCHED, CUSTOMERS_FETCHING } from '../actions/customerAction';

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

    }
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
        default:
            return state;
    }
}
