/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../../utils/FromGenerator';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR, STATUS } from '../../../constants';
import {
    fetchFinancialEntities,
    fetchFinancialStates
} from '../../../actions/metaActions';
import {
    fetchCustomer,
    clearCurrentCustomer,
    clearCustomers, createCustomerFinancial, updateCustomerFinancial
} from '../../../actions/customerAction';
import { notifications } from '../../../actions/appActions';
import { hasAccess } from '../../../utils/config';
import Spinner from '../../../utils/Spinner';
import Table from '../../../utils/Table';
import Autocomplete from '../../../utils/Autocomplete';
import { dateToDatetimeString, friendlyDateEs, toDatePicker } from '../../../utils/helpers';

export default class FinancialInfo extends React.Component {
    constructor(props) {
        super(props);

        const { match, customer, dispatch, history, editing } = this.props;

        this.financial_entity = React.createRef();
        this.financial_status = React.createRef();

        this.state = {
            editing: hasAccess(`${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }`, ACCESS_TYPES.WRITE),
            ...this.fields,
            button: {
                disabled: true,
                className: 'col-6',
                value: editing ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
            currentEntity: '',
            currentEntityName: '',
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
        this.onInputChange = this.onInputChange.bind(this);
        this.setCurrentFinancialEntity = this.setCurrentFinancialEntity.bind(this);
        this.getFormElements = this.getFormElements.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const { customer, match, dispatch } = this.props;
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        const { financing } = this.getCurrentFinancing(inst);
        let entity_id = '';

        if (this.state.currentEntity === '') {
            entity_id = typeof financing.financial_entity !== 'undefined' ? financing.financial_entity.id : 1;
        } else {
            entity_id = this.state.currentEntity;
        }

        if (prevProps.customer.current.id !== customer.current.id) {
            this.setState(this.fields);
        }
        if (!prevProps.customer.current.id && this.props.match.params.installation_id && !customer.current.id) {
            this.props.dispatch(fetchCustomer(this.props.match.params.installation_id));
        } else if (typeof match.params.installation_id === 'undefined' && customer.current.id) {
            dispatch(clearCurrentCustomer());
        }
        if (prevState.currentEntity !== Number(entity_id)) {
            this.setState({ currentEntity: Number(entity_id) });
        }
        if (this.financial_entity.current !== null && typeof financing.financial_entity !== 'undefined' && this.state.currentEntityName === '') {
            this.financial_entity.current.input.current.value = financing.financial_entity.name;
        }
    }
    componentDidMount() {
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        const { financing } = this.getCurrentFinancing(inst);

        if (this.financial_entity.current !== null && typeof financing.financial_entity !== 'undefined') {
            this.financial_entity.current.input.current.value = financing.financial_entity.name;
        }
    }

    get fields() {
        return {
            id: '',
            status: { id: '' },
            request_date: '',
            response_date: '',
            requested_amount: '',
            assigned_official: '',
            official_phone: '',
            official_email: '',
            approved_rate: '',
            retention_percentage: '',
            insurance: '',
            number_of_payments: '',
            payments_amount: '',
            status_id: '',
        };
    }

    fetchMeta() {
        const { meta, dispatch } = this.props;
        if (meta.financial_entities.status === STATUS.PENDING) {
            dispatch(fetchFinancialEntities());
        }
        if (meta.financial_states.status === STATUS.PENDING) {
            dispatch(fetchFinancialStates());
        }
    }

    render() {
        const { match, customer, meta } = this.props;

        if (!match.params.customer_id && customer.current.id || meta.financial_states.status === STATUS.PENDING ||
            meta.financial_entities.status === STATUS.PENDING) {
            return <Spinner/>;
        }
        return (
            <div>
                <section className='widget'>
                    <h4>Información financiera</h4>
                    { this.state.editing && this.form || this.renderReadOnly() }
                </section>
            </div>
        );
    }

    renderReadOnly() {
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        const { financing } = this.getCurrentFinancing(inst);
        const entity_name = typeof financing.financial_entity !== 'undefined' ? financing.financial_entity.name : '';
        return (
            <div>
                <Table
                    rows={ [['Entidad Financiera', entity_name],
                        ['Oficial Asignado', financing.assigned_official],
                        ['Telefono del Oficial', financing.official_phone],
                        ['Email del Oficial', financing.official_email],
                        ['Email del Oficial', financing.official_email],
                        ['Fecha de Solicitud', friendlyDateEs(new Date(financing.request_date))],
                        ['Fecha de Respuesta', friendlyDateEs(new Date(financing.response_date))],
                        ['Cantidad Solicitada', financing.requested_amount],
                        ['Taza aprovada', financing.approved_rate],
                        ['Porcentaje de Retención', financing.retention_percentage],
                        ['Seguro', financing.insurance],
                        ['Número de Pagos', financing.number_of_payments],
                        ['Cantidad de Pagos', financing.payments_amount],
                    ] }
                />
            </div>
        );
    }

    get form() {
        const { match, meta } = this.props;
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        const { financing } = this.getCurrentFinancing(inst);
        if (typeof financing === 'undefined') {
            return null;
        }
        if (typeof financing.id === 'undefined' && typeof match.params.installation_id !== 'undefined') {
            return null;
        }
        return <FormGenerator
            key={ 100 }
            formName={ 'new-tenant' }
            inlineSubmit={ true }
            onSubmit={ this.formSubmit }
            className={ 'form-group row' }
            elements={ this.getFormElements(financing, meta) }
            button={ this.state.button }
        />;
    }

    getFormElements(financing, meta) {
        const elements = [
            <div className='col-6 row-item' key={ 100 }>
                <label>Entidad Financiera</label>
                <Autocomplete
                    key={ 200 }
                    name='financial_entity_id'
                    className='form-control '
                    title='Entidad Financiera'
                    placeholder='Entidad Financiera'
                    ref={ this.financial_entity }
                    items={ meta.financial_entities.list.map(obj => ({ key: obj.id, label: obj.name })) }
                    onSelect= { this.setCurrentFinancialEntity }
                />
            </div>,
            {
                className: 'col-6',
                name: 'assigned_official',
                title: 'Oficial Asignado',
                label: 'Oficial Asignado',
                placeholder: 'Oficial Asignado',
                defaultValue: financing.assigned_official,
                validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                className: 'col-6',
                name: 'official_phone',
                title: 'Telefono del Oficial',
                label: 'Telefono del Oficial',
                placeholder: 'Telefono del Oficial',
                defaultValue: financing.official_phone,
                validate: ['phone', 'required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                className: 'col-6',
                name: 'official_email',
                title: 'Email del Oficial',
                label: 'Email del Oficial',
                placeholder: 'Email del Oficial',
                defaultValue: financing.official_email,
                validate: ['required', 'email'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'request_date',
                title: 'Fecha de Solicitud',
                label: 'Fecha de Solicitud',
                placeholder: 'Fecha de Solicitud',
                defaultValue: financing.request_date ? toDatePicker(new Date(financing.request_date)) : '',
                validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'response_date',
                title: 'Fecha de Respuesta',
                label: 'Fecha de Respuesta',
                placeholder: 'Fecha de Respuesta',
                defaultValue: financing.response_date ? toDatePicker(new Date(financing.response_date)) : '',
                validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                className: 'col-6',
                name: 'requested_amount',
                title: 'Cantidad Solicitada',
                label: 'Cantidad Solicitada',
                placeholder: 'Cantidad Solicitada',
                defaultValue: financing.requested_amount,
                validate: ['required', 'number'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                className: 'col-6',
                name: 'approved_rate',
                title: 'Taza aprovada',
                label: 'Taza aprovada',
                placeholder: 'Taza aprovada',
                defaultValue: financing.approved_rate,
                validate: ['required', 'number', 'length:1length:4'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                className: 'col-6',
                name: 'retention_percentage',
                title: 'Porcentaje de Retención',
                label: 'Retenciones',
                placeholder: 'Retenciones',
                defaultValue: financing.retention_percentage,
                validate: ['required', 'number', 'length:1length:4'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                className: 'col-6',
                name: 'insurance',
                title: 'Seguro',
                label: 'Seguro',
                placeholder: 'Seguro',
                defaultValue: financing.insurance,
                validate: ['required', 'number', 'length:1length:8'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                className: 'col-6',
                name: 'number_of_payments',
                title: 'Número de Pagos',
                label: 'Número de Pagos',
                placeholder: 'Número de Pagos',
                defaultValue: financing.number_of_payments,
                validate: ['required', 'number', 'length:1length:4'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
            {
                className: 'col-6',
                name: 'payments_amount',
                title: 'Cantidad de Pagos',
                label: 'Cantidad de Pagos',
                placeholder: 'Cantidad de Pagos',
                defaultValue: financing.payments_amount,
                validate: ['required', 'number', 'length:1length:8'],
                onChange: this.onInputChange,
                autoComplete: 'off',
            },
        ];

        elements.push({
            formElement: 'select',
            className: 'col-6',
            ref: this.financial_status,
            name: 'status_id',
            title: 'Estatus Financial',
            label: 'Estatus Financial',
            defaultValue: financing.status.id,
            options: meta.financial_states.list.map(obj => ({ value: obj.id, label: obj.label })),
        });
        if (this.financial_status.current !== null && typeof financing.status.id !== 'undefined') {
            this.financial_status.current.value = financing.status.id;
        }
        return elements;
    }
    formSubmit(e, data) {
        const financial_data = {};
        const { match, dispatch, history } = this.props;
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        const { financing } = this.getCurrentFinancing(inst);
        let action = createCustomerFinancial;
        let verb = 'creado';
        if (match.params.installation_id && financing.id !== '') {
            action = updateCustomerFinancial;
            verb = 'actualizado';
        }
        Object.keys(this.fields).forEach(field => {
            if (typeof data[field] !== 'undefined') {
                financial_data[field] = data[field].value;
            }
        });
        if (financing.id !== '') {
            financial_data.request_date = dateToDatetimeString(financial_data.request_date);
            financial_data.response_date = dateToDatetimeString(financial_data.response_date);
        }
        financial_data.installation_id = match.params.installation_id;
        financial_data.financial_entity_id = this.state.currentEntity;
        dispatch(action(financial_data, () => {
            dispatch(clearCustomers());
            dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Información financiera ${verb} satisfactoriamente` })
            );
            dispatch(fetchCustomer(match.params.customer_id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
            history.push(`${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }/${match.params.customer_id}/${match.params.project_id}/financiera/${ match.params.installation_id }#`);
            this.setState({
                button: { ...this.state.button, disabled: true }
            });
        }, () => {
            dispatch(notifications({ type: ALERTS.DANGER, message: GENERIC_ERROR }));
        }));
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

    getCurrentInstallation(proj) {
        const { match } = this.props;
        if (typeof match.params.installation_id !== 'undefined' && typeof proj.id !== 'undefined') {
            const result = proj.installations.filter(installation => installation.id === Number(match.params.installation_id))[0];
            return { inst: result };
        }
        return { inst: {
            financing: {
                status: { id: '' },
                request_date: '',
                response_date: '',
                requested_amount: '',
                assigned_official: '',
                official_phone: '',
                official_email: '',
                approved_rate: '',
                retention_percentage: '',
                insurance: '',
                number_of_payments: '',
                payments_amount: '',
                status_id: '',
            },
            egauge_url: '',
            egauge_serial: '',
            egauge_mac: '',
            start_date: '',
            specific_yield: '',
            project_id: '',
            installed_capacity: '',
        }};
    }

    getCurrentFinancing(inst) {
        const { match } = this.props;
        if (typeof match.params.installation_id !== 'undefined' && inst.financing !== null) {
            return { financing: inst.financing };
        }
        return {
            financing: {
                id: '',
                status: { id: 1 },
                request_date: '',
                response_date: '',
                requested_amount: '',
                assigned_official: '',
                official_phone: '',
                official_email: '',
                approved_rate: '',
                retention_percentage: '',
                insurance: '',
                number_of_payments: '',
                payments_amount: '',
            }};
    }

    onInputChange({ target }, validate) {
        const state = {};
        if (validate[target.name].isValid) {
            state[target.name] = validate[target.name].value;
        }
        let valid = true;
        Object.keys(this.fields).forEach(key =>
            valid = typeof validate[key] === 'undefined' || valid && validate[key].isValid);
        this.setState({
            ...state,
            button: { ...this.state.button, disabled: !valid }
        });
    }

    setCurrentFinancialEntity(target) {
        if (typeof target.label !== 'undefined') {
            this.setState({
                currentEntity: target.key,
                currentEntityName: target.label,
                button: { ...this.state.button, disabled: false }
            });
            this.financial_entity.current.input.current.value = target.label;
            debugger;
            return;
        }
        this.setState({
            currentEntity: target.target.value,
            currentEntityName: target.target.label,
            button: { ...this.state.button, disabled: false }
        });
        this.financial_entity.current.input.current.value = target.label;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        editing: PropTypes.bool,
        meta: PropTypes.object,
        history: PropTypes.object,
        customer: PropTypes.object,
        match: PropTypes.object,
    };
}
