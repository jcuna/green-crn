/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <h3>Hello </h3>;
    }

    static propTypes = {
        dispatch: PropTypes.func,
    };
}
