import api from '../utils/api';
import token from '../utils/token';
import { clearNotifications, needInstall, notifications, toggleMobileMenu } from './appActions';
import ws from '../utils/ws';
import { ALERTS, GENERIC_ERROR } from '../constants';

export const USER_LOGGING_IN = 'USER_LOGGING_IN';
export const USER_LOGIN_SUCCESS = 'USER_LOGIN_SUCCESS';
export const USER_LOGIN_FAIL = 'USER_LOGIN_FAIL';
export const USER_FETCHING = 'USER_FETCHING';
export const USER_FETCHED = 'USER_FETCHED';
export const USER_MUST_LOGIN = 'USER_MUST_LOGIN';
export const USER_LOGIN_ERROR = 'USER_LOGIN_ERROR';
export const USER_LOGGING_OUT = 'USER_LOGGING_OUT';
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT';
export const USERS_FETCHING = 'USERS_FETCHING';
export const USERS_FETCHED = 'USERS_FETCHED';
export const USERS_SEARCHING = 'USERS_SEARCHING';
export const USERS_SEARCHED = 'USERS_SEARCHED';
export const USERS_FETCH_FAIL = 'USERS_FETCH_FAIL';
export const USER_CREATING = 'USER_CREATING';
export const USER_CREATED = 'USER_CREATED';
export const USER_CREATE_FAIL = 'USER_CREATE_FAIL';
export const USER_DELETE_DISPATCHED = 'USER_DELETE_DISPATCHED';
export const USER_DELETE_SUCCESS = 'USER_DELETE_SUCCESS';
export const USER_DELETE_FAIL = 'USER_DELETE_FAIL';
export const USER_UPDATE_DISPATCHED = 'USER_UPDATE_DISPATCHED';
export const USER_UPDATE_SUCCESS = 'USER_UPDATE_SUCCESS';
export const USER_UPDATE_FAIL = 'USER_UPDATE_FAIL';
export const USER_TOKEN_FETCHED = 'USER_TOKEN_FETCHED';
export const USER_TOKEN_CLEAR = 'USER_TOKEN_CLEAR';
export const USER_WS_CHANGED = 'USER_WS_CHANGED';

export const login = (email, password) => {
    return (dispatch) => {
        dispatch({ type: USER_LOGGING_IN });
        const request = {
            url: '/login',
            method: 'POST',
            headers: { Authorization: 'Basic ' + btoa(email + ':' + password) }
        };

        api(request).then(resp => {
            //the first time we load, we want to make sure we keep current preferences.
            resp.data.user.attributes.preferences.showMobileMenu &&
            dispatch(toggleMobileMenu(resp.data.user.attributes.preferences.showMobileMenu));
            dispatch({
                type: USER_LOGIN_SUCCESS,
                payload: resp.data
            });
            dispatch(clearNotifications());
        }, err => {
            if (err.status < 500) {
                dispatch({
                    type: USER_LOGIN_FAIL,
                    payload: {
                        message: err.error,
                        email,
                        password
                    }
                });
                dispatch(notifications([
                    { type: ALERTS.DANGER, message: 'Nombre de usuario o contraseña no son válidos' }
                ]));
            } else {
                dispatch({
                    type: USER_LOGIN_ERROR,
                    payload: {
                        error: err,
                        email,
                        password,
                    }
                });
                dispatch(notifications([
                    { type: ALERTS.DANGER, message: GENERIC_ERROR }
                ]));
            }
        });
    };
};

export const fetchUser = (success) =>
    (dispatch) => {
        dispatch({ type: USER_FETCHING });
        api({ url: '/user' }).then(resp => {
            success && success(resp.data);
            dispatch({
                type: USER_FETCHED,
                payload: resp.data
            });
        }, err => {
            if (err.status === 501) {
                dispatch({
                    type: USER_MUST_LOGIN,
                    payload: err
                });
                dispatch(needInstall());
            } else if (err.status < 500) {
                dispatch({
                    type: USER_MUST_LOGIN,
                    payload: err
                });
            } else {
                dispatch({
                    type: USER_LOGIN_ERROR,
                    payload: {
                        error: err,
                    }
                });
                dispatch(notifications([
                    { type: ALERTS.DANGER, message: GENERIC_ERROR }
                ]));
            }
        });
    };

/**
 *
 * @returns {Function}
 */
export const logout = () => {
    return (dispatch) => {
        dispatch({ type: USER_LOGGING_OUT });

        api({ url: '/login', method: 'DELETE' }).then(() => {
            dispatch({
                type: USER_LOGGED_OUT,
            });
        }, err => {
            console.warn(err);
        });
    };
};

export const fetchUsers = (page = 1, orderBy = 'id', orderDir = 'asc') => {
    return (dispatch) => {
        dispatch({ type: USERS_FETCHING });

        token.through().then(header => {
            api({
                url: `/users?page=${page}&orderBy=${orderBy}&orderDir=${orderDir}`,
                method: 'GET',
                headers: header
            }).then((resp) => {
                dispatch({
                    type: USERS_FETCHED,
                    payload: resp.data
                });
            }, err => {
                console.warn(err);
                dispatch({
                    type: USERS_FETCH_FAIL,
                });
            });
        }, err => {
            console.warn(err);
            dispatch({
                type: USERS_FETCH_FAIL,
            });
        });
    };
};

export const createUser = (user, success, failed) => {
    user = { ...user, roles: user.roles.map(role => role.id) };

    return (dispatch) => {
        dispatch({ type: USER_CREATING });
        token.through().then(header => {
            api({
                url: '/users',
                method: 'POST',
                headers: header,
            }, user).then(resp => {
                success();
                dispatch({
                    type: USER_CREATED,
                    payload: resp.data
                });
            }, err => {
                failed(err);
                dispatch({ type: USER_CREATE_FAIL });
            });
        });
    };
};

export const deleteUser = (id, done, fail) =>
    (dispatch) => {
        dispatch({ type: USER_DELETE_DISPATCHED });
        token.through().then(header =>
            api({
                url: `/users/${id}`,
                method: 'DELETE',
                headers: header
            }).then(() => {
                done();
                dispatch({ type: USER_DELETE_SUCCESS });
            }, () => {
                fail();
                dispatch({ type: USER_DELETE_FAIL });
            })
        );
    };

export const editUser = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: USER_DELETE_DISPATCHED });
        token.through().then(header =>
            api({
                url: `/users/${data.id}`,
                method: 'PUT',
                headers: header
            }, data).then(() => {
                success();
                dispatch({ type: USER_UPDATE_SUCCESS });
            }, () => {
                fail();
                dispatch({ type: USER_UPDATE_FAIL });
            })
        );
    };

export const validateUserToken = (userToken) =>
    (dispatch) => api({
        url: `/user-tokens/${userToken}`,
        method: 'GET'
    }).then(resp => dispatch({ type: USER_TOKEN_FETCHED, payload: resp.data }));

export const clearUserToken = () =>
    (dispatch) => dispatch({ type: USER_TOKEN_CLEAR });

export const listenUserChanges = (userId) =>
    (dispatch) =>
        ws(USER_WS_CHANGED, `/${userId}`, () => {
            dispatch(fetchUser());
        });

export const updatePassword = (passwordObj, success, failed) =>
    () => api({
        url: '/account/activate-pass',
        method: 'POST'
    }, passwordObj).then(success, failed);

export const searchUsers = (q, resolve, reject) =>
    (dispatch) => {
        dispatch({ type: USERS_SEARCHING });
        token.through().then(header => api({
            url: `/users?query=${q}`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            resolve(resp.data);
            dispatch({ type: USERS_SEARCHED });
        }, (err) => {
            reject(err);
            dispatch({ type: USERS_SEARCHED });
        }), reject);
    };

/**
 * No need to dispatch anything since web socket listeners have been activated
 *
 * @param {object} data
 * @param {function=} success
 * @param {function=} failed
 * @returns {function(): Promise<any | never>}
 */
export const updateMyUser = (data, success, failed) =>
    () => token.through().then(header => api({
        url: '/user',
        method: 'PUT',
        headers: header,
    }, data).then(success, failed), failed);
