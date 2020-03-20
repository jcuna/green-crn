/**
 * Created by Jon on 1/7/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import FontAwesome from '../../utils/FontAwesome';
import { STATUS } from '../../constants';
import { fetchProjects } from '../../actions/projectActions';
import '../../../css/user/profile.scss';
import { showOverlay } from '../../actions/appActions';
import { requestPasswordChange } from '../../actions/userActions';

export default class Profile extends React.Component {
    constructor(props) {
        super(props);

        if (props.projects.status === STATUS.PENDING) {
            this.props.dispatch(fetchProjects());
        }
        this.changePassword = this.changePassword.bind(this);
        this.state = {
            pwButtonLoading: false
        };
    }

    render() {
        const { user, projects } = this.props;
        const { attributes: { access }} = user;
        let buttonClass = 'btn btn-danger';
        if (this.state.pwButtonLoading) {
            buttonClass += ' loading-button';
        }
        return (
            <div>
                <Breadcrumbs { ...this.props } title='Perfil'/>
                <div className='widget profile-wrapper'>
                    <section className='widget-child profile'>
                        <h3>{ user.first_name + ' ' + user.last_name }</h3>
                        <div><FontAwesome type='at'/>Email<span>{ user.email }</span></div>
                        <div>
                            <FontAwesome type='user-shield'/>Roles de usuario
                            <span>
                                { user.roles.map(a => a.name).join(', ') }
                            </span>
                        </div>
                        <div>
                            <FontAwesome type='project-diagram'/>Mis Proyectos
                            <span>
                                { projects.projects.filter(
                                    a => access.projects === '*' || access.projects.includes(a.id))
                                    .map(p => p.name).join(', ') }
                            </span>
                        </div>
                    </section>
                    <section className='widget-child profile-actions'>
                        <p>Presiona el botón de abajo para cambiar tu contraseña</p>
                        <button className={ buttonClass } onClick={ this.changePassword }>
                            <FontAwesome type='key'/> Cambiar Contraseña
                        </button>
                    </section>
                </div>
            </div>
        );
    }
    changePassword() {
        this.setState({ pwButtonLoading: true });
        this.props.dispatch(requestPasswordChange(this.props.user.email, () => {
            this.setState({ pwButtonLoading: false });
            this.props.dispatch(showOverlay(<div>
                <p>En unos momentos recibira un correo con instrucciones de como cambiar su contraseña</p>
            </div>, <FontAwesome type='thumbs-up'/>));
        }));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        user: PropTypes.object,
        projects: PropTypes.object,
    };
}
