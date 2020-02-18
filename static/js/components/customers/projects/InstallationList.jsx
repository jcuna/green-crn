
import React from 'react';
import { fetchCustomer} from '../../../actions/customerAction';
import { ACCESS_TYPES, ENDPOINTS } from '../../../constants';
import { hasAccess } from '../../../utils/config';
import { Link } from 'react-router-dom';
import Table from '../../../utils/Table';
import FontAwesome from '../../../utils/FontAwesome';
import PropTypes from 'prop-types';

export default class Installations extends React.Component {
    constructor(props) {
        super(props);

        const { match, history, dispatch, customer } = props;
    }

    render() {
        const { current } = this.props.customer;
        const proj = this.getCurrentProject();
        return (
            <div>
                <section className='widget'>
                    <div className='table-actions'>
                        {hasAccess(ENDPOINTS.CUSTOMER_INSTALLATIONS_URL, ACCESS_TYPES.WRITE) && <Link
                            to={ `${ENDPOINTS.CUSTOMER_INSTALLATIONS_URL}/${this.props.match.params.project_id}/nuevo` }
                            className='btn btn-success'>
                            Crear Instalación
                        </Link>}
                    </div>
                    <h4>Instalaciones</h4>
                    <Table
                        rows={
                            proj.installations.map(o => [
                                <Link
                                    key={ o.id }
                                    to={ `${ENDPOINTS.CUSTOMER_INSTALLATIONS_URL}/${proj.id}/info/${o.id}` }>
                                    {`${o.id}`}
                                </Link>,
                                o.egauge_url,
                                o.detailed_performance,
                                o.start_date,
                                <Link
                                    key={ o.id }
                                    to={ `${ENDPOINTS.CUSTOMER_INSTALLATIONS_URL}/documentos/${o.id}` }>
                                    {<FontAwesome type='fas fa-solar-panel'/>}
                                </Link>])
                        }
                        headers={['Nombre', 'Direccion', 'NIC', 'Título']}
                    />
                </section>
            </div>
        );
    }

    getCurrentProject() {
        const { match, customer } = this.props;
        if (typeof match.params.project_id !== 'undefined' && customer.current.customer_projects.length) {
            return customer.current.customer_projects.filter(project => project.id === Number(match.params.project_id))[0];
        }
        return {
            id: undefined,
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
