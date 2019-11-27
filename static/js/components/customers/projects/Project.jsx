/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';

export default class Project extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        console.log(this.props);

        return (
            <div>
                <section className='widget'>
                    <h4>Detalles de proyecto</h4>
                </section>
            </div>
        );
    }

    static propTypes = {
        dispatch: PropTypes.func,
        match: PropTypes.object,
    };
}
