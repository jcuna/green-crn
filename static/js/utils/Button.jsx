/**
 * Created by Jon on 2019-05-21.
 */

import React from 'react';
import PropTypes from 'prop-types';

const Button = (props) => {
    const p = { ...props };
    delete p.parentClass;
    return (
        <div className={ props.parentClass }>
            <button { ...p }
                className={ props.className ||
                'btn' + (props.size.length > 0 ? ` btn-${ props.size }` : '') + ` btn-${props.type}` }
                onClick={ props.onClick }
            >{ props.value }</button>
        </div>
    );
};

Button.propTypes = {
    dispatch: PropTypes.func,
    type: PropTypes.string,
    onClick: PropTypes.func,
    className: PropTypes.string,
    value: PropTypes.string,
    size: PropTypes.string,
    parentClass: PropTypes.string,
};

Button.defaultProps = {
    type: 'success',
    size: '',
    value: 'Submit',
    parentClass: 'row'
};

export default Button;
