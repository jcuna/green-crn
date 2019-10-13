/**
 * Created by Jon on 12/6/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { setLandingPage, notifications } from '../../actions/appActions';
import { ALERTS, ENDPOINTS, STATUS } from '../../constants';

export default class RequiresLogin extends React.Component {
    constructor(props) {
        super(props);

        RequiresLogin.makeThemLogin(props);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.user.status !== this.props.user.status) {
            RequiresLogin.makeThemLogin(this.props);
        }
    }

    static makeThemLogin(props) {
        if (!RequiresLogin.safeStatus.includes(props.user.status)) {
            props.dispatch(notifications([
                { type: ALERTS.WARNING, message: 'Tienes que iniciar sessión' }
            ]));
            props.dispatch(setLandingPage(props.history.location.pathname));
            props.history.push(ENDPOINTS.ACCOUNT_LOGIN);
        }
    }

    render() {
        return this.props.children;
    }

    static get safeStatus() {
        return [
            STATUS.PROCESSED,
            STATUS.TRANSMITTING,
            STATUS.DECOMMISSIONING
        ];
    }

    static propTypes = {
        dispatch: PropTypes.func,
        children: PropTypes.object,
        history: PropTypes.object,
        user: PropTypes.object,
    }
}
