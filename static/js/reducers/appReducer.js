/**
 * Created by Jon on 12/4/17.
 */

import {
    TOGGLE_MOBILE_MENU,
    NOTIFICATIONS_SET,
    NOTIFICATIONS_CLEAR,
    LANDING_PAGE_SET,
    LANDING_PAGE_CLEAR,
    OVERLAY_SHOW,
    OVERLAY_HIDE,
    CLICKED_CONTENT,
    ONLINE_STATUS, APP_NEED_INSTALL,
} from '../actions/appActions';

export default function appReducer(state = {
    appState: 1,
    isOffline: false,
    showMobileMenu: false,
    notifications: [],
    landingPage: '',
    clickedContent: false,
    overlay: {
        menuIsOn: false,
        display: false,
        component: null,
        title: '',
        closeButton: false,
        actionButton: null,
    },
}, action) {
    switch (action.type) {
        case APP_NEED_INSTALL:
            return { ...state, appState: 0 };
        case TOGGLE_MOBILE_MENU:
            return { ...state, showMobileMenu: action.payload };
        case NOTIFICATIONS_SET:
            return { ...state, notifications: action.payload };
        case NOTIFICATIONS_CLEAR:
            return { ...state, notifications: [] };
        case LANDING_PAGE_SET:
            return { ...state, landingPage: action.payload };
        case LANDING_PAGE_CLEAR:
            return { ...state, landingPage: '' };
        case CLICKED_CONTENT:
            return { ...state, clickedContent: !state.clickedContent };
        case ONLINE_STATUS:
            return { ...state, isOffline: action.payload };
        case OVERLAY_SHOW:
            return {
                ...state,
                showMobileMenu: false,
                overlay: {
                    menuIsOn: state.showMobileMenu,
                    display: true,
                    component: action.payload.component,
                    title: action.payload.title,
                    closeButton: action.payload.closeButton || false,
                    actionButton: action.payload.actionButton || null,
                },
            };
        case OVERLAY_HIDE:
            if (state.overlay) {
                return {
                    ...state,
                    showMobileMenu: state.overlay.menuIsOn,
                    overlay: {
                        ...state.overlay,
                        display: false,
                        component: null,
                        title: '',
                        closeButton: false,
                        actionButton: null,
                    },
                };
            }
            return { ...state };
        default:
            return state;
    }
}
