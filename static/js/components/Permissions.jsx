/**
 * Created by Jon on 12/31/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '../utils/Checkbox';
import { ACCESS_TYPES } from '../constants';

export default class Permissions extends React.Component {
    constructor(props) {
        super(props);

        let role = '';

        let selectedPermissions = [];

        props.roles.assigned.forEach(item => {
            if (item.id === props.id) {
                role = item;
                if (item.permissions !== null) {
                    selectedPermissions = item.permissions;
                }
            }
        });
        this.role = role;
        this.state = {
            selectedPermissions,
        };
        this.selectCheckBox = this.selectCheckBox.bind(this);
    }

    render() {
        return <div className="permissions-container">
            <h2>{ this.role.name }</h2>
            <div className="permissions right">
                <ul>
                    { Object.values(this.props.roles.permissions).map((item, i) => {
                        const hasStuff = typeof this.state.selectedPermissions[item] !== 'undefined';
                        const allChecked = hasStuff && this.state.selectedPermissions[item].length === 3;

                        return (
                            <li key={ i } className="endpoint">
                                <div className="half name">
                                    <Checkbox name={ item } label={ item.split('.')[2] } checked={ allChecked }
                                        onChange={ this.selectCheckBox }/>
                                </div>
                                <div className="half">
                                    <ul className="grant">
                                        { Permissions.methods.map((obj, g) => <li className={ obj.className } key={ g }>
                                            <Checkbox name={ item } id={ obj.name } label={ obj.nombre }
                                                checked={ allChecked || hasStuff &&
                                                this.state.selectedPermissions[item].includes(obj.name) }
                                                onChange={ this.selectCheckBox }/>
                                        </li>) }
                                    </ul>
                                </div>
                            </li>
                        );
                    }) }
                </ul>
            </div>
        </div>;
    }

    static get methods() {
        return [
            { name: ACCESS_TYPES.READ, nombre: 'Leer', className: 'chart down' },
            { name: ACCESS_TYPES.WRITE, nombre: 'Escribir', className: 'chart line' },
            { name: ACCESS_TYPES.DELETE, nombre: 'Borrar', className: 'chart up' },
        ];
    }

    selectCheckBox(checkbox) {
        const type = checkbox.id || '*';
        const { checked, name } = checkbox;

        let newState = {};

        if (typeof this.state.selectedPermissions[name] === 'undefined') {
            newState = { selectedPermissions: { [name]: [] }};
        }

        if (checked) {
            if (type === '*') {
                const methods = [];

                Permissions.methods.forEach(item => {
                    methods.push(item.name);
                });
                newState = { selectedPermissions: { ...this.state.selectedPermissions, [name]: methods }};
            } else {
                let methods = [];

                if (typeof this.state.selectedPermissions[name] !== 'undefined') {
                    methods = this.state.selectedPermissions[name].slice();
                }
                methods.push(type);
                newState = { selectedPermissions: { ...this.state.selectedPermissions, [name]: methods }};
            }
        } else {
            if (type === '*') {
                const methods = { ...this.state.selectedPermissions };

                delete methods[name];
                newState = { selectedPermissions: methods };
            } else {
                if (this.state.selectedPermissions[name].includes(type)) {
                    const items = this.state.selectedPermissions[name].slice();

                    items.splice(items.indexOf(type), 1);
                    newState = { selectedPermissions: { ...this.state.selectedPermissions, [name]: items }};
                }
            }
        }
        this.setState(newState);
        this.props.onUpdate({ id: this.props.id, permissions: { ...newState.selectedPermissions }});
    }

    static propTypes = {
        onUpdate: PropTypes.func,
        roles: PropTypes.object,
        id: PropTypes.number,
    };
}
