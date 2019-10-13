/**
 * Created by Jon on 1/2/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../../utils/Checkbox';
import FormGenerator from '../../utils/FromGenerator';
import {
    clearProjectEditing,
    createProject,
    editProject,
    fetchCompany,
    updateProject,
} from '../../actions/companyActions';
import Link from 'react-router-dom/es/Link';
import { hasAccess } from '../../utils/config';
import { hideOverlay, showOverlay } from '../../actions/appActions';
import { ACCESS_TYPES, ENDPOINTS, STATUS } from '../../constants';
import Spinner from '../../utils/Spinner';
import Breadcrumbs from '../../utils/Breadcrumbs';
import { fetchUser } from '../../actions/userActions';
import RequiresCompany from './RequiresCompany';
import FontAwesome from '../../utils/FontAwesome';
import { formatPhone } from '../../utils/helpers';

export default class Company extends React.Component {
    constructor(props) {
        super(props);

        this.state = { button: { value: 'Agregar', disabled: true }, project: {}};

        if (typeof props.match.params.project_id !== 'undefined' && props.projects.status === STATUS.COMPLETE) {
            const project = this.getEditingProject(props);

            if (project) {
                props.dispatch(editProject(project));
            }
        }
        this.selectCheckBox = this.selectCheckBox.bind(this);
        this.validateFields = this.validateFields.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidUpdate({ projects, match, dispatch }) {
        if (typeof match.params.project_id !== 'undefined' &&
            typeof this.props.match.params.project_id === 'undefined' && projects.editing.id !== '') {
            this.setState({
                button: { value: 'Agregar', disabled: true }
            });
            dispatch(clearProjectEditing());
        } else if ((typeof this.props.match.params.project_id !== 'undefined' && projects.status === STATUS.COMPLETE &&
            Number(projects.editing.id) !== Number(this.props.match.params.project_id)) ||
            (typeof this.props.match.params.project_id !== 'undefined' && projects.status === STATUS.PENDING &&
            this.props.projects.status === STATUS.COMPLETE)) {
            const project = this.getEditingProject(this.props);

            if (project) {
                dispatch(editProject(project));
            }
        }
    }

    componentWillUnmount() {
        const editMode = typeof this.props.match.params.project_id !== 'undefined';

        if (editMode && this.props.projects.editing.id !== '') {
            this.props.dispatch(clearProjectEditing());
        }
    }

    render() {
        const canCreate = hasAccess(ENDPOINTS.COMPANY_URL, ACCESS_TYPES.WRITE);
        const { projects, match } = this.props;
        const notEditing = typeof match.params.project_id === 'undefined';

        return (
            <div>
                <Breadcrumbs { ...this.props } title={ this.props.projects.editing.name || 'Proyectos' }/>
                <section className="widget">
                    <h2>Proyectos</h2>
                    { notEditing && this.getProjects() }
                    { (projects.projects.length < 10 && canCreate || !notEditing) && this.getForm(this.props) }
                </section>
            </div>
        );
    }

    getEditingProject({ projects, match }) {
        return projects.projects.find(a => Number(a.id) === Number(match.params.project_id));
    }

    getForm({ projects, match, user }) {
        const editMode = typeof match.params.project_id !== 'undefined';
        const title = editMode ? 'Editar' : 'Crear';

        if (editMode && projects.editing.id === '' || !editMode && projects.editing.id !== '') {
            return <Spinner/>;
        }

        return <div><hr/><h5>{`${title} Proyecto`}</h5><FormGenerator { ...{
            formName: 'project',
            button: this.state.button,
            elements: [
                {
                    type: 'text',
                    placeholder: 'Nombre Del Proyecto',
                    onChange: this.validateFields,
                    name: 'name',
                    defaultValue: projects.editing.name,
                    validate: 'required',
                },
                {
                    type: 'tel',
                    placeholder: 'Telefono',
                    onChange: this.validateFields,
                    name: 'phone',
                    defaultValue: projects.editing.contact,
                    validate: ['required', 'phone'],
                },
                {
                    type: 'text',
                    placeholder: 'Direccion',
                    onChange: this.validateFields,
                    name: 'address',
                    defaultValue: projects.editing.address,
                    validate: 'required',
                },
                {
                    type: 'checkbox',
                    placeholder: 'Activar',
                    onChange: this.validateFields,
                    id: 'active',
                    name: 'active',
                    label: 'Activar',
                    checked: projects.editing.id === user.attributes.preferences.default_project
                },
            ],
            onSubmit: this.handleSubmit,
        } }/></div>;
    }

    getProjects() {
        const { projects, user } = this.props;

        let warn = null;

        const canEdit = hasAccess(ENDPOINTS.COMPANY_URL, ACCESS_TYPES.WRITE);

        if (projects.projects && projects.projects.length === 0) {
            return <div className="alert alert-warning">Aun no se ha creado ningun proyecto.</div>;
        }
        if (!RequiresCompany.hasSelectedProject(user)) {
            warn = <div className="alert alert-warning">No hay ningun proyecto activo, active uno de la lista.</div>;
        }
        return (
            <div>
                { warn }
                <table className='table table-striped'>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Contacto</th>
                            <th>Direccion</th>
                            <th>Editar</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.projects.map((project, i) =>
                            <tr key={ i }>
                                <th scope='row'>{ i + 1 }</th>
                                <td>{ project.name }</td>
                                <td>{ formatPhone(project.contact) }</td>
                                <td>{ project.address }</td>
                                <td>
                                    { canEdit && <Link to={ `${ENDPOINTS.COMPANY_URL}/${project.id}` }>
                                        <FontAwesome type='edit'/></Link> ||
                                    <FontAwesome type='ban'/> }
                                </td>
                                <td>{ this.getCheckbox(project, canEdit, this.props.user) }</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    }

    getCheckbox(item, canEdit, { attributes }) {
        const active = attributes.preferences.default_project === Number(item.id);

        if (canEdit) {
            const label = active ? 'Desactivar' : 'Activar';

            return <Checkbox
                name={ item.name }
                id={ item.id }
                label={ label }
                checked={ active }
                onChange={ this.selectCheckBox }
            />;
        }
        return <div><span>{ active && 'Activado' || 'Desactivado' }</span></div>;
    }

    selectCheckBox(checkbox) {
        const label = !checkbox.checked ? 'desactivar' : 'activar';

        const button = <button
            type='button' onClick={ () => {
                this.updateProjectStatus(checkbox);
            } } className='btn btn-warning'>OK</button>;

        this.props.dispatch(
            showOverlay(
                <div className='panel'>{`Estas seguro que quieres ${label} ${checkbox.name}`}?</div>,
                <div className='warning-prompt'><FontAwesome type='exclamation-triangle'/> Advertencia...</div>,
                true,
                button
            )
        );
    }

    updateProjectStatus(checkbox) {
        this.props.dispatch(updateProject({
            id: checkbox.id,
            active: checkbox.checked
        }, () => {
            this.props.dispatch(hideOverlay());
            this.props.dispatch(fetchUser());
        }));
    }

    validateFields(event, validation) {
        const project = {
            name: '',
            phone: '',
            active: false,
            address: ''
        };

        let formIsValid = true;

        Object.keys(project).forEach((el) => {
            if (!validation[el].isValid) {
                formIsValid = false;
            }
            project[el] = validation[el].value;
        });

        this.setState({
            button: { value: 'Agregar', disabled: !formIsValid },
            project
        });
    }

    handleSubmit() {
        let action;

        let data;

        const editMode = typeof this.props.match.params.project_id !== 'undefined';

        if (editMode) {
            data = { ...this.state.project, id: this.props.match.params.project_id };
            action = updateProject;
        } else {
            action = createProject;
            data = { ...this.state.project };
        }

        this.props.dispatch(action(data, (resp) => {
            let id = resp.data.id;

            if (editMode) {
                id = data.id;
                this.props.dispatch(editProject(data));
            }
            this.props.dispatch(fetchCompany());
            this.props.dispatch(fetchUser());
            this.setState({
                button: { value: 'Agregar', disabled: true },
                project: {}
            });
            this.props.history.push(`${ENDPOINTS.COMPANY_URL}/${id}`);
        }));
    }

    static propTypes = {
        projects: PropTypes.object,
        dispatch: PropTypes.func,
        match: PropTypes.object,
        params: PropTypes.object,
        history: PropTypes.object,
        user: PropTypes.object,
    };
}
