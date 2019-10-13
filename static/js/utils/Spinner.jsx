/**
 * Created by Jon on 6/22/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import '../../css/spinner.scss';

const Spinner = (props) => {
    return <div style={ props.color } id="continuous-spinner"/>;
};

Spinner.propTypes = {
    color: PropTypes.object,
};

export default Spinner;
