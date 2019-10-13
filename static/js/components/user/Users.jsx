/**
 * Created by Jon on 1/11/18.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { createUser, deleteUser, editUser, fetchUsers, searchUsers, USERS_SEARCHING } from '../../actions/userActions';
import Spinner from '../../utils/Spinner';
import { hideOverlay, notifications, showOverlay } from '../../actions/appActions';
import UserManager from './UserManager';
import { fetchRoles } from '../../actions/roleActions';
import { hasAccess } from '../../utils/config';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, STATUS } from '../../constants';
import { afterPause, searchArray } from '../../utils/helpers';
import Paginate from '../../utils/Paginate';
import FontAwesome from '../../utils/FontAwesome';
import Breadcrumbs from '../../utils/Breadcrumbs';

export default class Users extends React.Component {
    constructor(props) {
        super(props);

        this.openUserManager = this.openUserManager.bind(this);
        this.editUser = this.editUser.bind(this);
        this.deleteUser = this.deleteUser.bind(this);
        this.createUser = this.createUser.bind(this);
        this.updateNewUserData = this.updateNewUserData.bind(this);
        this.orderBy = this.orderBy.bind(this);

        this.state = {
            newUser: {},
            orderDir: 'asc',
            orderBy: 'id',
            page: props.match.params.page || 1,
            searching: false,
            found: []
        };
        if (props.roles.assigned.length === 0) {
            props.dispatch(fetchRoles());
        }
        if (props.user.list.status !== STATUS.TRANSMITTING && props.user.list.users.length === 0) {
            props.dispatch(fetchUsers(this.state.page));
        } else {
            this.state.page = props.user.list.page;
            this.props.history.push(`${ENDPOINTS.USERS_MANAGER_URL}/${this.state.page}`);
        }

        this.search = this.search.bind(this);
        this.switchPage = this.switchPage.bind(this);
    }

    search({ target }) {
        if (target.value !== '') {
            const found = searchArray(this.props.user.list.users, target.value, ['name', 'email']);

            if (found.length === 0) {
                this.props.dispatch({ type: USERS_SEARCHING });
                afterPause(() => {
                    this.props.dispatch(searchUsers(target.value,
                        (data) => {
                            this.setState({
                                found: data.list,
                                searching: true
                            });
                        },
                        (err) => {
                            //TODO: handle err
                            console.warn(err);
                        })
                    );
                });
            }

            this.setState({
                found,
                searching: true
            });
        } else {
            this.setState({
                found: [],
                searching: false
            });
        }
    }

    render() {
        const dir = this.state.orderDir === 'asc' ? 'down' : 'up';
        const { user } = this.props;

        const displayData = this.state.searching ? this.state.found : user.list.users;

        return <div>
            <Breadcrumbs { ...this.props }/>
            <section className='widget'>
                <h2>Usuarios</h2>
                <div className='table-actions'>
                    <input
                        placeholder='Buscar: Nombre/Email'
                        onChange={ this.search }
                        className='form-control'
                    />
                    <button
                        disabled={ this.props.roles.assigned.length === 0 }
                        onClick={ () => this.openUserManager() }
                        className='btn btn-success'>
                        Nuevo Usuario
                    </button>
                </div>
                <table className='table table-striped'>
                    <thead>
                        <tr>
                            <th>
                                ID <FontAwesome type={ `sort-numeric-${ dir }` } className='text-info clicker'
                                    onClick={ () => this.orderBy('id') }/>
                            </th>
                            <th>
                                Nombre <FontAwesome type={ `sort-alpha-${ dir }` } className='text-info clicker'
                                    onClick={ () => this.orderBy('last_name') }/>
                            </th>
                            <th>
                                Email <FontAwesome type={ `sort-alpha-${ dir }` } className='text-info clicker'
                                    onClick={ () => this.orderBy('email') }/>
                            </th>
                            <th>
                                Roles
                            </th>
                            <th>
                                Editar
                            </th>
                            <th>
                                Borrar
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        { displayData.map((userFromList, i) => {
                            const rolesCount = userFromList.roles.length;
                            const canEdit = hasAccess(ENDPOINTS.USERS_MANAGER_URL, ACCESS_TYPES.WRITE) &&
                                userFromList.email !== user.email;
                            const canDelete = hasAccess(ENDPOINTS.USERS_MANAGER_URL, ACCESS_TYPES.DELETE) &&
                                userFromList.email !== user.email;
                            return <tr key={ i }>
                                <td>{ userFromList.id }</td>
                                <td>{ userFromList.name }</td>
                                <td>{ userFromList.email }</td>
                                <td>
                                    { userFromList.roles.map((obj, r) => r < rolesCount - 1 ? `${obj.name}, ` : obj.name) }
                                </td>
                                <td>
                                    <FontAwesome type={ canEdit ? 'user-edit' : 'ban' } className='text-info'
                                        onClick={ canEdit ? () => {
                                            this.openUserManager({
                                                ...userFromList,
                                                roles: userFromList.roles.slice(),
                                            });
                                        } : null }/>
                                </td>
                                <td>
                                    <FontAwesome type={ canDelete ? 'trash' : 'ban' } className='text-danger'
                                        onClick={ canDelete ? () => this.deleteUser(userFromList.id) : null }/>
                                </td>
                            </tr>;
                        })}
                    </tbody>
                </table>
                { user.list.users.length === 0 || user.list.searching &&
                <div style={ { position: 'absolute', left: '50%' } }><Spinner/></div> }

                { user.list.total_pages > 1 && !this.state.searching &&
                <Paginate
                    total_pages={ user.list.total_pages }
                    onPageChange={ this.switchPage }
                    initialPage={ this.state.page }
                />
                }

            </section>
        </div>;
    }

    switchPage(number) {
        this.props.history.push(`${ENDPOINTS.USERS_MANAGER_URL}/${number}`);
        this.setState({
            page: number
        });
    }

    openUserManager(user) {
        const onSubmit = typeof user === 'undefined' ? this.createUser : this.editUser;

        this.props.dispatch(
            showOverlay(
                <UserManager { ...this.props } onDataChanged={ this.updateNewUserData } editingUser={ user }
                    onSubmit={ onSubmit }/>,
                'Administracion de Usuarios'
            )
        );
    }

    editUser(e) {
        e.target.className += ' loading-button';
        this.props.dispatch(editUser(this.state.newUser, () => {
            // hide notification
            this.props.dispatch(fetchUsers(this.state.page));
            this.props.dispatch(hideOverlay());
        }, () => {
            // show notification
            this.props.dispatch(hideOverlay());
        }));
    }

    createUser(e) {
        e.target.disabled = true;
        e.target.className += ' loading-button';
        this.props.dispatch(createUser(this.state.newUser, () => {
            this.props.dispatch(fetchUsers(this.state.page));
            this.props.dispatch(hideOverlay());
            this.props.dispatch(notifications([
                { type: ALERTS.SUCCESS, message: 'Usuario creado satisfactoriamente' },
            ]));
        }, () => {
            this.props.dispatch(hideOverlay());
            this.props.dispatch(notifications([
                { type: ALERTS.DANGER, message: 'Hubo un error creando el usuario' },
            ]));
        }));
    }

    deleteUser(id) {
        const button = <button
            type='button' onClick={ ({ target }) => {
                target.className += ' loading-button';
                this.props.dispatch(deleteUser(id, () => {
                    this.props.dispatch(hideOverlay());
                    this.props.dispatch(fetchUsers(this.state.page));
                }));
            } } className='btn btn-danger'>Confirmar</button>;

        this.props.dispatch(showOverlay(
            <div className='panel'>Estas seguro que quieres elimiar el usuario seleccionado?</div>,
            <div className='warning-prompt'><FontAwesome type='exclamation-triangle'/> Advertencia...</div>,
            true,
            button)
        );
    }

    updateNewUserData(user) {
        if (user.first_name !== '' && user.last_name !== '' && user.email !== '') {
            this.setState({
                newUser: user
            });
        }
    }

    orderBy(column) {
        let orderDir = this.state.orderDir;

        if (this.state.orderBy === column) {
            orderDir = orderDir === 'asc' ? 'desc' : 'asc';
        }
        this.setState({ orderBy: column, orderDir });
        this.props.dispatch(fetchUsers(this.state.page, column, orderDir));
    }

    componentDidUpdate(prevProps, prevState) {
        const { dispatch, user } = this.props;

        if (user.list.status !== STATUS.TRANSMITTING && user.list.users.length === 0 ||
        prevState.page !== this.state.page) {
            dispatch(fetchUsers(this.state.page));
        }
    }

    static propTypes = {
        dispatch: PropTypes.func,
        roles: PropTypes.object,
        user: PropTypes.object,
        match: PropTypes.object,
        history: PropTypes.object,
    }
}
