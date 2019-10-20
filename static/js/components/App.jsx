/**
 * Created by Jon on 6/24/17.
 */

import React from 'react';
import Layout from './Layout.jsx';
import { BrowserRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { fetchUser } from '../actions/userActions';
import token from '../utils/token';
import Spinner from '../utils/Spinner';
import { fetchPermissions } from '../actions/roleActions';
import { clickedContent, notifications, toggleMobileMenu } from '../actions/appActions';
import { setStateData } from '../utils/config';
import PropTypes from 'prop-types';
import { ALERTS, GENERIC_ERROR, STATUS } from '../constants';
import { fetchCompany } from '../actions/companyActions';
import '@fortawesome/fontawesome-free/js/all';
import 'bootstrap-scss/bootstrap.scss';
import 'bootstrap-scss/bootstrap-grid.scss';
import 'bootstrap-scss/bootstrap-reboot.scss';
import '../../css/app.scss';
import '../../css/overrides.scss';
import ReactDOM from 'react-dom';

class App extends React.Component {
    constructor(props) {
        super(props);

        const { dispatch, user, company } = this.props;

        if (user.status === STATUS.PENDING) {
            dispatch(fetchUser(data => {
                //the first time we load, we want to make sure we keep current preferences.
                data.user.attributes.preferences.showMobileMenu &&
                this.props.dispatch(toggleMobileMenu(data.user.attributes.preferences.showMobileMenu));
            }));
        }
        if (this.permissionsPending()) {
            dispatch(fetchPermissions());
        }

        if (company.status === STATUS.PENDING) {
            dispatch(fetchCompany(
                () => {
                    dispatch(notifications([{
                        type: ALERTS.DANGER,
                        message: GENERIC_ERROR,
                    }]));
                }
            ));
        }
        this.clickedContent = this.clickedContent.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { company } = this.props;
        if (prevProps.company.data.name !== company.data.name) {
            ReactDOM.render(company.data.name, document.querySelector('title'));
        }
    }

    permissionsPending() {
        return Object.keys(this.props.roles.permissions).length === 0;
    }

    render() {
        const { props } = this;

        if (props.token.value !== '') {
            token.data = { ...props };
            setStateData({ ...props });
        }

        let render;

        /**
         * we show first load spinner while fetching initial data and only stop it after we have processed the user
         * weather the user is logged in or not.
         */
        if (this.showFullScreenSpinner(props)) {
            render = <div className="first-load-spinner">
                { props.isOffline && <h3>Parece que no tienes conexión.</h3>}
                <Spinner/>
            </div>;
        } else {
            render = <Layout { ...props }/>;
        }

        return (
            <BrowserRouter>
                <div className="parent-container" onClick={ this.clickedContent }>
                    { render }
                </div>
            </BrowserRouter>
        );
    }

    showFullScreenSpinner({ user, isOffline }) {
        return (user.status === STATUS.PENDING || this.permissionsPending() &&
            user.status === STATUS.PROCESSED) || isOffline;
    }

    clickedContent() {
        this.props.dispatch(clickedContent());
    }

    static propTypes = {
        isOffline: PropTypes.bool,
        dispatch: PropTypes.func.isRequired,
        showMobileMenu: PropTypes.bool,
        user: PropTypes.object,
        token: PropTypes.object,
        roles: PropTypes.object,
        clickedContent: PropTypes.bool,
        company: PropTypes.object
    };
}

const getInitialState = (state) => {
    return {
        isOffline: state.app.isOffline,
        appState: state.app.appState,
        showMobileMenu: state.app.showMobileMenu,
        notifications: state.app.notifications,
        landingPage: state.app.landingPage,
        overlay: state.app.overlay,
        clickedContent: state.app.clickedContent,
        user: state.user.user,
        token: state.user.token,
        roles: state.roles.roles,
        company: state.company,
    };
};

export default connect(getInitialState)(App);
