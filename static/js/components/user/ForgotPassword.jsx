/**
 * Created by Jon on 1/7/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { clearNotifications, notifications, showOverlay } from '../../actions/appActions';
import FontAwesome from '../../utils/FontAwesome';
import FormGenerator from '../../utils/FromGenerator';
import { ALERTS } from '../../constants';
import { requestPasswordChange } from '../../actions/userActions';
import Spinner from '../../utils/Spinner';

export default class ForgotPassword extends React.Component {
    constructor(props) {
        super(props);
        props.dispatch(clearNotifications());
        this.sendRecoveryEmail = this.sendRecoveryEmail.bind(this);
        this.input = React.createRef();

        this.state = { showLoading: false };
    }

    render() {
        if (this.state.showLoading) {
            return <Spinner/>;
        }
        return (
            <div className='card forgot-password' style={ { width: '26rem', margin: '10px auto' } }>
                <div className='card-header'>
                    <FontAwesome type='address-card'/> Recupera tu cuenta
                </div>
                <div className='card-body'>
                    <blockquote className='card-blockquote'>
                        <p>Ingresa tu correo electronico para buscar tu cuenta</p>
                    </blockquote>

                    <FormGenerator
                        formName={ 'forgot-password' }
                        elements={ [
                            {
                                ref: this.input,
                                type: 'input',
                                placeholder: 'Correo',
                                name: 'email',
                                validate: ['required', 'email'],
                            }
                        ] }
                        button={ { value: 'Enviar correo' } }
                        onSubmit={ this.sendRecoveryEmail }
                    />
                </div>
            </div>
        );
    }

    sendRecoveryEmail(e, validate) {
        this.props.dispatch(clearNotifications());
        if (!validate.email.isValid) {
            this.props.dispatch(notifications({ type: ALERTS.DANGER, message: 'Formato de email incorrecto' }));
        } else {
            this.setState({ showLoading: true });
            this.props.dispatch(requestPasswordChange(validate.email.value, () => {
                this.setState({ showLoading: false });
                this.props.dispatch(
                    showOverlay(
                        <div>
                            <p>En unos momentos recibira un correo con instrucciones de como recuperar su contraseña</p>
                        </div>,
                        <FontAwesome type='thumbs-up'/>,
                        false,
                        null,
                        () => {
                            this.props.dispatch(notifications(
                                { type: ALERTS.SUCCESS, message: 'Verifica tu email para continuar' }));
                            this.input.current.value = '';
                        }
                    )
                );
            }));
        }
    }

    static propTypes = {
        dispatch: PropTypes.func,
    };
}
