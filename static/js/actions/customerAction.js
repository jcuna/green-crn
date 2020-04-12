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

export const CUSTOMER_INSTALLATION_CREATED = 'CUSTOMER_INSTALLATION_CREATED';
export const CUSTOMER_INSTALLATION_UPDATING = 'CUSTOMER_INSTALLATION_UPDATING';
export const CUSTOMER_INSTALLATION_UPDATED = 'CUSTOMER_INSTALLATION_UPDATED';
export const CUSTOMER_INSTALLATION_UPDATE_FAILED = 'CUSTOMER_INSTALLATION_UPDATE_FAILED';
export const CUSTOMER_INSTALLATION_CREATING = 'CUSTOMER_INSTALLATION_CREATING';
export const CUSTOMER_INSTALLATION_CREATION_FAILED = 'CUSTOMER_INSTALLATION_CREATION_FAILED';
export const CUSTOMER_INSTALLATION_CLEAR = 'CUSTOMERS_INSTALLATION_CLEAR';

export const CUSTOMER_FINANCIAL_INFO_CREATED = 'CUSTOMER_FINANCIAL_INFO_CREATED';
export const CUSTOMER_FINANCIAL_INFO_CREATING = 'CUSTOMER_FINANCIAL_INFO_CREATING';
export const CUSTOMER_FINANCIAL_INFO_CREATION_FAILED = 'CUSTOMER_FINANCIAL_INFO_CREATION_FAILED';
export const CUSTOMER_FINANCIAL_INFO_UPDATING = 'CUSTOMER_FINANCIAL_INFO_UPDATING';
export const CUSTOMER_FINANCIAL_INFO_UPDATED = 'CUSTOMER_FINANCIAL_INFO_UPDATED';
export const CUSTOMER_FINANCIAL_INFO_UPDATE_FAILED = 'CUSTOMER_FINANCIAL_INFO_UPDATE_FAILED';
export const CUSTOMER_FINANCIAL_INFO_CLEAR = 'CUSTOMER_FINANCIAL_INFO_CLEAR';
export const CUSTOMER_INSTALLATION_STATUS_UPDATING = 'CUSTOMER_INSTALLATION_STATUS_UPDATING';
export const CUSTOMER_INSTALLATION_STATUS_UPDATED = 'CUSTOMER_INSTALLATION_STATUS_UPDATED';
export const CUSTOMER_INSTALLATION_STATUS__UPDATE_FAILED = 'CUSTOMER_INSTALLATION_STATUS__UPDATE_FAILED';

export const CUSTOMER_DOCUMENT_FETCHED = 'CUSTOMER_DOCUMENT_FETCHED';
export const CUSTOMER_DOCUMENT_FETCHING = 'CUSTOMER_DOCUMENT_FETCHING';
export const CUSTOMER_DOCUMENT_FETCH_FAILED = 'CUSTOMER_DOCUMENT_FETCH_FAILED';
export const CUSTOMER_DOCUMENT_CREATED = 'CUSTOMER_DOCUMENT_CREATED';
export const CUSTOMER_DOCUMENT_CREATING = 'CUSTOMER_DOCUMENT_CREATING';
export const CUSTOMER_DOCUMENT_CREATION_FAILED = 'CUSTOMER_DOCUMENT_CREATION_FAILED';
export const CUSTOMER_DOCUMENT_CLEAR = 'CUSTOMERS_DOCUMENT_CLEAR';
export const CUSTOMER_DOCUMENT_DELETED = 'CUSTOMER_DOCUMENT_DELETED';
export const CUSTOMER_DOCUMENT_DELETING = 'CUSTOMER_DOCUMENT_DELETING';
export const CUSTOMER_DOCUMENT_DELETE_FAILED = 'CUSTOMER_DOCUMENT_DELETE_FAILED';

const writeCustomer = (method, data, url) => {
    return token.through().then(header => api({
        url,
        method,
        headers: header,
    }, data));
};

const writeDocument = (method, data, url) => {
    return token.through().then(header => api({
        url,
        method,
        headers: header,
    }, data, true));
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

export const fetchCustomer = (id, success, fail, useData) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_FETCHING });
        token.through().then(header => api({
            url: `/customers/${id}`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: CUSTOMER_FETCHED, payload: resp.data });
            if (typeof useData !== 'undefined') {
                success && success(resp.data);
            } else {
                success && success();
            }
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

export const createCustomerInstallation = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_INSTALLATION_CREATING });
        writeCustomer('POST', data, '/customers/installations').then(resp => {
            dispatch({ type: CUSTOMER_INSTALLATION_CREATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_INSTALLATION_CREATION_FAILED, payload: err });
            fail && fail(err);
        });
    };

export const updateCustomerInstallation = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_INSTALLATION_UPDATING });
        writeCustomer('PUT', data, `/customers/installations/${data.id}`).then(resp => {
            dispatch({ type: CUSTOMER_INSTALLATION_UPDATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_INSTALLATION_UPDATE_FAILED, payload: err });
            fail && fail(err);
        });
    };

export const clearCustomersInstallation = () =>
    (dispatch) => dispatch({ type: CUSTOMER_INSTALLATION_CLEAR });

export const createCustomerDocument = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_DOCUMENT_CREATING });
        writeDocument('POST', data, '/customers/documents').then(resp => {
            dispatch({ type: CUSTOMER_DOCUMENT_CREATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_DOCUMENT_CREATION_FAILED, payload: err });
            fail && fail(err);
        });
    };

export const clearCustomerDocument = () =>
    (dispatch) => dispatch({ type: CUSTOMER_DOCUMENT_CLEAR });

export const fetchCustomerDocument = (id, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_DOCUMENT_FETCHING });
        token.through().then(header => api({
            url: `/customers/documents/${ id }`,
            method: 'GET',
            headers: header,
        }).then(resp => {
            dispatch({ type: CUSTOMER_DOCUMENT_FETCHED, payload: resp.data });
            success && success(resp);
        }, err => {
            dispatch({ type: CUSTOMER_DOCUMENT_FETCH_FAILED, payload: err });
            fail && fail(err);
        }));
    };

export const deleteCustomerDocument = (id, object_key, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_DOCUMENT_DELETING });
        token.through().then(header => api({
            url: `/customers/documents/${ id }`,
            method: 'DELETE',
            headers: header,
        }, { object_key }).then(resp => {
            dispatch({ type: CUSTOMER_DOCUMENT_DELETED });
            success && success(resp);
        }, err => {
            dispatch({ type: CUSTOMER_DOCUMENT_DELETE_FAILED, payload: err });
            fail && fail(err);
        }));
    };

export const createCustomerFinancial = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_FINANCIAL_INFO_CREATING });
        writeCustomer('POST', data, '/customers/installations/financing').then(resp => {
            dispatch({ type: CUSTOMER_FINANCIAL_INFO_CREATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_FINANCIAL_INFO_CREATION_FAILED, payload: err });
            fail && fail(err);
        });
    };

export const updateCustomerFinancial = (data, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_FINANCIAL_INFO_UPDATING });
        writeCustomer('PUT', data, `/customers/installations/financing/${data.installation_id}`).then(resp => {
            dispatch({ type: CUSTOMER_FINANCIAL_INFO_UPDATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_FINANCIAL_INFO_UPDATE_FAILED, payload: err });
            fail && fail(err);
        });
    };

export const updateInstallationStatus = (data, installation_id, success, fail) =>
    (dispatch) => {
        dispatch({ type: CUSTOMER_INSTALLATION_STATUS_UPDATING });
        writeCustomer('PUT', data, `/customers/installations/status/${installation_id}`).then(resp => {
            dispatch({ type: CUSTOMER_INSTALLATION_STATUS_UPDATED, payload: resp.data });
            success && success(resp.data);
        }, err => {
            dispatch({ type: CUSTOMER_INSTALLATION_STATUS__UPDATE_FAILED, payload: err });
            fail && fail(err);
        });
    };
