/**
 * Created by Jon on 12/6/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { clearNotifications } from '../actions/appActions';
import { ALERTS } from '../constants';
import FontAwesome from './FontAwesome';

export default class Notifications extends React.Component {
    render() {
        const { notifications } = this.props;

        if (this.props.notifications.length !== 0) {
            return notifications.map((item, key) => (
                <div key={ key } className={ `alert alert-${item.type}` } role="alert">
                    <FontAwesome type='times' onClick={ () => this.props.dispatch(clearNotifications()) }/>
                    {item.message}
                </div>)
            );
        }
        return null;
    }

    static propTypes = {
        dispatch: PropTypes.func,
        notifications: PropTypes.arrayOf(
            PropTypes.shape({
                type: PropTypes.oneOf(Notifications.alertTypes),
                message: PropTypes.string
            })
        )
    };

    static get alertTypes() {
        return Object.values(ALERTS);
    }
}
