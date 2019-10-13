import api from '../utils/api';
import token from '../utils/token';
export const COMPANY_UPDATING = 'COMPANY_UPDATING';
export const COMPANY_UPDATED = 'COMPANY_UPDATED';
export const COMPANY_CREATING = 'COMPANY_CREATING';
export const COMPANY_CREATED = 'COMPANY_CREATED';
export const COMPANY_FETCHING = 'COMPANY_FETCHING';
export const COMPANY_FETCHED = 'COMPANY_FETCHED';
export const COMPANY_FETCHED_FAIL = 'COMPANY_FETCHED_FAIL';
export const COMPANY_REQUIRED = 'COMPANY_REQUIRED';
export const COMPANY_EDITING = 'COMPANY_EDITING';
export const COMPANY_EDITING_CLEAR = 'COMPANY_EDITING_CLEAR';

export const fetchCompany = (fail) =>
    (dispatch) => {
        dispatch({ type: COMPANY_FETCHING });
        token.through().then(header =>
            api({
                url: `/projects`,
                method: 'GET',
                headers: header
            }).then((resp) => {
                dispatch({ type: COMPANY_FETCHED, payload: resp.data });
            }, err => {
                fail && fail(err);
                dispatch({ type: COMPANY_FETCHED_FAIL });
            })
        );
    };

export const createProject = (data, success) =>
    (dispatch) => {
        dispatch({ type: COMPANY_CREATING });
        token.through().then(header =>
            api({
                url: `/projects`,
                method: 'POST',
                headers: header
            }, data).then((resp) => {
                success(resp);
                dispatch({ type: COMPANY_CREATED, payload: { ...data, id: resp.id }});
            }));
    };

export const updateProject = (data, success) =>
    (dispatch) => {
        dispatch({ type: COMPANY_UPDATING });
        token.through().then(header =>
            api({
                url: `/projects/${data.id}`,
                method: 'PUT',
                headers: header
            }, data).then((resp) => {
                success(resp);
                dispatch({ type: COMPANY_UPDATED, payload: { id: resp.id }});
            })
        );
    };

export const editProject = (project) =>
    (dispatch) => {
        dispatch({ type: COMPANY_EDITING, payload: project });
    };

export const clearProjectEditing = () =>
    (dispatch) => {
        dispatch({ type: COMPANY_EDITING_CLEAR });
    };

