/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { hasAccess } from '../../../utils/config';
import { ACCESS_TYPES, ENDPOINTS } from '../../../constants';
import Link from 'react-router-dom/Link';
import Table from '../../../utils/Table';
import { fetchCustomer } from '../../../actions/customerAction';

export default class Projects extends React.Component {
    constructor(props) {
        super(props);

        const { match, history, dispatch, customer } = props;

        if (typeof match.params.id !== 'undefined' && customer.id !== Number(match.params.id)) {
            dispatch(fetchCustomer(match.params.id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
        } else if (typeof match.params.id === 'undefined') {
            history.push(ENDPOINTS.CUSTOMERS_URL);
        }
    }

    render() {
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
                        rows={ this.getRows(this.props.customer.current) }
                        headers={ ['Nombre'] }
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
