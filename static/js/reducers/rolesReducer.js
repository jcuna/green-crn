import {
    ROLE_CREATE_SUCCESS, ROLES_FETCHING, ROLES_FETCHED, ROLES_FAIL,
    PERMISSIONS_FETCHED, PERMISSIONS_COMMIT, ROLE_DELETE_SUCCESS, ROLE_DELETE_FAIL, ROLE_CREATE_DISPATCHED,
    ROLE_DELETE_DISPATCHED, PERMISSIONS_COMMIT_FAIL,
} from '../actions/roleActions';
import { STATUS } from '../constants';

const rolesCompare = function (a, b) {
    if (a.name < b.name) {
        return -1;
    } else if (a.name > b.name) {
        return 1;
    }
    return 0;
};

const getUpdatedRolesPermissions = function (state, payload) {
    const assigned = [];

    state.roles.assigned.forEach(item => {
        if (item.id === payload.id) {
            assigned.push({
                id: item.id,
                name: item.name,
                permissions: payload.permissions,
            });
        } else {
            assigned.push(item);
        }
    });
    return assigned;
};

export default function rolesReducer(state = {
    roles: {
        assigned: [],
        status: STATUS.PENDING,
        permissions: {},
        processing: false,
    },
}, action) {
    switch (action.type) {
        case ROLES_FETCHED:
            const roles = action.payload.sort(rolesCompare);

            return { ...state, roles: { ...state.roles, assigned: roles, status: STATUS.PROCESSED }};
        case ROLES_FETCHING:
            return { ...state, roles: { ...state.roles, status: STATUS.TRANSMITTING }};
        case ROLES_FAIL:
            return { ...state, roles: { ...state.roles, status: STATUS.PENDING }};
        case ROLE_CREATE_DISPATCHED:
            return { ...state, roles: { ...state.roles, processing: true }};
        case ROLE_CREATE_SUCCESS:
            const data = state.roles.assigned.slice();

            data.push(action.payload);
            return { ...state, roles: { ...state.roles, assigned: data.sort(rolesCompare), processing: false }};
        case PERMISSIONS_FETCHED:
            return { ...state, roles: { ...state.roles, permissions: action.payload }};
        case PERMISSIONS_COMMIT:
            const assigned = getUpdatedRolesPermissions(state, action.payload);

            return { ...state, roles: { ...state.roles, assigned, processing: false }};
        case PERMISSIONS_COMMIT_FAIL:
            return { ...state, roles: { ...state.roles, processing: false }};
        case ROLE_DELETE_DISPATCHED:
            return { ...state, roles: { ...state.roles, processing: true }};
        case ROLE_DELETE_SUCCESS:
            const assignedRoles = [];

            state.roles.assigned.forEach(r => {
                if (r.id !== action.payload) {
                    assignedRoles.push(r);
                }
            });
            return { ...state, roles: { ...state.roles, assigned: assignedRoles, processing: false }};
        case ROLE_DELETE_FAIL:
            return { ...state, roles: { ...state.roles, processing: false }};
        default:
            return state;
    }
}
