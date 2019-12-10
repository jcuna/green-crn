/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { Link } from 'react-router-dom';
import { ACCESS_TYPES, ENDPOINTS, STATUS } from '../../constants';
import { hasAccess } from '../../utils/config';
import { fetchCustomers } from '../../actions/customerAction';
import Table from '../../utils/Table';
import FontAwesome from '../../utils/FontAwesome';

export default class CustomerList extends React.Component {
    constructor(props) {
        super(props);
        this.search = this.search.bind(this);
        if (this.props.customer.list.status === STATUS.PENDING) {
            this.props.dispatch(fetchCustomers());
        }
    }

    search({ target }) {
        console.log(target);
    }

    render() {
        const { list } = this.props.customer;
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
                <Table
                    rows={ list.customers.map(o => [
                        <Link
                            key={ o.id }
                            to={ `${ENDPOINTS.CUSTOMERS_URL}/info/${o.id}` }>
                            { `${o.first_name} ${o.last_name}` }
                        </Link>,
                        o.identification_number,
                        o.address,
                        o.province.name,
                        <Link
                            key={ o.id }
                            to={ `${ENDPOINTS.CUSTOMERS_URL}/proyectos/${o.id}` }>
                            { <FontAwesome type='fas fa-solar-panel'/> }
                        </Link>]) }
                    headers={ ['Nombre', 'Cedula/RNC', 'Dirección', 'Provincia', 'Proyectos'] }
                />
            </div>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
        customer: PropTypes.object,
    };
}
