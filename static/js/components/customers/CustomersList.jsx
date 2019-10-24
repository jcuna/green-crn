/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import Link from 'react-router-dom/Link';
import { ACCESS_TYPES, ENDPOINTS } from '../../constants';
import { hasAccess } from '../../utils/config';

export default class CustomersList extends React.Component {
    constructor(props) {
        super(props);
        this.search = this.search.bind(this);
    }

    search({ target }) {
        console.log(target);
    }

    render() {
        return (
            <div>
                <Breadcrumbs { ...this.props } title={ 'Clientes' }/>
                <section className='widget'>
                    <h1>Lista de Clientes</h1>
                    <div className='table-actions'>
                        <input
                            placeholder='Buscar: Nombre/Apellido/Email'
                            onChange={ this.search }
                            className='form-control'
                        />
                        <input
                            placeholder='Buscar: Cedula/Telefono'
                            onChange={ this.search }
                            className='form-control'
                        />
                        { hasAccess(ENDPOINTS.CUSTOMERS_URL, ACCESS_TYPES.WRITE) && <Link
                            to={ `${ENDPOINTS.CUSTOMERS_URL}/info` }
                            className='btn btn-success'>
                            Nuevo Cliente
                        </Link> }
                    </div>
                </section>
            </div>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
    };
}
