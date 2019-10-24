/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../utils/FromGenerator';
import { STATUS } from '../../constants';
import { fetchCountries, fetchSourceProjects } from '../../actions/metaActions';

export default class CustomersInfo extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editing: true,
            first_name: '',
            last_name: '',
            primary_email: '',
            secondary_email: '',
            primary_phone: '',
            secondary_phone: '',
            identification_number: '',
            address: '',
            country: 1,
            province: 0,
            button: {
                disabled: true,
                className: 'col-6',
                value: this.props.editing ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
        };

        this.formSubmit = this.formSubmit.bind(this);
        this.onInputChange = this.onInputChange.bind(this);

        this.fetchMeta();
    }

    fetchMeta() {
        if (this.props.meta.countries.status === STATUS.PENDING) {
            this.props.dispatch(fetchCountries());
        }
        if (this.props.meta.countries.status === STATUS.PENDING) {
            this.props.dispatch(fetchSourceProjects());
        }
    }

    render() {
        return (
            <div>
                <section className='widget'>
                    <h4>Informacion General</h4>
                    { this.props.editing || this.state.editing && this.renderWrite() || this.renderReadOnly() }
                </section>
            </div>
        );
    }

    renderReadOnly() {
        return (
            <h1>read only</h1>
        );
    }

    renderWrite() {
        return this.form;
    }

    get form() {
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
                    defaultValue: this.state.first_name,
                    validate: 'required',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'last_name',
                    placeholder: 'Apellidos',
                    defaultValue: this.state.last_name,
                    validate: 'required',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'primary_email',
                    placeholder: 'Email',
                    defaultValue: this.state.primary_email,
                    validate: ['required', 'email'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'secondary_email',
                    placeholder: 'Email secundario',
                    defaultValue: this.state.secondary_email,
                    validate: 'email',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'primary_phone',
                    placeholder: 'Telefono',
                    defaultValue: this.state.primary_phone,
                    validate: ['phone', 'required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'secondary_phone',
                    placeholder: 'Telefono secundario',
                    defaultValue: this.state.secondary_phone,
                    validate: ['required'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'identification_number',
                    placeholder: 'Cedula (000-0000000-1)',
                    defaultValue: this.state.identification_number,
                    validate: ['required', 'regex:^[0-9]{3}-[0-9]{7}-[0-9]'],
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    className: 'col-6',
                    name: 'address',
                    placeholder: 'Direccion',
                    defaultValue: this.state.address,
                    validate: 'required',
                    onChange: this.onInputChange,
                    autoComplete: 'off',
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'country',
                    label: 'Pais',
                    defaultValue: 1,
                    validate: ['required'],
                    options: this.props.meta.countries.list.map(obj => ({ value: obj.id, label: obj.name })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-6',
                    name: 'province',
                    label: 'Provincia',
                    defaultValue: 1,
                    validate: ['required'],
                    options: this.props.meta.countries.list.length &&
                        this.props.meta.countries.list.filter(c => c.id === Number(this.state.country))[0].provinces
                            .map(p => ({ value: p.id, label: p.name })),
                    onChange: this.onInputChange,
                },
                {
                    formElement: 'select',
                    className: 'col-12',
                    name: 'source',
                    label: 'Fuente de projecto',
                    defaultValue: 1,
                    validate: ['required'],
                    options: this.props.meta.source_projects.list.map(obj => ({ value: obj.id, label: obj.label })),
                    onChange: this.onInputChange,
                },
            ] }
            button={ this.state.button }
        />;
    }

    formSubmit() {

    }

    onInputChange({ target }, validate) {
        if (validate[target.name].isValid) {
            this.setState({ [target.name]: validate[target.name].value });
        }
    }

    static propTypes = {
        dispatch: PropTypes.func,
        editing: PropTypes.bool,
        meta: PropTypes.object,
    };
}
