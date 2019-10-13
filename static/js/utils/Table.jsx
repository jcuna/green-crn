/**
 * Created by Jon on 2019-05-14.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Table = (props) => {
    return <table className={ 'table table-striped ' + (props.className || '') }>
        { props.headers.length > 0 &&
        <thead>
            <tr>
                { Table.getHeaders(props.headers) }
            </tr>
        </thead> }
        <tbody>
            { Table.getBody(props) }
        </tbody>
    </table>;
};

Table.getHeaders = (input) => {
    return input.map((item, i) => <th key={ i }>{ item }</th>);
};

Table.getBody = ({ rows, numberedRows }) => {
    return rows.map((row, i) => <tr key={ i }>
        { numberedRows && <th scope='row'>{ i + 1 }</th>}
        { Array.isArray(row) && row.map((cell, ix) => <td key={ ix }>{ cell }</td>) ||
            Object.values(row).map((cell, ix) => <td key={ ix }>{ cell }</td>) }
    </tr>);
};

Table.propTypes = {
    headers: PropTypes.array,
    rows: PropTypes.array.isRequired,
    numberedRows: PropTypes.bool,
    className: PropTypes.string,
};

Table.defaultProps = {
    headers: [],
    numberedRows: false,
};

export default Table;
