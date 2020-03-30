/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../../utils/FromGenerator';
import { hasAccess } from '../../../utils/config';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR, MONTHS, STATUS } from '../../../constants';
import {
    createCustomerInstallation,
    clearCustomersInstallation, fetchCustomer, clearCurrentCustomer, updateCustomerInstallation,
} from '../../../actions/customerAction';
import { clearNotifications, notifications, showOverlay } from '../../../actions/appActions';
import {
    fetchInverterModels, fetchPanelModels, fetchSaleTypes,
} from '../../../actions/metaActions';
import { dateToDatetimeString, friendlyDateEs, toDatePicker } from '../../../utils/helpers';
import Autocomplete from '../../../utils/Autocomplete';
import FontAwesome from '../../../utils/FontAwesome';
import '../../../../css/installation.scss';
import Table from '../../../utils/Table';
import '../../../utils/helpers';

export default class Installation extends React.Component {
    constructor(props) {
        super(props);

        const { customer, match, dispatch } = props;

        this.panel_select = React.createRef();
        this.historyref = React.createRef();

        this.state = {
            editing: hasAccess(`${ENDPOINTS.CUSTOMER_PROJECTS_URL}`, ACCESS_TYPES.WRITE),
            button: {
                disabled: false,
                className: 'col-12',
                value: this.props.editing ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
            inverters: [],
            inverter: { Descripcion: '', Cantidad: 0, Seriales: '' },
            panels: [],
            panel: { key: '', label: '', amount: 0 },
            inst: {},
            summary: { Año: '', Mes: 0, Consumo: '', Potencia: '', Generacion: '' },
            setup_summary: [],
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
        this.addInverter = this.addInverter.bind(this);
        this.addHistory = this.addHistory.bind(this);
        this.handleInverterChange = this.handleInverterChange.bind(this);
        // this.handlePanelChange = this.handlePanelChange.bind(this);
        this.removeInverter = this.removeInverter.bind(this);
        this.addPanel = this.addPanel.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.removePanel = this.removePanel.bind(this);
        this.viewPanelSerials = this.viewPanelSerials.bind(this);
        this.removePanelSerial = this.removePanelSerial.bind(this);
        this.cleanPanels = this.cleanPanels.bind(this);
        this.removeInverter = this.removeInverter.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        if (typeof inst === 'undefined') {
            return;
        }
        if (typeof inst.id !== 'undefined' && prevState.inst.id !== inst.id) {
            if (inst.inverters.length > 0) {
                inst.inverters.forEach(inverter => this.addInverter({
                    key: inverter.inverter_model.id,
                    quantity: inverter.quantity,
                    id: inverter.inverter_model.id,
                    label: inverter.inverter_model.label
                }));
            }
            if (inst.panels.length > 0) {
                inst.panels.forEach(panel => this.addPanel({
                    key: panel.panel_model.id,
                    quantity: panel.quantity,
                    id: panel.panel_model.id,
                    label: panel.panel_model.label
                }));
            }
            this.setState({ inst });
        }
    }

    componentDidMount() {
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        if (typeof inst.id !== 'undefined') {
            if (inst.inverters.length > 0) {
                inst.inverters.forEach(inverter => this.addInverter({
                    key: inverter.inverter_model.id,
                    quantity: inverter.quantity,
                    id: inverter.inverter_model.id,
                    label: inverter.inverter_model.label
                }));
            }
            if (inst.panels.length > 0) {
                inst.panels.forEach(panel => this.addPanel({
                    key: panel.panel_model.id,
                    quantity: panel.quantity,
                    id: panel.panel_model.id,
                    label: panel.panel_model.label
                }));
            }
            this.setState({ inst });
        }
    }

    fetchMeta() {
        if (this.props.meta.inverter_models.status === STATUS.PENDING) {
            this.props.dispatch(fetchInverterModels());
        }
        if (this.props.meta.panel_models.status === STATUS.PENDING) {
            this.props.dispatch(fetchPanelModels());
        }
        if (this.props.meta.sale_types.status === STATUS.PENDING) {
            this.props.dispatch(fetchSaleTypes());
        }
    }

    render() {
        return (
            <div>
                <section className='widget'>
                    <h4>Detalles de instalación</h4>
                    { this.state.editing && this.form || this.renderReadOnly() }
                </section>
            </div>
        );
    }

    renderReadOnly() {
        const { match } = this.props;

        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);

        if (typeof inst === 'undefined') {
            return null;
        }
        if (typeof proj.id === 'undefined' && typeof match.params.project_id !== 'undefined') {
            return (
                <h1>read only</h1>
            );
        }

        return <div>
            <Table
                rows={ [['Installed Capacity', inst.installed_capacity], ['Egauge', inst.egauge_url], ['Egauge Serial', inst.egauge_serial], ['Detalle', inst.specific_yield], ['Fecha de Inicio', friendlyDateEs(new Date(inst.start_date))]
                ] }
            />
            <div>
                <div className='row'>
                    <div className='col-6'>
                        <h4 id='title'>Inversores</h4>
                        <table className='inverters' id='invertersTable'>
                            <tbody>
                                <tr>{this.renderTableHeader(true)}</tr>
                                {this.renderInverterTable(true)}
                            </tbody>
                        </table>
                    </div>
                    <div className='col-6'>
                        <h4 id='title'>Paneles</h4>
                        <table className='inverters' id='panesTable'>
                            <tbody>
                                <tr>{this.renderTableHeader(true)}</tr>
                                {this.renderPanelTable(true)}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>;
    }

    get form() {
        const { meta, match } = this.props;

        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        if (typeof inst === 'undefined') {
            return null;
        }
        if (typeof inst.id === 'undefined' && typeof match.params.installation_id !== 'undefined') {
            return null;
        }
        return <div>
            <FormGenerator
                formName={ 'new-tenant' }
                inlineSubmit={ true }
                onSubmit={ this.formSubmit }
                className={ 'form-group row' }
                elements={ [
                    {
                        className: 'col-6',
                        name: 'installed_capacity',
                        title: 'Capacidad Instalada',
                        placeholder: 'Capacidad Instalada',
                        defaultValue: inst.installed_capacity,
                        validate: ['required', 'number'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'egauge_url',
                        title: 'Egauge',
                        placeholder: 'Egauge',
                        defaultValue: inst.egauge_url,
                        validate: ['required', 'regex:^http(s)?:\\/\\/[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+(?<!/)$'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'egauge_serial',
                        title: 'Serial',
                        placeholder: 'Serial',
                        defaultValue: inst.egauge_serial,
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'egauge_mac',
                        title: 'Egauge MAC',
                        placeholder: 'Egauge MAC',
                        defaultValue: inst.egauge_mac,
                        validate: ['required', 'regex:^([0-9a-fA-F][0-9a-fA-F]:){5}([0-9a-fA-F][0-9a-fA-F])$'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        type: 'date',
                        className: 'col-6',
                        name: 'start_date',
                        title: 'Fecha de Inicio',
                        placeholder: 'Fecha de Inicio',
                        defaultValue: inst.start_date ? toDatePicker(new Date(inst.start_date)) : '',
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'specific_yield',
                        title: 'Rendimiento Especifico:',
                        placeholder: 'Rendimiento Especifico',
                        defaultValue: inst.specific_yield,
                        validate: ['required', 'number'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'responsible_party',
                        title: 'Responsable',
                        placeholder: 'Responsable',
                        defaultValue: inst.installed_capacity,
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'price_per_kwp',
                        title: 'Precio por kilowatt',
                        placeholder: 'Precio por kilowatt',
                        defaultValue: inst.installed_capacity,
                        validate: ['required', 'number'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        formElement: 'select',
                        className: 'col-6',
                        name: 'sale_type_id',
                        title: 'Tipo de Venta',
                        label: 'Tipo de Venta',
                        defaultValue: 1, //meta.sale_types.distributor.id || 1,
                        validate: ['required'],
                        options: meta.sale_types.list.map(obj => ({ value: obj.id, label: obj.label })),
                        onChange: this.onInputChange,
                    },
                    <div className='col-12 row' key={ 123 } >
                        <label> Datos Historicos  </label>
                        <div className='row' ref={ this.historyref }>
                            <div className='col-2 row-item'>
                                <input className='form-control'
                                    name='consumption_year'
                                    title='año'
                                    placeholder='año'
                                    autoComplete='off'
                                    //pattern='^[12][0-9]{3}$'
                                />
                            </div>
                            <div className='col-2 row-item'>
                                <select className='form-control'
                                    name='consumption_value'
                                    title='consumo'
                                    autoComplete='off'>
                                    { MONTHS.map((month, index) => <option value={ index } key={ index }>{month}</option>)}
                                </select>
                            </div>
                            <div className='col-2 row-item'>
                                <input className='form-control'
                                    name='consumption_value'
                                    title='consumo'
                                    placeholder='consumo'
                                    autoComplete='off' />
                            </div>
                            <div className='col-2 row-item'>
                                <input className='form-control'
                                    name='power_value'
                                    title='Potencia'
                                    placeholder='Potencia'
                                    autoComplete='off' />
                            </div>
                            <div className='col-2 row-item'>
                                <input className='form-control'
                                    name='generation_value'
                                    title='Generación Esperada'
                                    placeholder='Generación Esperada'
                                    autoComplete='off' />
                            </div>
                            <div className='col-2 row-item'>
                                <button className='form-control'
                                    name='consumption_value'
                                    title='consumo'
                                    placeholder='consumo'
                                    // onChange={ this.onInputChange }
                                    onClick={ this.addHistory }>
                                    Añadir
                                </button>
                            </div>
                        </div>
                    </div>,
                    <div className='col-6 row' key={ 100 }>
                        <div className='col-6 row-item' >
                            <Autocomplete
                                className='form-control'
                                title='Modelo de inversor'
                                placeholder='Modelo de inversor'
                                items={ meta.inverter_models.list.map(obj => ({ key: obj.id, label: obj.label })) }
                                onSelect= { () => {} }
                            />
                        </div>
                        <div className='col-6 row-item' >
                            <input className='form-control'
                                name='inverter_serial'
                                title='Serial'
                                placeholder='Serial'
                                onChange={ this.onInputChange }
                                autoComplete='off' />
                        </div>
                    </div>,
                    <div className='col-6 row' key={ 200 }>
                        <div className='col-6 row-item' >
                            <Autocomplete
                                className='form-control'
                                ref={ this.panel_select }
                                title='Panel'
                                placeholder='Panel'
                                items={ meta.panel_models.list.map(obj => ({ key: obj.id, label: obj.label })) }
                                onSelect= { () => {} }
                            />
                        </div>
                        <div className='col-6 row-item' >
                            <input className='form-control'
                                name='panel_serial'
                                title='Serial'
                                placeholder='Serial'
                                autoComplete='off'
                                onKeyPress={ this.addPanel }
                            />
                        </div>
                    </div>,
                    <div className='col-12' key={ 300 }>
                        <div className='row'>
                            <div className='col-6' key={ 400 }>
                                <h4 id='title'>Inversores</h4>
                                <div className='table table-responsive'>
                                    <table className='inverters' id='invertersTable'>
                                        <tbody>
                                            <tr>{this.renderTableHeader()}</tr>
                                            {this.renderInverterTable()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className='col-6' key={ 500 }>
                                <h4 id='title'>Paneles</h4>
                                <div className='table table-responsive'>
                                    <table className='inverters' id='panesTable'>
                                        <tbody>
                                            <tr>{this.renderTableHeader()}</tr>
                                            {this.renderPanelTable()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>,
                    <div className='col-12 row' key={ 600 }>
                        <div className='col-12' key={ 700 }>
                            <h4 id='title'>Historial</h4>
                            <div className='table table-responsive'>
                                <table className='inverters' id='summaryTable'>
                                    <tbody>
                                        <tr>{this.renderSummaryTableHeader()}</tr>
                                        {this.renderSummaryTable()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>,
                ] }
                button={ this.state.button }
            />

        </div>;
    }

    formSubmit(e, data) {
        const { match } = this.props;
        const installation_data = {};
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);

        let action = createCustomerInstallation;
        let verb = 'creado';
        if (match.params.installation_id) {
            action = updateCustomerInstallation;
            verb = 'actualizado';
            installation_data.id = match.params.installation_id;
        }
        Object.keys(this.fields).forEach(field => {
            if (typeof data[field] !== 'undefined') {
                installation_data[field] = data[field].value;
            }
        });
        if (typeof inst.id !== 'undefined') {
            installation_data.start_date = dateToDatetimeString(installation_data.start_date);
        }
        installation_data.egauge_mac = installation_data.egauge_mac.trim();
        installation_data.egauge_url = installation_data.egauge_url.trim();
        installation_data.project_id = this.props.match.params.project_id;
        installation_data.inverters = this.state.inverters;
        installation_data.panels = this.state.panels;
        installation_data.setup_summary = this.state.setup_summary;
        this.props.dispatch(action(installation_data, ({ id }) => {
            this.props.dispatch(clearCustomersInstallation());
            this.props.dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Instalación ${verb} satisfactoriamente` })
            );
            this.props.dispatch(fetchCustomer(match.params.customer_id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
            this.props.history.push(`${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }/${match.params.customer_id}/${match.params.project_id}/info/${ id || installation_data.id }#`);
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

        Object.keys(this.fields).forEach(key => valid = typeof validate[key] === 'undefined' || valid && validate[key].isValid);
        if (target.name === 'egauge_url' && String(validate.egauge_url.value).substring(0, 6).toUpperCase() !== 'HTTPS:') {
            this.props.dispatch(notifications({ type: ALERTS.WARNING, message: 'Es recomendable ingresar una dirección segura ( https ) a menos que no sea posible' }));
        } else {
            this.props.dispatch(clearNotifications());
        }
        this.setState({
            ...state,
            button: { ...this.state.button, disabled: !valid }
        });
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
            egauge_url: '',
            egauge_serial: '',
            egauge_mac: '',
            start_date: '',
            specific_yield: '',
            project_id: '',
            installed_capacity: '',
        }};
    }

    get fields() {
        return {
            installed_capacity: '',
            panel_models: { id: 1 },
            egauge_url: '',
            egauge_serial: '',
            egauge_mac: '',
            start_date: '',
            specific_yield: '',
            price_per_kwp: '',
            sale_type_id: '',
            responsible_party: '',
            consumption_year: '',
            consumption_value: '',
        };
    }

    addInverter(target) {
        const { inverters } = this.state;
        if (target.key === 0 && target.label === '' || inverters.some(inverter => Number(inverter.key) === Number(target.key))) {
            return;
        }
        if (typeof target.quantity === 'undefined') {
            target.quantity = 1;
        }
        target.id = target.key;
        inverters.push(target);
        this.setState({ inverters });
    }

    removeInverter({ target: { parentElement: { parentElement }}}) {
        const { inverters } = this.state;
        inverters.splice(inverters.indexOf(parentElement), 1);
        this.setState({ inverters });
    }

    renderInverterTable(readOnly) {
        return this.state.inverters.map((inverter, index) => {
            const { id, label, quantity } = inverter; //destructuring
            if (!readOnly) {
                return (
                    <tr key={ index }>
                        <td >{id}</td>
                        <td>{label}</td>
                        <td><input className='quantity-input' data-id={ id } type='number' defaultValue={ quantity } onChange={ this.handleInverterChange }/> </td>
                        <td data-id={ index } onClick={ this.removeInverter }>
                            { <FontAwesome className='delete-icon' type='fas fa-times'/> }
                        </td>
                    </tr>
                );
            }
            return (
                <tr key={ index }>
                    <td>{id}</td>
                    <td>{label}</td>
                    <td><input className='quantity-input' data-id={ id } disabled={ true } type='number' defaultValue='1'/></td>
                </tr>
            );
        });
    }

    renderTableHeader(readOnly) {
        const header = Object.keys(this.state.inverter);
        if (readOnly) {
            header.pop();
        }
        return header.map((key, index) => {
            return <th key={ index }>{key.toUpperCase()}</th>;
        });
    }
    renderSummaryTableHeader(readOnly) {
        const header = Object.keys(this.state.summary);
        if (readOnly) {
            header.pop();
        }
        return header.map((key, index) => {
            return <th key={ index }>{key.toUpperCase()}</th>;
        });
    }

    addPanel(target) {
        const { panels } = this.state;
        const inverter_model = this.panel_select.current.props.items.find(panel => panel.label === this.panel_select.current.input.current.value);
        if (typeof inverter_model === 'undefined') {
            return;
        }
        let result = panels.find(panel => panel.key === inverter_model.key);
        if (typeof result === 'undefined') {
            result = inverter_model;
            result.quantity = 0;
            result.serials = [];
        }
        if (target.key === 'Enter') {
            target.preventDefault();
            if (target.currentTarget.value === '') {
                this.props.dispatch(notifications({ type: ALERTS.WARNING, message: 'El campo serial no puede estar vacio' }));
                return;
            }
            if (result.serials.indexOf(target.currentTarget.value) !== -1) {
                this.props.dispatch(notifications({ type: ALERTS.WARNING, message: 'El serial ingresado ya existe para este modelo' }));
                return;
            }
            result.serials.push(target.currentTarget.value);
            result.quantity++;
            result.id = result.key;
            if (panels.indexOf(result) === -1) {
                panels.push(result);
            }
            this.setState({ panels });
            target.currentTarget.value = '';
        }
    }

    addHistory(target) {
        target.preventDefault();
        const { setup_summary } = this.state;
        const year = this.historyref.current.children[0].children[0].value;
        const month = this.historyref.current.children[1].children[0].value;
        const consumption_value = this.historyref.current.children[2].children[0].value;
        const power_value = this.historyref.current.children[3].children[0].value;
        const generation_value = this.historyref.current.children[4].children[0].value;
        let register;
        if (typeof setup_summary.historical_consumption !== 'undefined') {
            const exists = setup_summary.historical_consumption.find(registry => registry.year === year && registry.month === month);
            if (typeof exists !== 'undefined') {
                this.props.dispatch(notifications({ type: ALERTS.WARNING, message: 'Existe un registro para la fecha indicada' }));
                return;
            }
            register = setup_summary;
        } else {
            register = {
                historical_consumption: [],
                historical_power: [],
                expected_generation: [],
            };
        }
        if (register.historical_consumption > 11) {
            this.props.dispatch(notifications({ type: ALERTS.WARNING, message: 'Se ha alcanzado la cantidad maxima de registros del historial' }));
            return;
        }
        if (year === '' || consumption_value === '' || power_value === '' || generation_value === '') {
            this.props.dispatch(notifications({ type: ALERTS.WARNING, message: 'Debe completar los valores del historial' }));
            return;
        }
        register.historical_consumption.push(
            { year, month, consumption_value }
        );
        register.historical_power.push(
            { year, month, power_value }
        );
        register.expected_generation.push(
            { year, month, generation_value }
        );
        this.setState({ setup_summary: register });
    }

    removePanel({ target: { parentElement: { parentElement }}}) {
        const { panels } = this.state;
        panels.splice(panels.indexOf(parentElement.getAttribute('data-id')), 1);
        this.setState({ panels });
    }

    removePanelSerial({ target: { parentElement: { parentElement }}}) {
        const { panels } = this.state;
        const serial = parentElement.getAttribute('data-id');
        const model = parentElement.getAttribute('data-model');
        const panel = panels.find(panel => panel.label === model);
        if (typeof panel !== 'undefined') {
            panels.splice(panels.indexOf(panel), 1);
            if (panel.serials.indexOf(serial) !== -1) {
                panel.serials.splice(panel.serials.indexOf(serial), 1);
            }
            panel.quantity--;
            panels.push(panel);
        }
        this.setState({ panels });
    }

    cleanPanels() {
        const { panels } = this.state;
        panels.forEach(panel => {
            if (panel.quantity === 0) {
                panels.splice(panels.indexOf(panel), 1);
            }
        });
    }

    viewPanelSerials({ target: { parentElement: { parentElement }}}) {
        const { panels } = this.state;
        const model = panels.find(panel => panel.id === Number(parentElement.getAttribute('data-id')));
        console.log(model.serials);
        this.props.dispatch(
            showOverlay(
                <div className='table-responsive'>
                    <table className='inverters'>
                        <tbody>
                            <tr>
                                <th>Serial</th>
                                <th>Eliminar</th>
                            </tr>
                            { model.serials.map(serial => {
                                return <tr key={ serial } id={ serial }>
                                    <td >{serial}</td>
                                    <td data-id={ serial } data-model={ model.label } onClick={ this.removePanelSerial }>
                                        { <FontAwesome className='delete-icon' type='fas fa-times'/> }
                                    </td>
                                </tr>;
                            }) }
                        </tbody>
                    </table>
                </div>,
                <div>Seriales modelo {model.label}</div>,
                true,
                null,
                this.cleanPanels
            )
        );
    }

    renderPanelTable(readOnly) {
        return this.state.panels.map((panel, index) => {
            const { id, label, quantity } = panel; //destructuring
            if (!readOnly) {
                return (
                    <tr key={ index }>
                        <td>{label}</td>
                        <td>{quantity}</td>
                        <td data-id={ id } onClick={ this.viewPanelSerials }>
                            {<FontAwesome className='delete-icon' type='fas fa-eye'/>}
                        </td>
                    </tr>
                );
            }
            return (
                <tr key={ index }>
                    <td>{id}</td>
                    <td>{label}</td>
                    <td><input className='quantity-input' data-id={ id } disabled={ true } type='number' defaultValue='1' /></td>
                </tr>
            );
        });
    }

    renderSummaryTable(readOnly) {
        const { installation_summary } = this.state;
        if (typeof installation_summary === 'undefined') {
            return;
        }
        return installation_summary.historical_consumption.map((history, index) => {
            const { year, month, value } = history; //destructuring
            if (!readOnly) {
                return (
                    <tr key={ index }>
                        <td>{year}</td>
                        <td>{month}</td>
                        <td>{value}</td>
                        <td data-id={ id } onClick={ this.viewPanelSerials }>
                            {<FontAwesome className='delete-icon' type='fas fa-eye'/>}
                        </td>
                    </tr>
                );
            }
            return (
                <tr key={ index }>
                    <td>{id}</td>
                    <td>{label}</td>
                    <td><input className='quantity-input' data-id={ id } disabled={ true } type='number' defaultValue='1' /></td>
                </tr>
            );
        });
    }

    handleInverterChange({ target }) {
        const { inverters } = this.state;
        const result = inverters.slice();

        if (inverters.length <= 0) {
            return;
        }
        let i = 0;
        for (i = 0; i < result.length; i++) {
            if (Number(result[i].key) === Number(target.getAttribute('data-id'))) {
                result[i].quantity = target.value;
            }
        }
        this.setState({ inverters: result });
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
}
