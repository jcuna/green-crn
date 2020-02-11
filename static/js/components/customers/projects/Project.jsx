/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../utils/Breadcrumbs';
import FormGenerator from '../../../utils/FromGenerator';
import { hasAccess } from '../../../utils/config';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR, STATUS } from '../../../constants';
import {
    clearCurrentCustomer,
    clearCustomersProject,
    createCustomerProject,
    fetchCustomer,
    updateCustomerProject,
} from '../../../actions/customerAction';
import {
    fetchCountries,
    fetchDistributors, fetchPhases,
    fetchProjectTypes,
    fetchRates,
    fetchSourceProjects, fetchTensions, fetchTransformers, fetchTrCapacities
} from '../../../actions/metaActions';
import { notifications } from '../../../actions/appActions';
import { Link } from 'react-router-dom';

export default class Project extends React.Component {
    constructor(props) {
        super(props);

        const { customer, match, dispatch, history } = props;

        this.state = {
            editing: hasAccess(`${ ENDPOINTS.CUSTOMER_PROJECTS_URL }`, ACCESS_TYPES.WRITE),
            ...this.getCurrentProject(),
            country: 1,
            button: {
                disabled: false,
                className: 'col-6',
                value: this.props.editing ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
        };
        if (typeof match.params.customer_id !== 'undefined' && customer.current.id !== Number(match.params.customer_id)) {
            dispatch(fetchCustomer(match.params.customer_id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
        } else if (typeof match.params.customer_id === 'undefined') {
            dispatch(clearCurrentCustomer());
        }

        this.fetchMeta();

        this.formSubmit = this.formSubmit.bind(this);
    }

    componentDidMount() {
        // TODO check that the current exist else, fetch it
        const { customer, dispatch, match } = this.props;
        if (!customer.current) {
            dispatch(fetchCustomer(match.params.customer_id));
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { meta: { project_types }} = prevProps;
        const { meta, customer } = this.props;
        if (project_types.length !== meta.project_types.length) {
            this.setState({ project_type_id: meta.project_types.pop().id });
        }
        if (prevProps.customer.current.customer_projects.length !== customer.current.customer_projects.length) {
            this.setState(this.getCurrentProject());
        }
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

    render() {
        const { match, customer } = this.props;
        const path_id = this.getIdPath();

        return (
            <div>
                <Breadcrumbs { ...this.props } title={
                    match.params.action.charAt(0).toUpperCase() + match.params.action.slice(1)
                }/>
                <section className='widget'>
                    <ul className='nav nav-tabs'>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('info') }
                                data-func='projects'
                                to={ `${ ENDPOINTS.CUSTOMER_PROJECTS_URL }/${ customer.current.id }/info${ path_id }` }>
                                Información
                            </Link>
                        </li>
                        <li className='nav-item'>
                            <Link
                                className={ this.getClassName('info') }
                                to={ `${ ENDPOINTS.CUSTOMER_PROJECT_INSTALLATIONS_URL }${ path_id }` }>
                                Instalaciones
                            </Link>
                        </li>
                    </ul>
                    <h4>Detalles de proyectos</h4>
                    { this.state.editing && this.form || this.renderReadOnly() }
                </section>
            </div>
        );
    }

    renderReadOnly() {
        return (
            <h1>read only</h1>
        );
    }

    get form() {
        const { meta } = this.props;
        const proj = this.getCurrentProject();
        if (proj.id === undefined) {
            return null;
        }
        return <FormGenerator
            formName={ 'new-tenant' }
            inlineSubmit={ true }
            onSubmit={ this.formSubmit }
            className={ 'form-group row' }
            elements={ [
                {
                    className: 'col-6',
                    name: 'name',
                    placeholder: 'Nombre',
                    defaultValue: proj.name,
                    validate: 'required',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'address',
                    placeholder: 'Dirección',
                    defaultValue: proj.address,
                    validate: 'required',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'lat',
                    placeholder: 'Latitud',
                    defaultValue: proj.lat,
                    validate: ['required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'long',
                    placeholder: 'Longitud',
                    defaultValue: proj.long,
                    validate: ['required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'nic',
                    placeholder: 'NIC',
                    defaultValue: proj.nic,
                    validate: ['required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'nic_title',
                    placeholder: 'Título',
                    defaultValue: proj.nic_title,
                    validate: ['required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'circuit',
                    placeholder: 'Circuito',
                    defaultValue: proj.circuit,
                    validate: ['required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'ct',
                    placeholder: 'CT',
                    defaultValue: proj.ct,
                    validate: ['required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    formElement: 'select',
                    className: 'col-12',
                    name: 'project_type_id',
                    label: 'Tipo de proyecto',
                    defaultValue: proj.project_type.id,
                    validate: ['required'],
                    options: meta.project_types.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'country',
                    label: 'País',
                    defaultValue: proj.province.country_id || 1,
                    validate: ['required'],
                    options: meta.countries.list.map(obj => ({ value: obj.id, label: obj.name })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'province_id',
                    label: 'Provincia',
                    defaultValue: proj.province.id || 1,
                    validate: ['required'],
                    options: meta.countries.list.length &&
                        meta.countries.list
                            .filter(c => c.id === Number(proj.province.country_id))[0].provinces
                            .map(p => ({ value: p.id, label: p.name })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'distributor_id',
                    label: 'Distribuidor',
                    defaultValue: proj.distributor.id || 1,
                    validate: ['required'],
                    options: meta.distributors.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'rate_id',
                    label: 'Rango',
                    defaultValue: proj.rate.id || 1,
                    validate: ['required'],
                    options: meta.rates.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'transformer_id',
                    label: 'Transformador',
                    defaultValue: proj.transformer.id || 1,
                    validate: ['required'],
                    options: meta.transformers.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'tr_capacity_id',
                    label: 'Capacidad',
                    defaultValue: proj.capacity.id || 1,
                    validate: ['required'],
                    options: meta.tr_capacities.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'phase_id',
                    label: 'Fase',
                    defaultValue: proj.phase.id || 1,
                    validate: ['required'],
                    options: meta.phases.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'tension_id',
                    label: 'Tensión',
                    defaultValue: proj.tension.id || 1,
                    validate: ['required'],
                    options: meta.tensions.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                },
            ] }
            button={ this.state.button }
        />;
    }

    formSubmit(e, data) {
        const project_data = {};
        let action = createCustomerProject;
        let verb = 'creado';

        if (this.state.id) {
            action = updateCustomerProject;
            verb = 'actualizado';
            project_data.id = this.state.id;
        }
        Object.keys(this.fields).forEach(field => {
            if (typeof data[field] !== 'undefined') {
                project_data[field] = data[field].value;
            }
        });
        project_data.customer_id = this.props.customer.current.id;
        this.props.dispatch(action(project_data, ({ id }) => {
            this.props.dispatch(clearCustomersProject());
            this.props.dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Proyecto ${verb} satisfactoriamente` })
            );
            this.props.history.push(`${ ENDPOINTS.CUSTOMER_PROJECTS_URL }/info/${ id || project_data.id }#`);
            this.setState({
                button: { ...this.state.button, disabled: true }
            });
        }, () => {
            this.props.dispatch(notifications({ type: ALERTS.DANGER, message: GENERIC_ERROR }));
        }));
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
        project: PropTypes.object,
        customer: PropTypes.object,
        editing: PropTypes.bool,
        meta: PropTypes.object,
        history: PropTypes.object,
    };

    get fields() {
        return {
            name: this.props.customer.current.customer_projects.name,
            address: this.state.address,
            lat: this.state.lat,
            long: this.state.long,
            coordinates: this.state.coordinates,
            nic: this.state.nic,
            nic_title: this.state.nic_title,
            circuit: this.state.circuit,
            ct: this.state.ct,
            project_type_id: this.state.project_type_id,
            customer_id: this.state.customer_id,
            country: this.state.country_id || 1,
            province_id: this.state.province_id,
            distributor_id: this.state.distributor_id,
            rate_id: this.state.rate_id,
            transformer_id: this.state.transformer_id,
            tr_capacity_id: this.state.tr_capacity_id,
            phase_id: this.state.phase_id,
            tension_id: this.state.tension_id,
        };
    }

    fetchMeta() {
        if (this.props.meta.countries.status === STATUS.PENDING) {
            this.props.dispatch(fetchCountries());
        }
        if (this.props.meta.source_projects.status === STATUS.PENDING) {
            this.props.dispatch(fetchSourceProjects());
        }
        if (this.props.meta.project_types.status === STATUS.PENDING) {
            this.props.dispatch(fetchProjectTypes());
        }
        if (this.props.meta.distributors.status === STATUS.PENDING) {
            this.props.dispatch(fetchDistributors());
        }
        if (this.props.meta.rates.status === STATUS.PENDING) {
            this.props.dispatch(fetchRates());
        }
        if (this.props.meta.tr_capacities.status === STATUS.PENDING) {
            this.props.dispatch(fetchTrCapacities());
        }
        if (this.props.meta.phases.status === STATUS.PENDING) {
            this.props.dispatch(fetchPhases());
        }
        if (this.props.meta.tensions.status === STATUS.PENDING) {
            this.props.dispatch(fetchTensions());
        }
        if (this.props.meta.transformers.status === STATUS.PENDING) {
            this.props.dispatch(fetchTransformers());
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
}
