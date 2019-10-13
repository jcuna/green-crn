/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';

const ErrorPage = (props) => {
    return (
        <div className="card">
            <div className="card-header">
                { props.type }
            </div>
            <div className="card-block">
                <blockquote className="card-blockquote">
                    <p>{ props.textMap[props.type] }</p>
                </blockquote>
            </div>
        </div>
    );
};

ErrorPage.defaultProps = {
    type: 404,
    textMap: {
        404: 'La página solicitada no existe.',
        403: 'No Tienes accesso al recurso solicitado',
    },
};

ErrorPage.propTypes = {
    type: PropTypes.number,
    textMap: PropTypes.object,
};

export default ErrorPage;
