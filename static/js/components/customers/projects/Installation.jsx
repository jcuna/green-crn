/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class Installation extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div>
                <section className='widget'>
                    <h4>Detalles de instalacion</h4>
                </section>
            </div>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
    };
}
