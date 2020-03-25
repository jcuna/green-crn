/**
 * Created by Jesus on 19/02/20/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../utils/Breadcrumbs';
import Project from './Project';
import InstallationList from './InstallationList';
import { Link } from 'react-router-dom';
import { ENDPOINTS } from '../../../constants';

export default class ProjectSumary extends React.Component {
    constructor(props) {
        super(props);

        const { action, id, project_id } = this.props.match.params;
        const editing = typeof project_id !== 'undefined';

        this.state = { editing, id, project_id, render: this.getRenderComponent(action), action };
    }

    render() {
        const { customer } = this.props;
        const { project_id } = this.state;
        const path_id = this.getIdPath();
        return (
            <div>
                <Breadcrumbs { ...this.props }/>
                <section className='widget'>
                    <h2>Proyectos</h2>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName(typeof project_id === 'undefined' ? 'nuevo' : 'info') }
                                data-func='projects'
                                to={ `${ ENDPOINTS.CUSTOMER_PROJECTS_URL }/${ customer.current.id }/info${ path_id }` }>
                                Información
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('instalacion') }
                                to={ `${ ENDPOINTS.CUSTOMER_PROJECTS_URL }/${ customer.current.id }/instalacion${ path_id }` }>
                                Instalaciones
                            </Link>
                        </li>
                    </ul>
                    { <this.state.render { ...this.props } { ...this.state }/> }
                </section>
            </div>
        );
    }

    componentDidUpdate(prevProps) {
        if (prevProps.match.params.action !== this.props.match.params.action) {
            this.setState({ render: this.getRenderComponent(this.props.match.params.action) });
        }
        if (prevProps.match.params.project_id !== this.props.match.params.project_id) {
            this.setState({ id: this.props.match.params.customer_id, project_id: this.props.match.params.project_id, editing: true });
        }
    }

    getIdPath() {
        if (this.state.editing) {
            return `/${ this.state.project_id }`;
        }
        return '';
    }

    getClassName(action) {
        if (action === this.props.match.params.action) {
            return 'nav-link active';
        }
        return this.state.project_id ? 'nav-link' : 'nav-link disabled';
    }

    getRenderComponent(action) {
        if (action === 'instalacion') {
            return InstallationList;
        }
        return Project;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        customer: PropTypes.object,
    };
}
