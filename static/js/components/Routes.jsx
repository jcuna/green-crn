/**
 * Created by Jon on 1/1/19.
 */

import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './Home';
import Logout from './user/Logout';
import Roles from './user/Roles';
import Users from './user/Users';
import ErrorPage from './ErrorPage';
import { hasAccess } from '../utils/config';
import PropTypes from 'prop-types';
import Company from './company/Company';
import Account from './user/Account';
import { ACCESS_TYPES, ENDPOINTS } from '../constants';
import Customers from './customers/Customers';
import CustomerList from './customers/CustomerList';

export default class Routes extends React.Component {
    render() {
        const ep = ENDPOINTS;

        return (
            <Switch>

                <Route exact path='/' render={ (props) => this.getComponent(Home, props, true) }/>

                <Route exact path={ ep.ACCOUNT_LOGOUT } render={ props =>
                    this.getComponent(Logout, props, true) }
                />

                <Route exact path={ ep.ROLES_URL } render={ props => this.getComponent(Roles, props) }/>

                <Route exact path={ `${ep.USERS_MANAGER_URL}/:page([0-9]+)?` } render={ props =>
                    this.getComponent(Users, props) }
                />

                <Route exact path={ `${ ep.COMPANY_URL }/:project_id([0-9]+)?` } render={ props => this.getComponent(
                    Company, props, false, ep.COMPANY_URL,
                ) }/>

                <Route exact path={ `${ ep.CUSTOMERS_URL }` }
                    render={ props => this.getComponent(CustomerList, props, false, ep.CUSTOMERS_URL) }
                />
                <Route
                    exact path={ `${ ep.CUSTOMERS_URL }/:action(info|proyectos)?/:id([0-9]+)?` }
                    render={ props => this.getComponent(Customers, props, false, ep.CUSTOMERS_URL) }
                />
                <Route
                    exact path={ `${ ep.CUSTOMER_PROJECTS_URL }/:id([0-9]+)?/:action(nuevo|docs|instalacion)?` }
                    render={ props => this.getComponent(Customers, props, false, ep.CUSTOMERS_URL) }
                />

                <Route exact path={ ep.ACCOUNT_PROFILE } render={ props =>
                    this.getComponent(Account, props, true) }
                />

                <Route path={ ep.NOT_FOUND } component={ ErrorPage } type={ 404 }/>
                <Route path={ ep.NO_ACCESS } component={ ErrorPage } type={ 403 }/>
                <Route component={ ErrorPage }/>
            </Switch>
        );
    }

    getComponent(
        Component, { history, ...props }, access = false, path = history.location.pathname,
        accessType = ACCESS_TYPES.READ) {
        if (access || hasAccess(path, accessType)) {
            return <Component { ...this.props } { ...props }/>;
        }
        return <ErrorPage type={ 403 }/>;
    }

    getMiddleware(Middleware, Component, uri, props, accessType = ACCESS_TYPES.READ) {
        return <Middleware
            component={ Component } { ...this.props } { ...props }
            accessType={ accessType } uri={ uri }
        />;
    }

    static propTypes = {
        history: PropTypes.object,
    };
}
