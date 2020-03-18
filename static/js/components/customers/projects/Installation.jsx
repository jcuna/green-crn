/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../../utils/FromGenerator';
import { hasAccess } from '../../../utils/config';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR, STATUS } from '../../../constants';
import {
    createCustomerInstallation,
    clearCustomersInstallation, fetchCustomer, clearCurrentCustomer, updateCustomerInstallation,
} from '../../../actions/customerAction';
import { notifications } from '../../../actions/appActions';
import {
    fetchInverterModels, fetchPanelModels,
} from '../../../actions/metaActions';
import { dateToDatetimeString, friendlyDateEs, toDatePicker } from '../../../utils/helpers';
import Autocomplete from '../../../utils/Autocomplete';
import FontAwesome from '../../../utils/FontAwesome';
import '../../../../css/installation.scss';
import Table from '../../../utils/Table';

export default class Installation extends React.Component {
    constructor(props) {
        super(props);

        const { customer, match, dispatch } = props;
        this.state = {
            editing: hasAccess(`${ENDPOINTS.CUSTOMER_PROJECTS_URL}`, ACCESS_TYPES.WRITE),
            button: {
                disabled: false,
                className: 'col-12',
                value: this.props.editing ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
            inverters: [],
            inverter: { id: '', Descripcion: '', Cantidad: 0, Eliminar: 0 },
            panels: [],
            panel: { key: '', label: '', amount: 0 },
            inst: {},
        };

        if (typeof match.params.customer_id !== 'undefined' && customer.current.id !== Number(match.params.customer_id)) {
            dispatch(fetchCustomer(match.params.customer_id, Function, () => {
                // history.push(ENDPOINTS.NOT_FOUND);
            }));
        } else if (typeof match.params.customer_id === 'undefined') {
            dispatch(clearCurrentCustomer());
        }

        this.fetchMeta();
        this.formSubmit = this.formSubmit.bind(this);
        this.addInverter = this.addInverter.bind(this);
        this.handleInverterChange = this.handleInverterChange.bind(this);
        this.handlePanelChange = this.handlePanelChange.bind(this);
        this.removeInverter = this.removeInverter.bind(this);
        this.addPanel = this.addPanel.bind(this);
        this.onInputChange = this.onInputChange.bind(this);
        this.removePanel = this.removePanel.bind(this);
        this.removeInverter = this.removeInverter.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        if (typeof inst.id !== 'undefined' && prevState.inst.id !== inst.id) {
            if (inst.inverters.length > 0) {
                inst.inverters.forEach(inverter => this.addInverter({
                    key: inverter.inverter_model.id,
                    quantity: inverter.inverter_quantity,
                    id: inverter.inverter_model.id,
                    label: inverter.inverter_model.label
                }));
            }
            if (inst.panels.length > 0) {
                inst.panels.forEach(panel => this.addPanel({
                    key: panel.panel_model.id,
                    quantity: panel.panel_quantity,
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
                    quantity: inverter.inverter_quantity,
                    id: inverter.inverter_model.id,
                    label: inverter.inverter_model.label
                }));
            }
            if (inst.panels.length > 0) {
                inst.panels.forEach(panel => this.addPanel({
                    key: panel.panel_model.id,
                    quantity: panel.panel_quantity,
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
    }

    render() {
        return (
            <div>
                <section className='widget'>
                    <h4>Detalles de instalacion</h4>
                    { this.state.editing && this.form || this.renderReadOnly() }
                </section>
            </div>
        );
    }

    renderReadOnly() {
        const { match } = this.props;

        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);

        if (typeof proj.id === 'undefined' && typeof match.params.project_id !== 'undefined') {
            return (
                <h1>read only</h1>
            );
        }

        return <div>
            <Table
                rows={ [['Installed Capacity', inst.installed_capacity], ['Egauge', inst.egauge_url], ['Egauge Serial', inst.egauge_serial], ['Detalle', inst.detailed_performance], ['Fecha de Inicio', friendlyDateEs(new Date(inst.start_date))]
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
        if (typeof proj.id === 'undefined' && typeof match.params.project_id !== 'undefined') {
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
                        validate: ['required', 'regex:^(?:http(s)?:\\/\\/)?[\\w.-]+(?:\\.[\\w\\.-]+)+[\\w\\-\\._~:/?#[\\]@!\\$&\'\\(\\)\\*\\+,;=.]+$'],
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
                        defaultValue: toDatePicker(new Date(inst.start_date)),
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'detailed_performance',
                        title: 'Detalle de desempeño',
                        placeholder: 'Detalle de desempeño',
                        defaultValue: inst.detailed_performance,
                        validate: ['required', 'number'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    <div className='col-6 row-item' key={ 100 }>
                        <Autocomplete
                            className='form-control'
                            title='Modelo de inversor'
                            placeholder='Modelo de inversor'
                            items={ meta.inverter_models.list.map(obj => ({ key: obj.id, label: obj.label })) }
                            onSelect= { this.addInverter }
                        />
                    </div>,
                    <div className='col-6 row-item' key={ 200 }>
                        <Autocomplete
                            className='form-control'
                            title='Panel'
                            placeholder='Panel'
                            items={ meta.panel_models.list.map(obj => ({ key: obj.id, label: obj.label })) }
                            onSelect= { this.addPanel }
                        />
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
                    </div>
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
        installation_data.project_id = this.props.match.params.project_id;
        installation_data.inverters = this.state.inverters;
        installation_data.panels = this.state.panels;
        this.props.dispatch(action(installation_data, ({ id }) => {
            this.props.dispatch(clearCustomersInstallation());
            this.props.dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Instalación ${verb} satisfactoriamente` })
            );
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
            // panel_models: { id: 1 },
            egauge_url: '',
            egauge_serial: '',
            egauge_mac: '',
            start_date: '',
            detailed_performance: '',
            project_id: '',
            installed_capacity: '',
            // inverter_models: { id: 1 },
        }};
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

    get fields() {
        return {
            installed_capacity: '',
            panel_models: { id: 1 },
            egauge_url: '',
            egauge_serial: '',
            egauge_mac: '',
            start_date: '',
            detailed_performance: '',
        };
    }

    addInverter(target) {
        const { inverters } = this.state;
        if (target.key === 0 && target.label === '' || inverters.some(inverter => inverter.key === target.key)) {
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

    addPanel(target) {
        const { panels } = this.state;
        if (target.key === 0 && target.label === '' || panels.some(panel => panel.key === target.key)) {
            return;
        }
        if (typeof target.quantity === 'undefined') {
            target.quantity = 1;
        }
        target.id = target.key;
        panels.push(target);
        this.setState({ panels });
    }

    removePanel({ target: { parentElement: { parentElement }}}) {
        const { panels } = this.state;
        panels.splice(panels.indexOf(parentElement.getAttribute('data-id')), 1);
        this.setState({ panels });
    }

    renderPanelTable(readOnly) {
        return this.state.panels.map((panel, index) => {
            const { id, label, quantity } = panel; //destructuring
            if (!readOnly) {
                return (
                    <tr key={ index }>
                        <td>{id}</td>
                        <td>{label}</td>
                        <td><input className='quantity-input' data-id={ id } type='number' defaultValue={ quantity } onChange={ this.handlePanelChange }/></td>
                        <td data-id={ index } onClick={ this.removePanel }>
                            {<FontAwesome className='delete-icon' type='fas fa-times'/>}
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

    handlePanelChange({ target }) {
        const { panels } = this.state;
        const result = panels.slice();

        if (panels.length <= 0) {
            return;
        }
        let i = 0;
        for (i = 0; i < result.length; i++) {
            if (Number(result[i].key) === Number(target.getAttribute('data-id'))) {
                result[i].quantity = target.value;
            }
        }
        this.setState({ panels: result });
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
