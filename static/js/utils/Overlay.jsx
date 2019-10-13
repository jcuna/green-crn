/**
 * Created by Jon on 12/29/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { hideOverlay } from '../actions/appActions';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';

export default class Overlay extends React.Component {
    constructor() {
        super();
        this.hideOverlay = this.hideOverlay.bind(this);
    }

    componentDidMount() {
        window.addEventListener('keyup', (e) => {
            if (e.keyCode === 27) {
                this.hideOverlay();
            }
        });
    }

    render() {
        if (this.props.overlay.display) {
            return <ReactCSSTransitionGroup
                transitionAppear={ true }
                transitionAppearTimeout={ 500 }
                transitionEnter={ false }
                transitionLeave={ false }
                transitionName={ {
                    leave: 'fade',
                    leaveActive: 'leaveActive',
                    appear: 'fade',
                    appearActive: 'show'
                } }>
                <div className="modal"
                    tabIndex="-1" role="dialog"
                    aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className={ `modal-content${this.getContentExtraClass()}` }>
                            <div className="modal-header">
                                <h5 className="modal-title">{this.props.overlay.title}</h5>
                                <button type="button" className="close" aria-label="Close" onClick={ this.hideOverlay }>
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {this.props.overlay.component}
                            </div>
                            {(this.props.overlay.closeButton || this.props.overlay.actionButton) &&
                            <div className="modal-footer">
                                {this.props.overlay.closeButton &&
                                    <button
                                        type="button" onClick={ this.hideOverlay } className="btn btn-secondary">Cerrar
                                    </button>
                                } {this.props.overlay.actionButton}
                            </div>
                            }
                        </div>
                    </div>
                </div>
            </ReactCSSTransitionGroup>;
        }
        return null;
    }

    getContentExtraClass() {
        let menuShort = '';

        if (this.props.showMobileMenu) {
            menuShort = ' menu-short';
        }
        return menuShort;
    }

    hideOverlay() {
        window.removeEventListener('keyup', this.hideOverlay);
        if (typeof this.props.overlay.afterClose !== 'undefined') {
            this.props.overlay.afterClose();
        }
        this.props.dispatch(hideOverlay());
    }

    static propTypes = {
        dispatch: PropTypes.func,
        overlay: PropTypes.object,
        showMobileMenu: PropTypes.bool
    };
}
