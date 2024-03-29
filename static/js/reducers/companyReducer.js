import {
    COMPANY_EDITING,
    COMPANY_EDITING_CLEAR,
    COMPANY_FETCHED,
} from '../actions/companyActions';
import { STATUS } from '../constants';

const editingInitState = {
    name: '',
    contact: '',
    address: '',
    logo: '',
    id: '',
};

export default function companyReducer(state = {
    status: STATUS.PENDING,
    editing: editingInitState,
    data: {},
}, action) {
    switch (action.type) {
        case COMPANY_FETCHED:
            return {
                ...state, status: STATUS.COMPLETE, data: action.payload
            };

        case COMPANY_EDITING:
            return {
                ...state, editing: action.payload
            };

        case COMPANY_EDITING_CLEAR:
            return {
                ...state, editing: editingInitState
            };

        default:
            return state;
    }
}

