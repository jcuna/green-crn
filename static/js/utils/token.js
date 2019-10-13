import { USER_MUST_LOGIN, USER_FETCHED } from '../actions/userActions';
import api from './api';

class Token {
    /**
     *
     * @param {object} props {Object}
     */
    set data(props) {
        this._data = props;
    }

    /**
     *
     * @returns {number}
     */
    static get timestamp() {
        return Math.round((new Date()).getTime() / 1000);
    }

    /**
     *
     * @returns {Promise}
     */
    through() {
        return new Promise((resolve, reject) => {
            this.expired(Token.timestamp).then(didExpire => {
                if (didExpire) {
                    api({ url: '/user' }).then(resp => {
                        this._data.dispatch({
                            type: USER_FETCHED,
                            payload: resp.data
                        });
                        resolve(this.authHeaders);
                    }, err => {
                        reject(Error('No active session'));
                        this._data.dispatch({
                            type: USER_MUST_LOGIN,
                            payload: err.error
                        });
                    });
                } else if (this._data.token.value !== '') {
                    resolve(this.authHeaders);
                } else {
                    reject(Error('No active session'));
                }
            });
        });
    }

    /**
     *
     * @param {int} timestamp {Number}
     * @returns {Promise}
     */
    expired(timestamp) {
        return new Promise(resolve => {
            if (typeof this._data === 'undefined') {
                this.waitForData(resolve, timestamp);
            } else {
                resolve(timestamp + 10 > this._data.token.expires);
            }
        });
    }

    /**
     *
     * @param {function} resolve {Function}
     * @param {int} timestamp {Number}
     */
    waitForData(resolve, timestamp) {
        setTimeout(() => {
            if (typeof this._data === 'undefined') {
                this.waitForData(resolve, timestamp);
            } else {
                resolve(timestamp + 10 > this._data.token.expires);
            }
        }, 1);
    }

    /**
     *
     * @returns {Object}
     */
    get authHeaders() {
        return {
            'X-Access-Token': this._data.token.value
        };
    }
}

const token = new Token();
export default token;
