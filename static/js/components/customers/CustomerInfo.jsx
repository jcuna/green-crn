/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR, STATUS } from '../../constants';
import { fetchCountries, fetchSourceProjects } from '../../actions/metaActions';
import {
    updateCustomer,
    createCustomer,
    fetchCustomer,
    clearCurrentCustomer,
    clearCustomers
} from '../../actions/customerAction';
import { notifications } from '../../actions/appActions';
import { hasAccess } from '../../utils/config';
import Spinner from '../../utils/Spinner';

export default class CustomerInfo extends React.Component {
    constructor(props) {
        super(props);

        const { match, customer, dispatch, history } = this.props;

        this.state = {
            editing: hasAccess(`${ ENDPOINTS.CUSTOMERS_URL }`, ACCESS_TYPES.WRITE),
            ...this.fields,
            button: {
                disabled: true,
                className: 'col-6',
                value: this.props.editing ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
        };

        if (typeof match.params.id !== 'undefined' && customer.id !== Number(match.params.id)) {
            dispatch(fetchCustomer(match.params.id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
        } else if (typeof match.params.id === 'undefined') {
            dispatch(clearCurrentCustomer());
        }
        this.fetchMeta();

        this.formSubmit = this.formSubmit.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { customer, match, dispatch } = this.props;
        if (prevProps.customer.current.id !== customer.current.id) {
            this.setState(this.fields);
        }
        if (!prevProps.customer.current.id && this.props.match.params.id && !customer.current.id) {
            this.props.dispatch(fetchCustomer(this.props.match.params.id));
        } else if (typeof match.params.id === 'undefined' && customer.current.id) {
            dispatch(clearCurrentCustomer());
        }
    }

    get fields() {
        return {
            id: this.props.customer.current.id,
            first_name: this.props.customer.current.first_name,
            last_name: this.props.customer.current.last_name,
            primary_email: this.props.customer.current.primary_email,
            secondary_email: this.props.customer.current.secondary_email,
            primary_phone: this.props.customer.current.primary_phone,
            secondary_phone: this.props.customer.current.secondary_phone,
            identification_number: this.props.customer.current.identification_number,
            address: this.props.customer.current.address,
            source_project_id: this.props.customer.current.source_project_id,
            country: this.props.customer.current.province.country_id || 1,
            province_id: this.props.customer.current.province.id || 1,
        };
    }

    fetchMeta() {
        if (this.props.meta.countries.status === STATUS.PENDING) {
            this.props.dispatch(fetchCountries());
        }
        if (this.props.meta.source_projects.status === STATUS.PENDING) {
            this.props.dispatch(fetchSourceProjects());
        }
    }

    render() {
        const { match, customer } = this.props;
        if (match.params.id && Number(match.params.id) !== this.state.id || !match.params.id && customer.current.id) {
            return <Spinner/>;
        }
        return (
            <div>
                <section className='widget'>
                    <h4>Información General</h4>
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
        const { current } = this.props.customer;
        return <FormGenerator
            formName={ 'new-tenant' }
            inlineSubmit={ true }
            onSubmit={ this.formSubmit }
            className={ 'form-group row' }
            elements={ [
                {
                    className: 'col-6',
                    name: 'first_name',
                    placeholder: 'Nombre',
                    defaultValue: current.first_name,
                    validate: 'required',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'last_name',
                    placeholder: 'Apellidos',
                    defaultValue: current.last_name,
                    validate: 'required',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'primary_email',
                    placeholder: 'Email',
                    defaultValue: current.primary_email,
                    validate: ['required', 'email'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'secondary_email',
                    placeholder: 'Email secundario',
                    defaultValue: current.secondary_email,
                    validate: 'email',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'primary_phone',
                    placeholder: 'Telefono',
                    defaultValue: current.primary_phone,
                    validate: ['phone', 'required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'secondary_phone',
                    placeholder: 'Telefono secundario',
                    defaultValue: current.secondary_phone,
                    validate: ['phone'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'identification_number',
                    placeholder: 'Cedula/RNC (000-0000000-1)/(0-00-00000-0)',
                    defaultValue: current.identification_number,
                    validate: ['required', 'regex:^(([0-9]{3}-[0-9]{7}-[0-9]{1})|([0-9]{1}-[0-9]{2}-[0-9]{5}-[0-9]{1}))$'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'address',
                    placeholder: 'Direccion',
                    defaultValue: current.address,
                    validate: 'required',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'country',
                    label: 'Pais',
                    defaultValue: current.province.country_id || 1,
                    validate: ['required'],
                    options: this.props.meta.countries.list.map(obj => ({ value: obj.id, label: obj.name })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'province_id',
                    label: 'Provincia',
                    defaultValue: current.province.id || 1,
                    validate: ['required'],
                    options: this.props.meta.countries.list.length &&
                        this.props.meta.countries.list
                            .filter(c => c.id === Number(this.state.country))[0].provinces
                            .map(p => ({ value: p.id, label: p.name })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-12',
                    name: 'source_project_id',
                    label: 'Fuente de projecto',
                    defaultValue: current.source_project_id,
                    validate: ['required'],
                    options: this.props.meta.source_projects.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                },
            ] }
            button={ this.state.button }
        />;
    }

    formSubmit(e, data) {
        const customer_data = {};
        let action = createCustomer;
        let verb = 'creado';
        if (this.props.customer.current.id) {
            action = updateCustomer;
            verb = 'actualizado';
            customer_data.id = this.state.id;
        }
        Object.keys(this.fields).forEach(field => {
            if (typeof data[field] !== 'undefined') {
                customer_data[field] = data[field].value;
            }
        });
        this.props.dispatch(action(customer_data, ({ id }) => {
            this.props.dispatch(clearCustomers());
            this.props.dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Cliente ${verb} satisfactoriamente` })
            );
            this.props.history.push(`${ ENDPOINTS.CUSTOMERS_URL }/info/${ id || customer_data.id }#`);
            this.setState({
                button: { ...this.state.button, disabled: true }
            });
        }, () => {
            this.props.dispatch(notifications({ type: ALERTS.DANGER, message: GENERIC_ERROR }));
        }));
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

    static propTypes = {
        dispatch: PropTypes.func,
        editing: PropTypes.bool,
        meta: PropTypes.object,
        history: PropTypes.object,
        customer: PropTypes.object,
        match: PropTypes.object,
    };
}
