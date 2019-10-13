/**
 * Created by Jon on 12/23/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import { commitPermissions, createRole, deleteRole, fetchRoles } from '../../actions/roleActions';
import Spinner from '../../utils/Spinner';
import { notifications, showOverlay } from '../../actions/appActions';
import '../../../css/roles.scss';
import Permissions from '../Permissions';
import { ALERTS, STATUS } from '../../constants';
import FontAwesome from '../../utils/FontAwesome';
import Breadcrumbs from '../../utils/Breadcrumbs';

export default class Roles extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            button: { value: 'Agregar role', disabled: 'disabled' },
            deleteButtonClass: 'btn btn-danger',
        };

        this.modifyPermissions = this.modifyPermissions.bind(this);
        this.confirmChanges = this.confirmChanges.bind(this);
        this.updateObject = this.updateObject.bind(this);
        this.confirmRoleDeletion = this.confirmRoleDeletion.bind(this);
        this.submit = this.submit.bind(this);
        this.toggleButtonDisabled = this.toggleButtonDisabled.bind(this);

        if (props.roles.status === STATUS.PENDING) {
            props.dispatch(fetchRoles());
        }
    }

    render() {
        return (
            <div>
                <Breadcrumbs { ...this.props } title='Roles'/>
                <section className='widget'>
                    <h2>Roles de Accesso</h2>
                    { this.rolesTable }
                    <FormGenerator { ...{
                        formName: 'roles-form',
                        button: this.state.button,
                        onSubmit: this.submit,
                        elements: [
                            {
                                type: 'input',
                                placeholder: 'Role',
                                onChange: this.toggleButtonDisabled,
                                name: 'role',
                                validate: 'required',
                            },
                        ],
                    } }/>
                </section>
            </div>
        );
    }

    toggleButtonDisabled(event, validation) {
        if (validation.role.isValid) {
            this.setState({
                button: { value: 'Agregar role' },
            });
        } else {
            this.setState({
                button: { value: 'Agregar role', disabled: 'disabled' },
            });
        }
    }

    submit(event, validation) {
        let exists = false;

        this.props.roles.assigned.forEach((item) => {
            if (item.name.toLowerCase() === validation.role.value.toLowerCase()) {
                exists = true;
            }
        });

        if (exists) {
            this.props.dispatch(notifications([
                { type: ALERTS.DANGER, message: 'Role con mismo nombre ya existe' },
            ]));
            this.toggleButtonDisabled(event, validation);
        } else {
            this.props.dispatch(createRole(validation.role.value));
        }
        event.target.value = '';
    }

    get rolesTable() {
        if (this.props.roles.status === STATUS.TRANSMITTING) {
            return <Spinner/>;
        }
        return <table className='table table-striped'>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Nombre</th>
                    <th>Permisos</th>
                    <th>Borrar</th>
                </tr>
            </thead>
            <tbody>
                { this.props.roles.assigned.map((item, i) => {
                    i++;
                    return <tr key={ i }>
                        <th scope='row'>{ i }</th>
                        <td>{ item.name }</td>
                        <td>
                            <FontAwesome type='edit' className='text-info' data-id={ item.id }
                                onClick={ this.modifyPermissions }/>
                        </td>
                        <td>
                            <FontAwesome type='trash' className='text-danger' data-id={ item.id }
                                onClick={ this.confirmRoleDeletion }/>
                        </td>
                    </tr>;
                }) }
            </tbody>
        </table>;
    }

    modifyPermissions(e) {
        const button = <button
            type='button' onClick={ this.confirmChanges } className='btn btn-primary'>OK
        </button>;

        this.props.dispatch(showOverlay(
            <Permissions { ...this.props } id={ Number(e.target.getAttribute('data-id')) }
                onUpdate={ this.updateObject }/>,
            'Editar Permisos',
            true,
            button),
        );
    }

    confirmChanges(e) {
        if (typeof this.updatedPermissions !== 'undefined' && !this.props.roles.processing) {
            e.target.className += ' loading-button';
            this.props.dispatch(commitPermissions(this.updatedPermissions));
        }
    }

    updateObject(updatedPermissions) {
        this.updatedPermissions = updatedPermissions;
    }

    confirmRoleDeletion(e) {
        const roleId = e.target.getAttribute('data-id');

        const button = <button
            type='button' onClick={ (b) => {
                if (!this.props.roles.processing) {
                    b.target.className += ' loading-button';
                    this.props.dispatch(deleteRole(Number(roleId)));
                }
            } } className={ this.state.deleteButtonClass }>Confirmar</button>;

        this.props.dispatch(showOverlay(
            <div className='panel'>Estas seguro que quieres elimiar el rol seleccionado?</div>,
            <div className='warning-prompt'><FontAwesome type='exclamation-triangle'/> Advertencia...</div>,
            true,
            button),
        );
    }

    static propTypes = {
        roles: PropTypes.object,
        dispatch: PropTypes.func,
    };
}
