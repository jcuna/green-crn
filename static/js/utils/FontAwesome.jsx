/**
 * Created by Jon on 2019-05-21.
 */

import React from 'react';
import PropTypes from 'prop-types';

const FontAwesome = (props) => {
    let extra = '';
    if (props.spin) {
        extra += ' fa-spin';
    }
    const updated_props = { ...props };
    delete updated_props.spin;
    return (
        <span className={ props.className } onClick={ props.onClick }>
            <i { ...updated_props } className={ `fas fa-${ props.type }${extra}` } />
        </span>
    );
};

FontAwesome.propTypes = {
    dispatch: PropTypes.func,
    type: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    className: PropTypes.string,
    spin: PropTypes.bool,
};

FontAwesome.defaultProps = {
    className: '',
    spin: false,
};

export default FontAwesome;
