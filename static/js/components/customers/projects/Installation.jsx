/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from "../../../utils/FromGenerator";
import {hasAccess} from "../../../utils/config";
import {ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR, STATUS} from "../../../constants";
import {
    createCustomerInstallation,
    clearCustomersInstallation,
} from "../../../actions/customerAction";
import {notifications} from "../../../actions/appActions";
import {
    fetchCountries,
    fetchDistributors, fetchInverterModels, fetchPanelModels, fetchPhases,
    fetchProjectTypes,
    fetchRates,
    fetchSourceProjects, fetchTensions, fetchTransformers, fetchTrCapacities
} from "../../../actions/metaActions";
import { formatDateEs } from '../../../utils/helpers';
import Autocomplete from "../../../utils/Autocomplete";
import {Link} from "react-router-dom";
import FontAwesome from "../../../utils/FontAwesome";
import '../../../../css/installation.scss';
export default class Installation extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editing: hasAccess(`${ENDPOINTS.CUSTOMER_PROJECTS_URL}`, ACCESS_TYPES.WRITE),
            button: {
                disabled: false,
                className: 'col-6',
                value: this.props.editing ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
            inverters: [],
            inverter: { key: '', label: '', amount: 0 },
            panels: [],
            panel: { key: '', label: '', amount: 0 },
        };

        this.fetchMeta();
        this.formSubmit = this.formSubmit.bind(this);
        this.addInverter = this.addInverter.bind(this);
        this.handleInverterChange = this.handleInverterChange.bind(this);
        this.handlePanelChange = this.handlePanelChange.bind(this);
        this.removeInverter = this.removeInverter.bind(this);
        this.addPanel = this.addPanel.bind(this);

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

    get form() {
        const { meta } = this.props;
        const proj = this.getCurrentProject();
        // if (proj.id === undefined) {
        //     return null;
        // }
        const inst = this.getCurrentInstallation(proj);
        // debugger;
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
                        placeholder: 'Capacidad Instalada',
                        defaultValue: inst.installed_capacity,
                        validate: 'required',
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'egauge_url',
                        placeholder: 'Egauge',
                        defaultValue: inst.egauge_url,
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'egauge_serial',
                        placeholder: 'Serial',
                        defaultValue: inst.egauge_serial,
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'egauge_mac',
                        placeholder: 'Egauge MAC',
                        defaultValue: inst.egauge_mac,
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        type: 'date',
                        className: 'col-6',
                        name: 'start_date',
                        placeholder: 'Fecha de Inicio',
                        defaultValue: inst.start_date,
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    {
                        className: 'col-6',
                        name: 'detailed_performance',
                        placeholder: 'Detalla de desempeño',
                        defaultValue: proj.detailed_performance,
                        validate: ['required'],
                        onChange: this.onInputChange,
                        autoComplete: 'off',
                    },
                    <div className='col-6 row-item' key={ 100 }>
                        <Autocomplete
                            className='form-control'
                            placeholder='Modelo de inversor'
                            items={ meta.inverter_models.list.map(obj => ({ key: obj.id, label: obj.label })) }
                            onSelect= { this.addInverter }
                        />
                    </div>,
                    <div className='col-6 row-item' key={ 200 }>
                        <Autocomplete
                            className='form-control'
                            placeholder='Panel'
                            items={ meta.panel_models.list.map(obj => ({ key: obj.id, label: obj.label })) }
                            onSelect= { this.addPanel }
                        />
                    </div>,
                ] }
                button={ this.state.button }
            />
            <div>
                <div className='row'>
                    <div className='col-6'>
                        <h4 id='title'>Inversores</h4>
                        <table className='inverters' id='invertersTable'>
                            <tbody>
                                <tr>{this.renderTableHeader()}</tr>
                                {this.renderInverterTable()}
                            </tbody>
                        </table>
                    </div>
                    <div className='col-6'>
                        <h4 id='title'>Paneles</h4>
                        <table className='inverters' id='panesTable'>
                            <tbody>
                                <tr>{this.renderTableHeader()}</tr>
                                {this.renderPanelTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>;
    }

    formSubmit(e, data) {
        const installation_data = {};
        const action = createCustomerInstallation;
        let verb = 'creado';
        // if (this.state.id) {
        //     action = updateCustomerProject;
        //     verb = 'actualizado';
        //     installation_data.id = this.state.id;
        // }
        Object.keys(this.fields).forEach(field => {
            if (typeof data[field] !== 'undefined') {
                installation_data[field] = data[field].value;
            }
        });
        installation_data.project_id = this.props.match.params.project_id;
        installation_data.inverters = this.state.inverters;
        installation_data.panels = this.state.panels;
        this.props.dispatch(action(installation_data, ({ id }) => {
            this.props.dispatch(clearCustomersInstallation());
            this.props.dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Instalación ${verb} satisfactoriamente` })
            );
            this.props.history.push(`${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }/info/${ id || installation_data.id }#`);
            this.setState({
                button: { ...this.state.button, disabled: true }
            });
        }, () => {
            this.props.dispatch(notifications({ type: ALERTS.DANGER, message: GENERIC_ERROR }));
        }));
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

    getCurrentInstallation(proj) {
        const { match, customer } = this.props;
        if (typeof match.params.installation_id !== 'undefined' && proj !== undefined) {
            const installation = proj.installations.filter(installation => installation.id === Number(match.params.installation_id))[0];
            installation.inverters.forEach(inverter => this.addInverter({key: inverter.inverter_model.id, quantity: inverter.quantity, id: inverter.inverter_model.id, label: inverter.inverter_model.label}));
            installation.panels.forEach(panel => this.addPanel({key: panel.panel_model.id, quantity: panel.quantity, id: panel.panel_model.id, label: panel.panel_model.label}));
            return installation;
        }
        return {
            id: undefined,
            panel_models: { id: 1 },
            egauge_url: '',
            egauge_serial: '',
            egauge_mac: '',
            start_date: '',
            detailed_performance: '',
            project_id: '',
            inverter_models: { id: 1 },
        };
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

    get fields(){
        return {
            id: undefined,
            panel_models: { id: 1},
            egauge_url: '',
            egauge_serial: '',
            egauge_mac: '',
            start_date: '',
            detailed_performance: '',
            project_id: '',
            inverter_models: { id: 1},
        };
    }

    addInverter(target){
        const { inverters } = this.state;
        console.log(target);
        if (target.key === 0 && target.label === '' || inverters.some(inverter => inverter.key === target.key)) {
            return;
        }
        target.quantity = 1;
        target.id = target.key;
        inverters.push( target);
        this.setState({ inverters:  inverters });
        console.log(this.state.inverters);
    }

    removeInverter(target) {
        const { inverters } = this.state;
        if (target === 0 || inverters.length <= 0) {
            return;
        }
        inverters.splice(inverters.indexOf(target), 1);
        this.setState({ inverters:  inverters });
    }

    renderInverterTable() {
        return this.state.inverters.map((inverter, index) => {
            const { id, label } = inverter; //destructuring
            return (
                <tr key={ index }>
                    <td >{id}</td>
                    <td>{label}</td>
                    <td><input data-id={ id } type='number' defaultValue='1' onChange={ this.handleInverterChange }/> </td>
                    <td className='deleteicon' onClick={ () => this.removeInverter(id) }>
                        { <FontAwesome type='fas fa-times'/> }
                    </td>
                </tr>
            );
        });
    }

    renderTableHeader() {
        const header = Object.keys(this.state.inverter);
        return header.map((key, index) => {
            return <th key={ index }>{key.toUpperCase()}</th>;
        });
    }

    addPanel(target) {
        const { panels } = this.state;
        console.log(target);
        if (target.key === 0 && target.label === '' || panels.some(panel => panel.key === target.key)) {
            return;
        }
        target.quantity = 1;
        target.id = target.key;
        panels.push(target);
        this.setState({ panels: panels });
        console.log(this.state.panels);
    }

    removePanel(target) {
        const { panels } = this.state;
        if (target === 0 || panels.length <= 0) {
            return;
        }
        panels.splice(panels.indexOf(target), 1);
        this.setState({ panels: panels });
    }

    renderPanelTable() {
        return this.state.panels.map((panel, index) => {
            const { id, label } = panel; //destructuring
            return (
                <tr key={ index }>
                    <td>{id}</td>
                    <td>{label}</td>
                    <td><input data-id={ id } type='number' defaultValue='1' onChange={ this.handlePanelChange }/> </td>
                    <td onClick={ () => this.removePanel(key) }>
                        { <FontAwesome type='fas fa-times'/> }
                    </td>
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
            if (result[i].key === target.getAttribute('data-id')) {
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
            if (result[i].key === target.getAttribute('data-id')) {
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
