/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import CustomersInfo from './CustomersInfo';
import CustomersProject from './CustomersProject';
import CustomersInstallation from './CustomersInstallation';
import CustomersDocs from './CustomersDocs';
import Link from 'react-router-dom/Link';
import { ENDPOINTS } from '../../constants';

export default class Customers extends React.Component {
    constructor(props) {
        super(props);

        const { action, id } = this.props.match.params;
        const editing = typeof id !== 'undefined';

        this.state = { editing, id, render: this.getRenderComponent(action), action };
    }

    render() {
        const path_id = this.getIdPath();
        return (
            <div>
                <Breadcrumbs { ...this.props }/>
                <section className='widget'>
                    <h2>Clientes</h2>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('info') }
                                to={ `${ ENDPOINTS.CUSTOMERS_URL }/info${ path_id }` }>
                                Información
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('proyecto') }
                                data-func='project'
                                to={ `${ ENDPOINTS.CUSTOMERS_URL }/proyecto${ path_id }` }>
                                Proyecto
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('instalacion') }
                                data-func='install'
                                to={ `${ ENDPOINTS.CUSTOMERS_URL }/instalacion${ path_id }` }>
                                Instalacion
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('docs') }
                                data-func='docs'
                                to={ `${ ENDPOINTS.CUSTOMERS_URL }/docs${ path_id }` }>
                                Documentos
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
    }

    getIdPath() {
        if (this.state.editing) {
            return `/${ this.state.id }`;
        }
        return '';
    }

    getClassName(action) {
        if (action === this.props.match.params.action) {
            return 'nav-link active';
        }
        return this.state.id ? 'nav-link' : 'nav-link disabled';
    }

    getRenderComponent(action) {
        switch (action) {
            case 'proyecto':
                return CustomersProject;
            case 'instalacion':
                return CustomersInstallation;
            case 'docs':
                return CustomersDocs;
            default:
                return CustomersInfo;
        }
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
    };
}
