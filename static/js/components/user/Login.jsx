/**
 * Created by Jon on 12/3/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import { login } from '../../actions/userActions';
import Spinner from '../../utils/Spinner';
import { clearLandingPage } from '../../actions/appActions';
import { INVALID_LANDING_PAGES, STATUS } from '../../constants';

export default class Login extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            button: { value: 'Login', disabled: true }
        };

        this.handleSubmit = this.handleSubmit.bind(this);
        this.validateFields = this.validateFields.bind(this);
    }

    static getDerivedStateFromProps({ history, user, landingPage, dispatch }, state) {
        if (user.status === STATUS.PROCESSED) {
            if (!INVALID_LANDING_PAGES.includes(landingPage)) {
                history.push(landingPage);
                dispatch(clearLandingPage());
            } else {
                history.push('/');
            }
        }
        return state;
    }

    render() {
        const { user } = this.props;
        const email = user.email || '';
        const password = user.password || '';

        if (user.status === STATUS.TRANSMITTING || user.status === STATUS.DECOMMISSIONING) {
            return <Spinner/>;
        }

        return <FormGenerator { ...{
            formName: 'login-form',
            button: this.state.button,
            elements: [
                {
                    type: 'text',
                    placeholder: 'Email',
                    onChange: this.validateFields,
                    name: 'email',
                    defaultValue: email,
                    validate: ['required', 'email']
                },
                {
                    type: 'password',
                    placeholder: 'Contraseña',
                    onChange: this.validateFields,
                    name: 'password',
                    defaultValue: password,
                    validate: 'required',
                }
            ],
            onSubmit: this.handleSubmit,
        } }/>;
    }

    validateFields(event, validation) {
        if (validation.email.isValid && validation.password.isValid) {
            this.setState({
                button: { value: 'Login' }
            });
        } else {
            this.setState({
                button: { value: 'Login', disabled: 'disabled' }
            });
        }
    }

    handleSubmit(e, validation) {
        this.props.dispatch(login(validation.email.value, validation.password.value));
    }

    static propTypes = {
        history: PropTypes.object,
        user: PropTypes.object,
        landingPage: PropTypes.string,
        dispatch: PropTypes.func,
    }
}
