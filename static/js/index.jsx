/**
 * Created by Jon on 6/22/17.
 *
 * This file bootstraps react and all dependencies to the app tree
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import App from './components/App.jsx';
import store from './store';

const bootstrap = () => {
    /* eslint-disable */
    if (typeof module === 'object' && module.hot) {
        module.hot.accept();
    }

    ReactDOM.render(
        <Provider store={ store }>
            <App/>
        </Provider>, document.querySelector('#content')
    );
};

bootstrap();
