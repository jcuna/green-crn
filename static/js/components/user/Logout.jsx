/**
 * Created by Jon on 12/7/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { logout } from '../../actions/userActions';
import Spinner from '../../utils/Spinner';
import { STATUS } from '../../constants';
import { toggleMobileMenu } from '../../actions/appActions';

export default class Logout extends React.Component {
    constructor(props) {
        super(props);

        if (props.user.status === STATUS.PROCESSED) {
            props.dispatch(logout());
            props.dispatch(toggleMobileMenu(false));
        } else {
            props.history.push('/');
        }
    }

    render() {
        return <Spinner/>;
    }

    static propTypes = {
        user: PropTypes.object,
        dispatch: PropTypes.func,
        history: PropTypes.object,
    };
}
