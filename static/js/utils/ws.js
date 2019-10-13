/**
 * Created by jgarcia on 10/7/16.
 */
import store from '../store';
import io from 'socket.io-client';
import {
    updateOnlineStatus,
} from '../actions/appActions';

let connectionInitiated = false;

const connectionMonitor = (socket) => {
    //TODO: use an actual env variable
    if (location.host.indexOf('localhost') > -1) {
        return;
    }

    socket.on('connect', () => {
        store.dispatch(updateOnlineStatus(false));
    });

    socket.on('disconnect', () => {
        store.dispatch(updateOnlineStatus(true));
    });
};

/**
 *
 * @param {string} message
 * @param {string} namespace
 * @param {Function} callback
 */
const ws = (message, namespace = '/', callback) => {
    if (namespace[0] !== '/') {
        throw Error('Always start namespaces with forward slash `/`');
    }

    const socket = io(namespace, {
        path: '/ws'
    });

    socket.on(message, data => callback(data));

    if (!connectionInitiated) {
        connectionInitiated = true;
        connectionMonitor(socket);
    }
};

export default ws;
