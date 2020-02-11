/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import CustomerInfo from './CustomerInfo';
import Projects from './projects/Projects';
import {Link} from 'react-router-dom';
import {ENDPOINTS} from '../../constants';

export default class CustomerSummary extends React.Component {
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
                                className={ this.getClassName('proyectos') }
                                data-func='projects'
                                to={ `${ ENDPOINTS.CUSTOMER_PROJECTS_URL }${ path_id }` }>
                                Proyectos
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
        if (action === 'proyectos') {
            return Projects;
        }
        return CustomerInfo;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
    };
}
