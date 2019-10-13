/**
 * Created by Jon on 6/5/18.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import Checkbox from '../../utils/Checkbox';
import { hideOverlay } from '../../actions/appActions';

export default class UserManager extends React.Component {
    constructor(props) {
        super(props);

        const rolesCheckboxes = {};
        const projectsCheckboxes = {};

        let roles = [];
        const projects = [];

        if (typeof props.editingUser !== 'undefined') {
            props.editingUser.roles.forEach(role => {
                rolesCheckboxes[role.name] = true;
            });
            roles = props.editingUser.roles;

            props.projects.projects.forEach(project => {
                if (typeof props.editingUser.attributes.access.projects !== 'undefined' &&
                    props.editingUser.attributes.access.projects.includes(project.id)) {
                    projectsCheckboxes[project.name] = true;
                    projects.push(project.id);
                }
            });
        }

        this.state = {
            deleteButtonClass: 'btn btn-danger',
            actionButtonDisabled: true,
            rolesCheckboxes,
            projectsCheckboxes,
            roles,
            attributes: {
                access: {
                    projects
                }
            },
            first_name: props.editingUser && props.editingUser.first_name || null,
            last_name: props.editingUser && props.editingUser.last_name || null,
            email: props.editingUser && props.editingUser.email || null,
        };

        this.updateUserData = this.updateUserData.bind(this);
        this.updateUserDataRoles = this.updateUserDataRoles.bind(this);
        this.updateUserDataAccess = this.updateUserDataAccess.bind(this);
    }

    render() {
        return <div><FormGenerator { ...{
            formName: 'create-user-form',
            elements: this.formElements
        } }/>
        { this.rolesSection }
        <hr/>
        { this.projectsSection }
        <div style={ { textAlign: 'right' } }>
            <button className='btn btn-secondary'
                style={ { marginRight: '10px' } }
                onClick={ () => this.props.dispatch(hideOverlay()) }>Cerrar
            </button>
            <button className='btn btn-success'
                disabled={ this.state.actionButtonDisabled }
                onClick={ this.props.onSubmit }>
                { typeof this.props.editingUser === 'undefined' ? 'Crear Usuario' : 'Guardar'}
            </button>
        </div>
        </div>;
    }

    get projectsSection() {
        const { projects } = this.props.projects;

        return (
            <div>
                <h5>Dar accesso a los siguientes proyectos:</h5>
                <hr/>
                { this.itemList(projects, this.updateUserDataAccess, 'projectsCheckboxes') }
            </div>
        );
    }

    get rolesSection() {
        return (
            <div>
                <h5>Aplicar los siguientes roles al usuario:</h5>
                <hr/>
                { this.itemList(this.props.roles.assigned, this.updateUserDataRoles, 'rolesCheckboxes') }
            </div>
        );
    }

    itemList(items, callback, stateValue) {
        return (
            <ul style={ {
                listStyle: 'none',
                columnCount: 2,
                columnGap: '20px',
                marginTop: '10px'
            } }>
                { items.map(item => {
                    const checked = this.state[stateValue][item.name] === true;

                    return <li key={ item.id }><Checkbox
                        checked={ checked }
                        onChange={ callback }
                        name={ item.name }
                        value={ item.id }
                        label={ item.name }/></li>;
                })}
            </ul>
        );
    }

    recordCheckboxValues(checkbox, stateValue) {
        const checkboxState = this.state[stateValue];

        checkboxState[checkbox.name] = checkbox.checked;
        this.setState({
            [stateValue]: checkboxState
        });
    }

    updateUserData(event, validation) {
        let user = {};

        if (typeof event !== 'undefined' && typeof validation !== 'undefined') {
            user = {
                first_name: validation['first-name'].value,
                last_name: validation['last-name'].value,
                email: validation.email.value,
                roles: this.state.roles,
                attributes: this.state.attributes
            };
            const stateUser = {
                first_name: validation['first-name'].value,
                last_name: validation['last-name'].value,
                email: validation.email.value,
            };

            stateUser.actionButtonDisabled = !(
                validation['first-name'].isValid && validation['last-name'].isValid && validation.email.isValid
            );
            this.setState(stateUser);
        } else {
            user = {
                first_name: this.state.first_name,
                last_name: this.state.last_name,
                email: this.state.email,
                roles: this.state.roles,
                attributes: this.state.attributes
            };
            if (user.first_name !== '' && user.last_name !== '' && user.email !== '') {
                this.setState({
                    actionButtonDisabled: false,
                });
            }
        }

        if (typeof this.props.editingUser !== 'undefined') {
            user.id = this.props.editingUser.id;
        }
        this.props.onDataChanged(user);
    }

    updateUserDataRoles(checkbox) {
        this.recordCheckboxValues(checkbox, 'rolesCheckboxes');
        const newRole = {
            name: checkbox.name,
            id: checkbox.value,
        };
        const roles = this.state.roles;

        let roleInserted = false;

        roles.forEach((role, i) => {
            if (role.id === newRole.id) {
                if (checkbox.checked) {
                    roleInserted = true;
                    roles.splice(i, 1, newRole);
                } else {
                    roles.splice(i, 1);
                }
            }
        });

        if (!roleInserted && checkbox.checked) {
            roles.push(newRole);
        }

        this.setState({
            roles,
        });

        this.updateUserData();
    }

    updateUserDataAccess(checkbox) {
        this.recordCheckboxValues(checkbox, 'projectsCheckboxes');

        const projects = [];

        this.props.projects.projects.forEach(item => {
            if (this.state.projectsCheckboxes[item.name]) {
                projects.push(item.id);
            }
        });

        this.setState({
            attributes: {
                access: {
                    projects
                }
            }
        });
    }

    get formElements() {
        const elements = [
            {
                type: 'input',
                placeholder: 'Nombre',
                onChange: this.updateUserData,
                name: 'first-name',
                validate: 'required',
            },
            {
                type: 'input',
                placeholder: 'Apellidos',
                onChange: this.updateUserData,
                name: 'last-name',
                validate: 'required',
            },
            {
                type: 'input',
                placeholder: 'Email',
                onChange: this.updateUserData,
                name: 'email',
                validate: ['required', 'email'],
            }
        ];

        if (typeof this.props.editingUser !== 'undefined') {
            elements.forEach(item => {
                item.defaultValue = this.props.editingUser[item.name.replace('-', '_')];
                if (item.name === 'email') {
                    item.readOnly = true;
                }
            });
        }
        return elements;
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.attributes.access.projects.length !== this.state.attributes.access.projects.length) {
            this.updateUserData();
        }
    }

    static propTypes = {
        editingUser: PropTypes.shape({
            id: PropTypes.number.isRequired,
            first_name: PropTypes.string.isRequired,
            last_name: PropTypes.string.isRequired,
            email: PropTypes.string.isRequired,
            roles: PropTypes.array.isRequired,
            attributes: PropTypes.object,
        }),
        roles: PropTypes.object,
        onDataChanged: PropTypes.func,
        onSubmit: PropTypes.func,
        dispatch: PropTypes.func,
        projects: PropTypes.object,
    };
}
