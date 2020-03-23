/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FormGenerator from '../../../utils/FromGenerator';
import Autocomplete from '../../../utils/Autocomplete';
import { hasAccess } from '../../../utils/config';
import { ACCESS_TYPES, ALERTS, ENDPOINTS, GENERIC_ERROR, STATUS } from '../../../constants';
import FontAwesome from '../../../utils/FontAwesome';
import { fetchDocumentCategories } from '../../../actions/metaActions';
import {
    clearCustomerDocument,
    createCustomerDocument,
    fetchCustomerDocument,
    deleteCustomerDocument, fetchCustomer, clearCurrentCustomer,
} from '../../../actions/customerAction';
import '../../../../css/installation.scss';

import { notifications } from '../../../actions/appActions';

export default class Documents extends React.Component {
    constructor(props) {
        super(props);

        const { customer, match, dispatch, history } = props;

        this.file = React.createRef();
        this.name = React.createRef();

        this.state = {
            editing: hasAccess(`${ENDPOINTS.CUSTOMER_INSTALLATIONS_URL}`, ACCESS_TYPES.WRITE),
            filea: { category: '', name: '', Eliminar: 0 },
            currentCategory: 'Otro',
            currentDocName: '',
            file: '',
            documents: [],
            button: {
                disabled: false,
                className: 'col-12',
                value: 'Registrar',
                style: { width: '100%' },
            },
            document_types: { list: [] },
        };

        if (typeof match.params.customer_id !== 'undefined' && customer.current.id !== Number(match.params.customer_id)) {
            dispatch(fetchCustomer(match.params.customer_id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
        } else if (typeof match.params.customer_id === 'undefined') {
            dispatch(clearCurrentCustomer());
        }

        this.fetchMeta();
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.removeDocument = this.removeDocument.bind(this);
        this.setCurrentDocName = this.setCurrentDocName.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
        this.renderDocumentTable = this.renderDocumentTable.bind(this);
        this.updateDocuments = this.updateDocuments.bind(this);
    }

    componentDidUpdate(prevProps, prevState) {
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        if (typeof inst.id !== 'undefined' && prevState.documents.length !== inst.installation_documents.length) {
            if (inst.installation_documents.length > 0) {
                this.loadDocuments(inst);
            }
        }
    }
    componentDidMount() {
        const proj = this.getCurrentProject();
        const { inst } = this.getCurrentInstallation(proj);
        if (typeof inst.id !== 'undefined') {
            if (inst.installation_documents.length > 0) {
                this.loadDocuments(inst);
            }
        }
    }

    fetchMeta() {
        const { match } = this.props;
        if (this.props.meta.document_categories.status === STATUS.PENDING) {
            this.props.dispatch(fetchDocumentCategories());
        }
        if (this.props.customer.document_list.status === STATUS.PENDING) {
            this.props.dispatch(fetchCustomerDocument(match.params.installation_id));
        }
    }

    render() {
        return (
            <div>
                <section className='widget'>
                    <h4>Documentos de instalación</h4>
                    { this.state.editing && this.form || this.renderReadOnly() }
                </section>
            </div>
        );
    }

    get form() {
        const { meta } = this.props;
        const document_types = this.state.document_types;

        return <div>
            <FormGenerator
                formName={ 'new-tenant' }
                inlineSubmit={ true }
                onSubmit={ this.formSubmit }
                className={ 'form-group row' }
                elements={ [
                    {
                        formElement: 'select',
                        className: 'col-4',
                        name: 'document_categories',
                        label: 'Categoria de Documento',
                        validate: ['required'],
                        defaultvalue: 1,
                        options: meta.document_categories.list.map((obj) => ({ value: obj.category, label: obj.category })),
                        onChange: this.handleCategoryChange,
                    },
                    <div ref={ this.name } className='col-4 row-item' key={ 100 }>
                        <label>Tipo de documento</label>
                        <Autocomplete
                            name='name'
                            className='form-control row-item'
                            placeholder='Tipo de documento'
                            validate='required'
                            items={ document_types.list.map(obj => ({ key: obj.key, label: obj.label })) }
                            onChange= { this.setCurrentDocName }
                            onSelect= { this.setCurrentDocName }
                        />
                    </div>,
                    <div className='col-1 upload-btn-wrapper row-item' key={ 200 }>
                        <button className='btn-w'>{<FontAwesome type='fas fa-upload'/>}</button>
                        <input name='file' ref={ this.file } type='file'/>
                    </div>,
                    <div className='col-12' key={ 300 }>
                        <div className='row'>
                            <div className='col-12'>
                                <h4 id='title'>Archivos</h4>
                                <div className='table table-responsive'>
                                    <table className='inverters' id='filesTable'>
                                        <tbody>
                                            <tr>{this.renderTableHeader()}</tr>
                                            {this.renderDocumentTable()}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                ] }
                button={ this.state.button }
            />
            <div>

            </div>
        </div>;
    }

    formSubmit() {
        const { params } = this.props.match;
        const documents_data = new FormData();
        const action = createCustomerDocument;
        documents_data.append('installation_id', params.installation_id);
        documents_data.append('category', this.state.currentCategory);
        documents_data.append('name', this.state.currentDocName.trim());
        documents_data.append('file', this.file.current.files[0]);
        this.props.dispatch(action(documents_data, () => {
            this.props.dispatch(clearCurrentCustomer());
            this.props.dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Documento creado satisfactoriamente` })
            );
            this.props.history.push(`${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }/${ params.customer_id }/${ params.project_id }/docs/${ params.installation_id }`);
            this.updateDocuments();
        }, () => {
            this.props.dispatch(notifications({ type: ALERTS.DANGER, message: GENERIC_ERROR }));
        }));
    }

    get fields() {
        return {
            file: '',
            project_id: '',
            name: '',
        };
    }

    setCurrentDocName(target) {
        if (typeof target.label !== 'undefined') {
            this.setState({ currentDocName: target.label });
            return;
        }
        this.setState({ currentDocName: target.target.value });
    }

    addDocument(target) {
        const { documents } = this.state;
        if (documents.some(document => document.key === target.key)) {
            return;
        }
        documents.push(target);
        this.setState({ documents });
    }

    removeDocument({ target: { parentElement: { parentElement }}}) {
        const { match: { params }} = this.props;
        this.props.dispatch(deleteCustomerDocument(params.installation_id, parentElement.getAttribute('data-id'), this.updateDocuments));
    }

    updateDocuments() {
        const { customer, match, dispatch, history } = this.props;
        if (typeof match.params.customer_id !== 'undefined' && customer.current.id !== Number(match.params.customer_id)) {
            dispatch(fetchCustomer(match.params.customer_id, Function, () => {
                history.push(ENDPOINTS.NOT_FOUND);
            }));
        } else if (typeof match.params.customer_id === 'undefined') {
            dispatch(clearCurrentCustomer());
        }
        this.props.dispatch(clearCustomerDocument);
        this.props.dispatch(fetchCustomerDocument(match.params.installation_id));
    }

    renderDocumentTable(readOnly) {
        const { list } = this.props.customer.document_list;
        if (list.status !== STATUS.PENDING && list.length !== 0) {
            if (!readOnly) {
                return list.signed_urls.map((document, index) => {
                    const { category, name, object } = document; //destructuring
                    return (
                        <tr key={ index }>
                            <td>{category}</td>
                            <td><a
                                href={ document.url }
                                target='_blank' rel="noopener noreferrer">
                                {name}
                            </a></td>
                            <td data-id={ object } onClick={ this.removeDocument }>
                                {<FontAwesome className='delete-icon' type='fas fa-times'/>}
                            </td>
                        </tr>
                    );
                });
            }
            return list.signed_urls.map((document, index) => {
                const { category, name } = document; //destructuring
                return (
                    <tr key={ index }>
                        <td>{category}</td>
                        <td><a
                            href={ list.signed_urls.find(url => url.name === name).url }
                            target='_blank' rel="noopener noreferrer">
                            {name}
                        </a></td>
                    </tr>
                );
            });
        }
        return null;
    }

    renderTableHeader(readOnly) {
        const header = Object.keys(this.state.filea);
        if (readOnly) {
            header.pop();
        }
        return header.map((key, index) => {
            return <th key={ index }>{key.toUpperCase()}</th>;
        });
    }

    handleCategoryChange({ target }) {
        const { document_categories } = this.props.meta;
        if (document_categories.list.length <= 0) {
            return;
        }
        this.file.current.form[1].value = '';

        const result = document_categories.list.filter(document_category => document_category.category === target.value).pop().name;
        this.setState(
            {
                document_types: { list: result.map((element, index) => {
                    return { key: index + 1, label: element };
                }) },
                currentCategory: target.value,
                currentDocName: '',
            }
        );
    }

    loadDocuments(installation) {
        if (installation.installation_documents.length > 0) {
            installation.installation_documents.forEach(document => this.addDocument({
                key: document.id,
                name: document._name,
                category: document.category,
                object_key: document.object_key
            }));
        }
    }

    getCurrentProject() {
        const { customer, project_id } = this.props;
        if (typeof project_id !== 'undefined' && customer.current.customer_projects.length) {
            return customer.current.customer_projects.filter(project => project.id === Number(project_id))[0];
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
            panel_models: { id: 1 },
            egauge_url: '',
            egauge_serial: '',
            egauge_mac: '',
            start_date: '',
            detailed_performance: '',
            project_id: '',
            inverter_models: { id: 1 },
            installation_documents: [],
        }
        };
    }

    renderReadOnly() {
        return <div>
            <div className='row'>
                <div className='col-12'>
                    <h4 id='title'>Archivos</h4>
                    <table className='inverters' id='filesTable'>
                        <tbody>
                            <tr>{this.renderTableHeader(true)}</tr>
                            {this.renderDocumentTable(true)}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        meta: PropTypes.object,
        editing: PropTypes.bool,
        match: PropTypes.object,
        customer: PropTypes.object,
        history: PropTypes.object,
        project_id: PropTypes.string,
        installation_documents: PropTypes.object,
    };
}
