/**
 * @author Jon Garcia <jongarcia@sans.org>
 */

import React from 'react';
import PropTypes from 'prop-types';
import { hasAccess } from '../../../utils/config';
import { ACCESS_TYPES, ENDPOINTS } from '../../../constants';
import Link from 'react-router-dom/Link';
import Table from '../../../utils/Table';

export default class Projects extends React.Component {
    constructor(props) {
        super(props);
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
                    <Table rows={ this.getRows(this.props.customer.current) }/>
                </section>
            </div>
        );
    }

    getRows() {
        return [];
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        customer: PropTypes.object,
    };
}
