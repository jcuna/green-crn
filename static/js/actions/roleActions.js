import api from '../utils/api';
import token from '../utils/token';
import { hideOverlay, notifications } from './appActions';
import ws from '../utils/ws';
import { fetchUser } from './userActions';
import { ALERTS, GENERIC_ERROR } from '../constants';

export const ROLES_FETCHING = 'ROLES_FETCHING';
export const ROLES_FETCHED = 'ROLES_FETCHED';
export const ROLES_FAIL = 'ROLES_FAIL';
export const ROLE_CREATE_SUCCESS = 'ROLE_CREATE_SUCCESS';
export const ROLE_DELETE_SUCCESS = 'ROLE_DELETE_SUCCESS';
export const ROLE_DELETE_DISPATCHED = 'ROLE_DELETE_DISPATCHED';
export const ROLE_DELETE_FAIL = 'ROLE_DELETE_FAIL';
export const ROLE_CREATE_DISPATCHED = 'ROLE_CREATE_DISPATCHED';
export const ROLE_CREATE_FAIL = 'ROLE_CREATE_FAIL';
export const ROLE_WS_CHANGED = 'ROLE_WS_CHANGED';
export const PERMISSIONS_FETCHING = 'PERMISSIONS_FETCHING';
export const PERMISSIONS_FETCHED = 'PERMISSIONS_FETCHED';
export const PERMISSIONS_COMMIT = 'PERMISSIONS_COMMIT';
export const PERMISSIONS_COMMIT_FAIL = 'PERMISSIONS_COMMIT_FAIL';

export const createRole = (name) =>
    (dispatch) => {
        dispatch({ type: ROLE_CREATE_DISPATCHED });
        token.through().then(header => {
            api({
                url: '/roles',
                method: 'POST',
                headers: header,
            }, name).then(resp => {
                dispatch({
                    type: ROLE_CREATE_SUCCESS,
                    payload: resp.data,
                });
            }, err => {
                dispatch({
                    type: ROLE_CREATE_FAIL,
                    payload: err,
                });
            });
        });
    };

export const deleteRole = (id) =>
    (dispatch) => {
        dispatch({ type: ROLE_DELETE_DISPATCHED });
        token.through().then(auth => api({
            url: '/roles',
            method: 'DELETE',
            headers: auth,
        }, id).then(() => {
            dispatch({
                type: ROLE_DELETE_SUCCESS,
                payload: id,
            });
            dispatch(hideOverlay());
            dispatch(notifications([{
                type: ALERTS.INFO,
                message: 'Role borrado correctamente.',
            }]));
        }, (err) => {
            dispatch(hideOverlay());
            if (err.status < 500) {
                let message = 'No tienes accesso a borrar roles';

                if (err.status === 409) {
                    message = 'No puedes borrar un rol que ha sido asignado a un usuario, ' +
                        'primero quitale el rol al usuario.';
                }
                dispatch({ type: ROLE_DELETE_FAIL });
                dispatch(notifications({ type: ALERTS.WARNING, message, }));
            } else {
                dispatch({ type: ROLE_DELETE_FAIL });
                dispatch(notifications({ type: ALERTS.WARNING, message: GENERIC_ERROR }));
            }
        }));
    };

export const fetchRoles = () =>
    (dispatch) => {
        dispatch({ type: ROLES_FETCHING });
        token.through().then(header => api({
            url: '/roles',
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({
                type: ROLES_FETCHED,
                payload: resp.data,
            });
        }, err => {
            dispatch({ type: ROLES_FAIL, payload: err });
        }), err => dispatch({ type: ROLES_FAIL, payload: err }));
    };

export const fetchPermissions = () =>
    (dispatch) => {
        dispatch({ type: PERMISSIONS_FETCHING });
        token.through().then(header => {
            api({
                url: '/permissions',
                method: 'GET',
                headers: header,
            }).then(resp => {
                dispatch({
                    type: PERMISSIONS_FETCHED,
                    payload: resp.data,
                });
            }, err => {
                console.log(err);
            });
        }, err => {
            console.log(err);
        });
    };

export const commitPermissions = (permissions) =>
    (dispatch) => {
        dispatch({ type: ROLE_CREATE_DISPATCHED });
        token.through().then(header => api({
            url: '/roles',
            method: 'PUT',
            headers: header,
        }, permissions).then(() => {
            dispatch({
                type: PERMISSIONS_COMMIT,
                payload: permissions,
            });
            dispatch(notifications([{
                type: ALERTS.SUCCESS,
                message: 'Acceso actualizado correctamente.',
            }]));
            dispatch(hideOverlay());
        }, () => {
            dispatch({ type: PERMISSIONS_COMMIT_FAIL });
            dispatch(notifications([{
                type: ALERTS.WARNING,
                message: 'No se pudo aplicar el cambio.',
            }]));
        }));
    };

export const listenRoleChanges = options =>
    (dispatch) =>
        options.roles.forEach(roleName => {
            ws(ROLE_WS_CHANGED, `/${roleName}`, () => {
                if (options.shouldFetch) {
                    dispatch(fetchRoles());
                }
                dispatch(fetchUser());
            });
        });
