import api from '../utils/api';
import token from '../utils/token';

export const CUSTOMERS_FETCHED = 'CUSTOMERS_FETCHED';
export const CUSTOMERS_FETCHING = 'CUSTOMERS_FETCHING';
export const CUSTOMERS_FETCH_FAILED = 'CUSTOMERS_FETCH_FAILED';
export const CUSTOMER_CREATED = 'CUSTOMER_CREATED';
export const CUSTOMER_CREATING = 'CUSTOMER_CREATING';
export const CUSTOMER_CREATION_FAILED = 'CUSTOMER_CREATION_FAILED';
export const CUSTOMER_FETCHED = 'CUSTOMER_FETCHED';
export const CUSTOMER_FETCHING = 'CUSTOMER_FETCHING';
export const CUSTOMER_FETCH_FAILED = 'CUSTOMER_FETCH_FAILED';
export const CUSTOMER_CURRENT_CLEAR = 'CUSTOMER_CURRENT_CLEAR';
export const CUSTOMER_UPDATED = 'CUSTOMER_UPDATED';
export const CUSTOMER_UPDATING = 'CUSTOMER_UPDATING';
export const CUSTOMER_UPDATE_FAILED = 'CUSTOMER_UPDATE_FAILED';

const writeCustomer = (method, data, url) => {
    return token.through().then(header => api({
        url,
        method,
        headers: header,
    }, data));
};

export const createCustomer = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_CREATING });
        writeCustomer('POST', data, '/customers').then(resp => {
            dispatch({ type: CUSTOMER_CREATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_CREATION_FAILED, payload: err });
            fail && fail(err);
        });
    };

export const updateCustomer = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_UPDATING });
        writeCustomer('PUT', data, `/customers/${data.id}`).then(resp => {
            dispatch({ type: CUSTOMER_UPDATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_UPDATE_FAILED, payload: err });
            fail && fail(err);
        });
    };

export const fetchCustomers = (success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMERS_FETCHING });
        token.through().then(header => api({
            url: '/customers',
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: CUSTOMERS_FETCHED, payload: resp.data });
            success && success();
        }, err => {
            dispatch({ type: CUSTOMERS_FETCH_FAILED, payload: err });
            fail && fail(err);
        }));
    };

export const fetchCustomer = (id, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_FETCHING });
        token.through().then(header => api({
            url: `/customers/${id}`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: CUSTOMER_FETCHED, payload: resp.data });
            success && success();
        }, err => {
            dispatch({ type: CUSTOMER_FETCH_FAILED, payload: err });
            fail && fail(err);
        }));
    };

export const clearCurrentCustomer = (data) =>
    (dispatch) => dispatch({ type: CUSTOMER_CURRENT_CLEAR, payload: data });
