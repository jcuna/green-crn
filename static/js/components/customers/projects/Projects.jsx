/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { hasAccess } from '../../../utils/config';
import { ACCESS_TYPES, ENDPOINTS } from '../../../constants';
import { Link } from 'react-router-dom';
import Table from '../../../utils/Table';
import { fetchCustomer } from '../../../actions/customerAction';
import FontAwesome from '../../../utils/FontAwesome';

export default class Projects extends React.Component {
    constructor(props) {
        super(props);

        const { match, history, dispatch, customer } = props;

        if (typeof match.params.id !== 'undefined' && customer.current.id !== Number(match.params.id)) {
            dispatch(fetchCustomer(match.params.id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
        } else if (typeof match.params.id === 'undefined') {
            history.push(ENDPOINTS.CUSTOMERS_URL);
        }
    }

    render() {
        const { current } = this.props.customer;
        const { customer_projects } = this.props.customer.current;
        return (
            <div>
                <section className='widget'>
                    <div className='table-actions'>
                        { hasAccess(ENDPOINTS.CUSTOMER_PROJECTS_URL, ACCESS_TYPES.WRITE) && <Link
                            to={ `${ENDPOINTS.CUSTOMER_PROJECTS_URL}/${this.props.match.params.id}/nuevo` }
                            className='btn btn-success'>
                            Crear Proyecto
                        </Link> }
                    </div>
                    <h4>Projects</h4>
                    <Table
                        rows={
                            customer_projects.map(o => [
                                <Link
                                    key={ o.id }
                                    to={ `${ENDPOINTS.CUSTOMER_PROJECTS_URL}/${current.id}/info/${o.id}` }>
                                    { `${o.name}` }
                                </Link>,
                                o.address,
                                o.nic,
                                o.nic_title,
                                <Link
                                    key={ o.id }
                                    to={ `${ENDPOINTS.CUSTOMER_INSTALLATIONS_URL}/${o.id}` }>
                                    { <FontAwesome type='fas fa-solar-panel'/> }
                                </Link>])
                        }
                        headers={ ['Nombre', 'Direccion', 'NIC', 'Título'] }
                    />
                </section>
            </div>
        );
    }

    getRows({ customer_projects }) {
        return customer_projects.map(p => [
            p.name,
        ]);
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        customer: PropTypes.object,
        history: PropTypes.object,
    };
}
