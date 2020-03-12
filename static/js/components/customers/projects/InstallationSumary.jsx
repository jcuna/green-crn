/**
 * Created by Jesus on 19/02/20/.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../utils/Breadcrumbs';
import { Link } from 'react-router-dom';
import { ENDPOINTS } from '../../../constants';
import Installation from './Installation';
import Documents from './Documents';

export default class InstallationSumary extends React.Component {
    constructor(props) {
        super(props);

        const { action, id, project_id, installation_id } = this.props.match.params;
        const editing = typeof project_id !== 'undefined';

        this.state = { editing, id, project_id, installation_id, render: this.getRenderComponent(action), action };
    }

    render() {
        const { customer } = this.props;
        const path_id = this.getIdPath();
        return (
            <div>
                <Breadcrumbs { ...this.props }/>
                <section className='widget'>
                    <h2>Installaciones</h2>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('info') }
                                data-func='projects'
                                to={ `${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }/${customer.current.id}/${ this.state.project_id }/info${ path_id }` }>
                                Información
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('docs') }
                                to={ `${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }/${ customer.current.id }/${ this.state.project_id }/docs${ path_id }` }>
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
            return `/${ this.state.installation_id }`;
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
        if (action === 'docs') {
            return Documents;
        }
        return Installation;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        customer: PropTypes.object,
    };
}
