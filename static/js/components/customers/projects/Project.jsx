/**
 * Created by Jon on 10/21/19.
 */

import React from 'react';
import PropTypes from 'prop-types';
import Breadcrumbs from '../../../utils/Breadcrumbs';

export default class Project extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const { match } = this.props;
        console.log(this.props);

        return (
            <div>
                <Breadcrumbs { ...this.props } title={
                    match.params.action.charAt(0).toUpperCase() + match.params.action.slice(1)
                }/>
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
