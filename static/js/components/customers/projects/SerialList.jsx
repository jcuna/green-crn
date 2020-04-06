/**
 * Created by Jesus on 04/04/20.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { ACCESS_TYPES, ENDPOINTS } from '../../../constants';
import { hasAccess } from '../../../utils/config';
import Spinner from '../../../utils/Spinner';
import FontAwesome from '../../../utils/FontAwesome';

export default class SerialList extends React.Component {
    constructor(props) {
        super(props);

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
    }

    get fields() {
        return {
            model: this.props.model,
        };
    }

    render() {
        const { model } = this.props;
        if (typeof model === 'undefined') {
            return <Spinner/>;
        }
        return (
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
                                <td data-id={ serial } data-model={ model.label } onClick={ this.props.onDelete }>
                                    { <FontAwesome className='delete-icon' type='fas fa-times'/> }
                                </td>
                            </tr>;
                        }) }
                    </tbody>
                </table>
            </div>
        );
    }

    renderReadOnly() {
        const { model } = this.props;

        return (
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
                            </tr>;
                        }) }
                    </tbody>
                </table>
            </div>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
        onDelete: PropTypes.func,
        editing: PropTypes.bool,
        meta: PropTypes.object,
        history: PropTypes.object,
        model: PropTypes.object,
        match: PropTypes.object,
    };
}
