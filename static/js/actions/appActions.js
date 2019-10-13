export const TOGGLE_MOBILE_MENU = 'TOGGLE_MOBILE_MENU';
export const NOTIFICATIONS_SET = 'NOTIFICATIONS_SET';
export const NOTIFICATIONS_CLEAR = 'NOTIFICATIONS_CLEAR';
export const LANDING_PAGE_SET = 'LANDING_PAGE_SET';
export const LANDING_PAGE_CLEAR = 'LANDING_PAGE_CLEAR';
export const OVERLAY_SHOW = 'OVERLAY_SHOW';
export const OVERLAY_HIDE = 'OVERLAY_HIDE';
export const CLICKED_CONTENT = 'CLICKED_CONTENT';
export const ONLINE_STATUS = 'ONLINE_STATUS';
export const APP_NEED_INSTALL = 'APP_NEED_INSTALL';

export const toggleMobileMenu = (updatedValue) => {
    return function (dispatch) {
        return dispatch({
            type: TOGGLE_MOBILE_MENU,
            payload: updatedValue,
        });
    };
};

export const hideOverlay = () => {
    return { type: OVERLAY_HIDE };
};

/**
 *
 * @param {Object} messages - {[{type: string, message: string}]}
 * @returns {Function}
 */
export const notifications = (messages) => {
    if (!Array.isArray(messages)) {
        messages = [messages];
    }
    return function (dispatch) {
        dispatch({
            type: NOTIFICATIONS_SET,
            payload: messages,
        });
    };
};

export const clearNotifications = () => {
    return {
        type: NOTIFICATIONS_CLEAR,
    };
};

export const setLandingPage = (landingPage) => {
    return {
        type: LANDING_PAGE_SET,
        payload: landingPage,
    };
};

export const clearLandingPage = () => {
    return {
        type: LANDING_PAGE_CLEAR,
    };
};

export const clickedContent = () => {
    return {
        type: CLICKED_CONTENT,
    };
};

/**
 *
 * @param {Object} childComponent
 * @param {string} title
 * @param {boolean} closeButton
 * @param {Object} actionButton
 * @returns {object}
 */
export const showOverlay = (childComponent, title, closeButton = false, actionButton = null) => {
    return {
        type: OVERLAY_SHOW, payload: {
            component: childComponent,
            title,
            closeButton,
            actionButton,
        },
    };
};

export const updateOnlineStatus = (isOffline) =>
    ({ type: ONLINE_STATUS, payload: isOffline });

export const needInstall = () =>
    ({ type: APP_NEED_INSTALL });
