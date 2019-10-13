/**
 * Created by Jon on 1/2/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, STATUS } from '../../constants';
import Spinner from '../../utils/Spinner';
import { notifications } from '../../actions/appActions';
import Route from 'react-router-dom/es/Route';
import Redirect from 'react-router-dom/es/Redirect';
import { hasAccess } from '../../utils/config';
import ErrorPage from '../ErrorPage';

export default class RequiresCompany extends React.Component {
    componentDidMount() {
        const { projects, dispatch, user } = this.props;

        if (!RequiresCompany.hasSelectedProject(user) && projects.status !== STATUS.PENDING) {
            dispatch(notifications({
                type: ALERTS.WARNING,
                message: 'Debe seleccionar un projecto antes de continuar'
            }));
        }
    }

    render() {
        const { projects, user, accessType, uri } = this.props;

        if (projects.status !== STATUS.COMPLETE) {
            return <Spinner/>;
        } else if (!RequiresCompany.hasSelectedProject(user)) {
            return <Redirect to={ ENDPOINTS.COMPANY_URL }/>;
        } else if (hasAccess(uri, accessType)) {
            return <Route render={ () => <this.props.component { ...this.props }/> }/>;
        }
        return <ErrorPage type={ 403 }/>;
    }

    static hasSelectedProject({ attributes }) {
        return attributes.preferences.default_project !== null &&
            typeof attributes.preferences.default_project !== 'undefined';
    }

    static propTypes = {
        projects: PropTypes.object,
        dispatch: PropTypes.func,
        history: PropTypes.object,
        user: PropTypes.object,
        accessType: PropTypes.string,
        uri: PropTypes.string.isRequired,
    };

    static defaultProps = {
        accessType: ACCESS_TYPES.READ
    }
}
