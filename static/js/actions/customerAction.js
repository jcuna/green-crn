import api from '../utils/api';
import token from '../utils/token';

export const CUSTOMERS_FETCHED = 'CUSTOMERS_FETCHED';
export const CUSTOMERS_FETCHING = 'CUSTOMERS_FETCHING';
export const CUSTOMERS_FETCH_FAILED = 'CUSTOMERS_FETCH_FAILED';
export const CUSTOMERS_CLEAR = 'CUSTOMERS_CLEAR';
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


export const CUSTOMER_PROJECT_FETCHED = 'CUSTOMER_PROJECT_FETCHED';
export const CUSTOMER_PROJECT_FETCHING = 'CUSTOMER_PROJECT_FETCHING';
export const CUSTOMER_PROJECT_FETCH_FAILED = 'CUSTOMER_PROJECT_FETCH_FAILED';
export const CUSTOMER_PROJECT_CREATED = 'CUSTOMER_PROJECT_CREATED';
export const CUSTOMER_PROJECT_CREATING = 'CUSTOMER_PROJECT_CREATING';
export const CUSTOMER_PROJECT_CREATION_FAILED = 'CUSTOMER_PROJECT_CREATION_FAILED';
export const CUSTOMER_PROJECT_UPDATED = 'CUSTOMER_PROJECT_UPDATED';
export const CUSTOMER_PROJECT_UPDATING = 'CUSTOMER_PROJECT_UPDATING';
export const CUSTOMER_PROJECT_UPDATE_FAILED = 'CUSTOMER_PROJECT_UPDATE_FAILED';
export const CUSTOMERS_PROJECT_CLEAR = 'CUSTOMERS_PROJECT_CLEAR';
export const CUSTOMER_PROJECT_CURRENT_CLEAR = 'CUSTOMER_PROJECT_CURRENT_CLEAR';

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

export const clearCurrentCustomer = () =>
    (dispatch) => dispatch({ type: CUSTOMER_CURRENT_CLEAR });

export const clearCustomers = () =>
    (dispatch) => dispatch({ type: CUSTOMERS_CLEAR });


export const fetchCustomerProject = (id, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_PROJECT_FETCHING });
        token.through().then(header => api({
            url: `/customers/projects/${id}`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: CUSTOMER_PROJECT_FETCHED, payload: resp.data });
            success && success();
        }, err => {
            dispatch({ type: CUSTOMER_PROJECT_FETCH_FAILED, payload: err });
            fail && fail(err);
        }));
    };

export const createCustomerProject = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_PROJECT_CREATING });
        writeCustomer('POST', data, '/customers/projects').then(resp => {
            dispatch({ type: CUSTOMER_PROJECT_CREATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_PROJECT_CREATION_FAILED, payload: err });
            fail && fail(err);
        });
    };

export const updateCustomerProject = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_PROJECT_UPDATING });
        writeCustomer('PUT', data, `/customers/projects/${data.id}`).then(resp => {
            dispatch({ type: CUSTOMER_PROJECT_UPDATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_PROJECT_UPDATE_FAILED, payload: err });
            fail && fail(err);
        });
    };


export const clearCurrentCustomerProject = () =>
    (dispatch) => dispatch({ type: CUSTOMER_PROJECT_CURRENT_CLEAR });

export const clearCustomersProject = () =>
    (dispatch) => dispatch({ type: CUSTOMERS_PROJECT_CLEAR });