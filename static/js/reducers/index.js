import { combineReducers } from 'redux';
import appReducer from './appReducer';
import userReducer from './userReducer';
import rolesReducer from './rolesReducer';
import companyReducer from './companyReducer';
import metaReducer from './metaReducer';

export default combineReducers({
    app: appReducer,
    user: userReducer,
    roles: rolesReducer,
    company: companyReducer,
    meta: metaReducer,
});
