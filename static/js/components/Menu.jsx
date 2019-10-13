/**
 * Created by Jon on 11/22/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../../css/menu.scss';
import { clearNotifications, toggleMobileMenu } from '../actions/appActions';
import { hasAccess, menuItems } from '../utils/config';
import { ACCESS_TYPES } from '../constants';
import { updateMyUser } from '../actions/userActions';
import FontAwesome from '../utils/FontAwesome';

export default class Menu extends React.Component {
    constructor(props) {
        super(props);
        this.toggleMenu = this.toggleMenu.bind(this);
        this.clearNotifications = this.clearNotifications.bind(this);
    }

    render() {
        return (
            <div className={ this.className }>
                <FontAwesome className={ 'menu-toggler' } onClick={ this.toggleMenu } type="times"/>
                <h2 className='app-logo'><span>Room</span>anize</h2>
                <nav id="mobile-nav">
                    { this.getLinksBasedOffAccess() }
                </nav>
            </div>
        );
    }

    get className() {
        let className = 'mobile-menu';

        if (this.props.showMobileMenu) {
            className += ' slide';
        }
        return className;
    }

    getLinksBasedOffAccess() {
        const { roles } = this.props;

        if (Object.keys(roles.permissions).length === 0) {
            return null;
        }

        const items = [];

        menuItems.forEach(item => {
            if (hasAccess(item.link, ACCESS_TYPES.READ)) {
                items.push(
                    <Link
                        className={ this.getMenuClass(item) } key={ item.link } to={ item.link }
                        onClick={ this.clearNotifications }>
                        <i className={ item.icon }/>
                        <span>{ item.name }</span>
                    </Link>
                );
            }
        });

        return items.length > 0 ? items : [<span className='menu-item' key={ 0 }>No Tienes ningun Accesso</span>];
    }

    clearNotifications() {
        this.props.dispatch(clearNotifications());
    }

    getMenuClass(link) {
        let className = 'menu-item';

        if (this.props.history.location.pathname.indexOf(link.link) > -1) {
            className += ' active';
        }
        return className;
    }

    toggleMenu() {
        this.props.dispatch(toggleMobileMenu(!this.props.showMobileMenu));
        this.props.dispatch(updateMyUser({
            attributes: {
                preferences: { showMobileMenu: !this.props.showMobileMenu }
            }
        }));
    }

    static propTypes = {
        user: PropTypes.object,
        roles: PropTypes.object,
        showMobileMenu: PropTypes.bool,
        dispatch: PropTypes.func,
        history: PropTypes.object
    }
}
