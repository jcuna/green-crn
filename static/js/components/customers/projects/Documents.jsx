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
    createCustomerDocument
} from '../../../actions/customerAction';
import '../../../../css/installation.scss';

import { notifications } from '../../../actions/appActions';
import { Link } from 'react-router-dom';

export default class Documents extends React.Component {
    constructor(props) {
        super(props);

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
                className: 'col-6',
                value: this.props.editing ? 'Actualizar' : 'Crear',
                style: { width: '100%' },
            },
            document_types: { list: [] },
        };

        this.fetchMeta();
        this.handleCategoryChange = this.handleCategoryChange.bind(this);
        this.setCurrentDocName = this.setCurrentDocName.bind(this);
        this.formSubmit = this.formSubmit.bind(this);
    }

    fetchMeta() {
        if (this.props.meta.document_categories.status === STATUS.PENDING) {
            this.props.dispatch(fetchDocumentCategories());
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
        const proj = this.getCurrentProject();
        const inst = this.getCurrentInstallation(proj);
        this.loadDocuments(inst);
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
                        options: meta.document_categories.list.map((obj) => ({ value: obj.id, label: obj.category })),
                        onChange: this.handleCategoryChange,
                    },
                    <div ref={ this.name } className='col-4 row-item' key={ 100 }>
                        <label>Tipo de documento</label>
                        <Autocomplete
                            name='name'
                            className='form-control'
                            placeholder='Tipo de documento'
                            items={ document_types.list.map(obj => ({ key: obj.key, label: obj.label })) }
                            onChange = { this.setCurrentDocName }
                            onSelect= { () => {} }
                        />
                    </div>,
                    <div className='col-1 upload-btn-wrapper' key={ 103 }>
                        <button className='btn-w'>{<FontAwesome type='fas fa-upload'/>}</button>
                        <input name='file' ref={ this.file } type='file'/>
                    </div>,
                ] }
                button={ this.state.button }
            />
            <div>
                <div className='row'>
                    <div className='col-6'>
                        <h4 id='title'>Archivos</h4>
                        <table className='inverters' id='filesTable'>
                            <tbody>
                                <tr>{this.renderTableHeader()}</tr>
                                {this.renderDocumentTable()}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>;
    }

    formSubmit(e, data) {
        const documents_data = new FormData();
        const action = createCustomerDocument;
        let verb = 'creado';
        debugger;
        documents_data.append('installation_id', this.props.match.params.installation_id);
        documents_data.append('category', this.state.currentCategory);
        documents_data.append('name', this.state.currentDocName.trim());
        documents_data.append('file', this.file.current.files[0]);
        this.props.dispatch(action(documents_data, ({ id }) => {
            this.props.dispatch(clearCustomerDocument());
            this.props.dispatch(notifications(
                { type: ALERTS.SUCCESS, message: `Documento ${verb} satisfactoriamente` })
            );
            this.props.history.push(`${ ENDPOINTS.CUSTOMER_INSTALLATIONS_URL }/info/${ id || installation_data.id }#`);
            this.setState({
                button: { ...this.state.button, disabled: true }
            });
        }, () => {
            this.props.dispatch(notifications({ type: ALERTS.DANGER, message: GENERIC_ERROR }));
        }));
    }

    get fields() {
        return {
            id: undefined,
            file: '',
            project_id: '',
            name: '',
        };
    }

    setFiledata(target) {
        if (target.target.files.length > 0) {
            const file = target.target.files[0];
            this.setState({ file: file });
            // this.sendFileToServer(file);
        }
    }

    setCurrentDocName(target) {
        debugger;
        this.setState({ currentDocName: target.target.value });
        console.log(this.state.currentDocName);
    }

    addDocument(target) {
        const { documents } = this.state;
        console.log(target);
        if (documents.some(document => document.key === target.key)) {
            return;
        }
        documents.push( target);
        this.setState({ documents: documents });
        console.log(this.state.documents);
    }

    removeDocument(target) {
        const { documents } = this.state;
        if (target === 0 || documents.length <= 0) {
            return;
        }
        documents.splice(documents.indexOf(target), 1);
        this.setState({ documents: documents });
    }

    renderDocumentTable() {
        return this.state.documents.map((document, index) => {
            const { id, category, name, object_key } = document; //destructuring
            return (
                <tr key={ index }>
                    <td>{category}</td>
                    <td><Link
                        to={ `${object_key}` }>
                        {name}
                    </Link>,</td>
                    <td className='deleteicon' onClick={ () => this.removeDocument(id) }>
                        { <FontAwesome type='fas fa-times'/> }
                    </td>
                </tr>
            );
        });
    }

    renderTableHeader() {
        const header = Object.keys(this.state.filea);
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
                document_types: {list: result.map((element, index) => {return { key: index+1, label: element };})},
                currentCategory: target.value,
            }
        );
    }

    loadDocuments(installation) {
        const { match } = this.props;
        if (installation.installation_documents.length > 0) {
            installation.installation_documents.forEach(document => this.addDocument({key: document.id, name: document._name, category: document.category, object_key: document.object_key }));
        }
    }

    getCurrentProject() {
        const { customer, project_id } = this.props;
        if (typeof project_id !== 'undefined' && customer.current.customer_projects.length) {
            return customer.current.customer_projects.filter(project => project.id === Number(project_id))[0];
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
        const { match } = this.props;
        if (typeof match.params.installation_id !== 'undefined' && proj.id !== undefined) {
            const installation = proj.installations.filter(installation => installation.id === Number(match.params.installation_id))[0];
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
            installation_documents: [],
        };
    }

    renderReadOnly() {
        return (
            <h1>read only</h1>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
        meta: PropTypes.object,
        editing: PropTypes.bool,
        match: PropTypes.object,
        customer: PropTypes.object,
        history: PropTypes.object,
        project_id: PropTypes.object,
    };
}
