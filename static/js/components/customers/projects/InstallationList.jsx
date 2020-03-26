import React from 'react';
import { clearCurrentCustomer, fetchCustomer } from '../../../actions/customerAction';
import { ACCESS_TYPES, ENDPOINTS } from '../../../constants';
import { hasAccess } from '../../../utils/config';
import { Link } from 'react-router-dom';
import Table from '../../../utils/Table';
import FontAwesome from '../../../utils/FontAwesome';
import PropTypes from 'prop-types';
import { friendlyDateEs } from '../../../utils/helpers';

export default class InstallationList extends React.Component {
    constructor(props) {
        super(props);

        const { match, history, dispatch, customer } = props;
        const { action, project_id } = this.props.match.params;

        this.state = { project_id, action };

        if (typeof match.params.customer_id !== 'undefined' && customer.current.id !== Number(match.params.customer_id)) {
            dispatch(fetchCustomer(match.params.customer_id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
        } else if (typeof match.params.customer_id === 'undefined') {
            dispatch(clearCurrentCustomer());
        }
    }

    render() {
        const { match } = this.props;
        const proj = this.getCurrentProject();

        if (typeof proj.id === 'undefined' && typeof match.params.project_id !== 'undefined') {
            return this.renderReadOnly();
        }

        return (
            <div>
                <section className='widget'>
                    <div className='table-actions'>
                        {hasAccess(ENDPOINTS.CUSTOMER_INSTALLATIONS_URL, ACCESS_TYPES.WRITE) && <Link
                            to={ `${ENDPOINTS.CUSTOMER_INSTALLATIONS_URL}/${match.params.customer_id}/${match.params.project_id}/nuevo` }
                            className='btn btn-success'>
                            Crear Instalación
                        </Link>}
                    </div>
                    <Table
                        rows={
                            proj.installations.map((o, i) => [
                                <Link
                                    key={ o.id }
                                    to={ `${ENDPOINTS.CUSTOMER_INSTALLATIONS_URL}/${ this.props.match.params.customer_id }/${proj.id}/info/${o.id}` }>
                                    {`Instalación ${i + 1}`}
                                </Link>,
                                o.egauge_url,
                                o.specific_yield,
                                friendlyDateEs(new Date(o.start_date)),
                                <Link
                                    key={ o.id }
                                    to={ `${ENDPOINTS.CUSTOMER_INSTALLATIONS_URL}/${ this.props.match.params.customer_id }/${proj.id}/docs/${o.id}` }>
                                    {<FontAwesome type='fas fa-folder'/>}
                                </Link>])
                        }
                        headers={ ['#', 'Egauge', 'NIC', 'Fecha de Inicio', 'Documentos'] }
                    />
                </section>
            </div>
        );
    }

    renderReadOnly() {
        return (
            <h1>read only</h1>
        );
    }

    getCurrentProject() {
        const { match, customer } = this.props;

        if (typeof match.params.project_id !== 'undefined' && customer.current.customer_projects.length) {
            return customer.current.customer_projects.filter(project => project.id === Number(match.params.project_id))[0];
        }
        return {
            name: '',
            address: '',
            lat: '',
            long: '',
            nic: '',
            nic_title: '',
            circuit: '',
            ct: '',
            project_type: { id: 1 },
            country: 1,
            province: { id: 1 },
            distributor_id: 1,
            rate_id: 1,
            transformer_id: 1,
            tr_capacity_id: 1,
            phase_id: 1,
            tension: { id: 1 },
        };
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        customer: PropTypes.object,
        history: PropTypes.object,
    };
}
