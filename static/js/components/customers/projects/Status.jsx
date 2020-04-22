import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../../utils/FromGenerator';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR } from '../../../constants';
import {
    fetchCustomer,
    clearCurrentCustomer,
    clearCustomers, updateInstallationStatus
} from '../../../actions/customerAction';
import { notifications } from '../../../actions/appActions';
import { hasAccess } from '../../../utils/config';
import Spinner from '../../../utils/Spinner';
import Table from '../../../utils/Table';
import { dateToDatetimeString, friendlyDateEs, toDatePicker } from '../../../utils/helpers';
import FontAwesome from '../../../utils/FontAwesome';

export default class Status extends React.Component {
    constructor(props) {
        super(props);

        const { match, customer, dispatch, history, editing } = this.props;

        this.status = React.createRef();

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
        this.updateStatus = this.updateStatus.bind(this);
    }

    componentDidUpdate(prevProps) {
        const { customer, match, dispatch } = this.props;

        if (prevProps.customer.current.id !== customer.current.id) {
            this.setState(this.fields);
        }
        if (!prevProps.customer.current.id && match.params.installation_id && !customer.current.id) {
            dispatch(fetchCustomer(match.params.installation_id));
        } else if (typeof match.params.installation_id === 'undefined' && customer.current.id) {
            dispatch(clearCurrentCustomer());
        }
    }

    get fields() {
        return {
            id: '',
            design_done: '',
            proposition_ready: '',
            proposition_delivered: '',
            approved: '',
            documents_filed: '',
            signed_contract: '',
            annex_a: '',
            initial_payment: '',
            structural_installation: '',
            no_objection_letter: '',
            final_installation: '',
            annex_b: '',
            distributor_supervision: '',
            in_interconnection_agreement: '',
            out_interconnection_agreement: '',
            rc_policy: '',
            in_metering_agreement: '',
            out_metering_agreement: '',
            metering_letter: '',
            metering_payment: '',
            meter_deployment: '',
            service_start: '',
        };
    }

    fetchMeta() {
        // const { meta, dispatch } = this.props;
    }

    render() {
        const { match, customer } = this.props;
        if (!match.params.customer_id && customer.current.id) {
            return <Spinner/>;
        }
        return (
            <div>
                <section className='widget'>
                    <h4>Estado de Instalación</h4>
                    { this.state.editing && this.form || this.renderReadOnly() }
                </section>
            </div>
        );
    }

    renderReadOnly() {
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        const { status } = this.getCurrentStatus(inst);
        return (
            <div>
                <Table
                    rows={ [['Carpeta Movida', friendlyDateEs(new Date(status.design_done))],
                        ['Propuesta Lista', friendlyDateEs(new Date(status.proposition_ready))],
                        ['Propuesta Entregada', friendlyDateEs(new Date(status.proposition_delivered))],
                        ['Propuesta Aprovado', status.approved ? <FontAwesome type='fas fa-plus'/> : <FontAwesome type='fas fa-times'/>],
                        ['Recopilación de Documentos', friendlyDateEs(new Date(status.documents_filed))],
                        ['Firma de Contrato', friendlyDateEs(new Date(status.signed_contract))],
                        ['Anexo A', friendlyDateEs(new Date(status.annex_a))],
                        ['Pago Inicial', friendlyDateEs(new Date(status.initial_payment))],
                        ['Instalación de Estructura', friendlyDateEs(new Date(status.structural_installation))],
                        ['Carta de No Objeción', friendlyDateEs(new Date(status.no_objection_letter))],
                        ['Instalación Final', friendlyDateEs(new Date(status.final_installation))],
                        ['Anexo B', friendlyDateEs(new Date(status.annex_b))],
                        ['Supervisión Distribuidora', friendlyDateEs(new Date(status.distributor_supervision))],
                        ['Entrada Acuerdo de Interconexión', friendlyDateEs(new Date(status.in_interconnection_agreement))],
                        ['Salida Acuerdo de Interconexion', friendlyDateEs(new Date(status.out_interconnection_agreement))],
                        ['Póliza RC', friendlyDateEs(new Date(status.rc_policy))],
                        ['Entrada Acuerdo de Medición Neta', friendlyDateEs(new Date(status.in_metering_agreement))],
                        ['Salida Acuerdo de Medición Neta', friendlyDateEs(new Date(status.out_metering_agreement))],
                        ['Carta Medidor', friendlyDateEs(new Date(status.metering_letter))],
                        ['Pago Medidor', friendlyDateEs(new Date(status.metering_payment))],
                        ['Cambio Medidor', friendlyDateEs(new Date(status.meter_deployment))],
                        ['Encendido', friendlyDateEs(new Date(status.service_start))],
                    ] }
                />
            </div>
        );
    }

    get form() {
        const { match } = this.props;
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        const { status } = this.getCurrentStatus(inst);
        if (typeof status === 'undefined') {
            return null;
        }
        if (typeof status.id === 'undefined' && typeof match.params.installation_id !== 'undefined') {
            return null;
        }
        return <FormGenerator
            formName={ 'new-tenant' }
            inlineSubmit={ true }
            onSubmit={ this.formSubmit }
            className={ 'form-group row' }
            elements={ this.getFormElements(status) }
            button={ this.state.button }
        />;
    }

    getFormElements(status) {
        const statusLevel = this.getStatusLevel(status.status);
        const elements = [
            {
                className: 'col-6',
                name: 'status',
                // title: 'Estado',
                label: 'Estado',
                ref: this.status,
                defaultValue: status.status,
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: 1,
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'design_done',
                // title: 'Carpeta Movida',
                label: 'Carpeta Movida',
                defaultValue: status.design_done ? toDatePicker(new Date(status.design_done)) : '',
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 1
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'proposition_ready',
                // title: 'Propuesta Lista',
                label: 'Propuesta Lista',
                defaultValue: status.proposition_ready ? toDatePicker(new Date(status.proposition_ready)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 2
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'proposition_delivered',
                // title: 'Propuesta Entregada',
                label: 'Propuesta Entregada',
                defaultValue: status.proposition_delivered ? toDatePicker(new Date(status.proposition_delivered)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 3
            },
            {
                type: 'checkbox',
                className: 'col-12 chk',
                placeholder: 'Propuesta Aprovado',
                onChange: this.onInputChange,
                name: 'approved',
                label: 'Propuesta Aprovada',
                checked: status.approved,
                disabled: statusLevel < 3
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'documents_filed',
                // title: 'Recopilación de Documentos',
                label: 'Recopilación de Documentos',
                defaultValue: status.documents_filed ? toDatePicker(new Date(status.documents_filed)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 3
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'signed_contract',
                // title: 'Firma de Contrato',
                label: 'Firma de Contrato',
                defaultValue: status.signed_contract ? toDatePicker(new Date(status.signed_contract)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 3
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'annex_a',
                // title: 'Anexo A',
                label: 'Anexo A',
                defaultValue: status.annex_a ? toDatePicker(new Date(status.annex_a)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 3
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'initial_payment',
                // title: 'Pago Inicial',
                label: 'Pago Inicial',
                defaultValue: status.initial_payment ? toDatePicker(new Date(status.initial_payment)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 3
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'structural_installation',
                // title: 'Instalación de Estructura',
                label: 'Instalación de Estructura',
                defaultValue: status.structural_installation ? toDatePicker(new Date(status.structural_installation)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 4
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'no_objection_letter',
                // title: 'Carta de No Objeción',
                label: 'Carta de No Objeción',
                defaultValue: status.no_objection_letter ? toDatePicker(new Date(status.no_objection_letter)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 4
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'final_installation',
                // title: 'Instalación Final',
                label: 'Instalación Final',
                defaultValue: status.final_installation ? toDatePicker(new Date(status.final_installation)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 4
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'annex_b',
                // title: 'Anexo B',
                label: 'Anexo B',
                defaultValue: status.annex_b ? toDatePicker(new Date(status.annex_b)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 5
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'distributor_supervision',
                // title: 'Supervisión Distribuidora',
                label: 'Supervisión Distribuidora',
                defaultValue: status.distributor_supervision ? toDatePicker(new Date(status.distributor_supervision)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 5
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'in_interconnection_agreement',
                // title: 'Entrada Acuerdo de Interconexión',
                label: 'Entrada Acuerdo de Interconexión',
                defaultValue: status.in_interconnection_agreement ? toDatePicker(new Date(status.in_interconnection_agreement)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'out_interconnection_agreement',
                // title: 'Salida Acuerdo de Interconexion',
                label: 'Salida Acuerdo de Interconexion',
                defaultValue: status.out_interconnection_agreement ? toDatePicker(new Date(status.out_interconnection_agreement)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'rc_policy',
                // title: 'Póliza RC',
                label: 'Póliza RC',
                defaultValue: status.rc_policy ? toDatePicker(new Date(status.rc_policy)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'in_metering_agreement',
                // title: 'Entrada Acuerdo de Medición Neta',
                label: 'Entrada Acuerdo de Medición Neta',
                defaultValue: status.in_metering_agreement ? toDatePicker(new Date(status.in_metering_agreement)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'out_metering_agreement',
                // title: 'Salida Acuerdo de Interconexion',
                label: 'Salida Acuerdo de Interconexion',
                defaultValue: status.out_metering_agreement ? toDatePicker(new Date(status.out_metering_agreement)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'metering_letter',
                // title: 'Carta Medidor',
                label: 'Carta Medidor',
                defaultValue: status.metering_letter ? toDatePicker(new Date(status.metering_letter)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'metering_payment',
                // title: 'Pago Medidor',
                label: 'Pago Medidor',
                defaultValue: status.metering_payment ? toDatePicker(new Date(status.metering_payment)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'meter_deployment',
                // title: 'Cambio Medidor',
                label: 'Cambio Medidor',
                defaultValue: status.meter_deployment ? toDatePicker(new Date(status.meter_deployment)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
            {
                type: 'date',
                className: 'col-6',
                name: 'service_start',
                // title: 'Encendido',
                label: 'Encendido',
                defaultValue: status.service_start ? toDatePicker(new Date(status.service_start)) : '',
                //  validate: ['required'],
                onChange: this.onInputChange,
                autoComplete: 'off',
                disabled: statusLevel < 6
            },
        ];
        return elements;
    }

    formSubmit(e, data) {
        const status_data = {};
        const { match, dispatch, history } = this.props;
        // const proj = this.getCurrentProject();
        // const { inst } = this.getCurrentInstallation(proj);
        // const { status } = this.getCurrentStatus(inst);
        const action = updateInstallationStatus;

        Object.keys(this.fields).forEach(field => {
            if (typeof data[field] !== 'undefined') {
                if (field === 'approved' && data[field].value !== '') {
                    status_data[field] = data[field].value;
                } else if (data[field].value !== '') {
                    data[field].value = toDatePicker(new Date(data[field].value));
                    status_data[field] = dateToDatetimeString(data[field].value);
                }
            }
        });
        dispatch(action(status_data, Number(match.params.installation_id), () => {
            dispatch(clearCustomers());
            dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Estado de Instalación actualizado satisfactoriamente` })
            );
            dispatch(fetchCustomer(match.params.customer_id, this.updateStatus, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }, true));
            history.push(`${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }/${match.params.customer_id}/${match.params.project_id}/estado/${ match.params.installation_id }#`);
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

    getCurrentStatus(inst) {
        const { match } = this.props;
        if (typeof match.params.installation_id !== 'undefined' && typeof inst.status !== 'undefined') {
            return { status: inst.status };
        }
        return {
            status: {
                status: { id: '' },
                design_done: '',
                proposition_ready: '',
                proposition_delivered: '',
                approved: '',
                documents_filed: '',
                signed_contract: '',
                annex_a: '',
                initial_payment: '',
                structural_installation: '',
                no_objection_letter: '',
                final_installation: '',
                annex_b: '',
                distributor_supervision: '',
                in_interconnection_agreement: '',
                out_interconnection_agreement: '',
                rc_policy: '',
                in_metering_agreement: '',
                out_metering_agreement: '',
                metering_letter: '',
                metering_payment: '',
                meter_deployment: '',
                service_start: '',
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

    getStatusLevel(status) {
        switch (status) {
            case 'Declinado':
                return 0;
            case 'Levantamiendo':
                return 1;
            case 'Diseño':
                return 2;
            case 'Negociación':
                return 3;
            case 'Cerrado':
                return 4;
            case 'Instalacion':
                return 5;
            case 'Distribuidora':
                return 6;
            case 'Encendido':
                return 7;
            default:
                return -1;
        }
    }

    updateStatus(data) {
        const { match } = this.props;
        const { customer_projects } = data;
        const proj = customer_projects.filter(project => project.id === Number(match.params.project_id))[0];
        const { inst } = this.getCurrentInstallation(proj);
        const { status } = this.getCurrentStatus(inst);
        this.status.current.value = status.status;
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
