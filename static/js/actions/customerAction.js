import api from '../utils/api';
import token from '../utils/token';

export const CUSTOMERS_FETCHED = 'CUSTOMERS_FETCHED';
export const CUSTOMERS_FETCHING = 'CUSTOMERS_FETCHING';
export const CUSTOMERS_FETCH_FAILED = 'CUSTOMERS_FETCH_FAILED';
export const CUSTOMER_CREATED = 'CUSTOMER_CREATED';
export const CUSTOMER_CREATING = 'CUSTOMER_CREATING';
export const CUSTOMER_CREATION_FAILED = 'CUSTOMER_CREATION_FAILED';
export const CUSTOMER_FETCHED = 'CUSTOMER_FETCHED';

export const createCustomer = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_CREATING });
        token.through().then(header => api({
            url: '/customers',
            method: 'POST',
            headers: header,
        }, data).then(resp => {
            dispatch({ type: CUSTOMER_CREATED, payload: resp.data });
            success && success();
        }, err => {
            dispatch({ type: CUSTOMER_CREATION_FAILED, payload: err });
            fail && fail(err);
        }));
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
