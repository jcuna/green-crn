/**
 * Created by Jon on 12/29/17.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { hideOverlay } from '../actions/appActions';
import { CSSTransition } from 'react-transition-group';

export default class Overlay extends React.Component {
    constructor(props) {
        super(props);
        this.hideOverlay = this.hideOverlay.bind(this);
    }

    componentDidMount() {
        window.addEventListener('keyup', (e) => {
            if (e.code === 'Escape' || e.keyCode === 27) {
                this.hideOverlay();
            }
        });
    }

    render() {
        return <CSSTransition
            in={ this.props.overlay.display }
            timeout={ 300 }
            classNames="modal"
            // onExited={ this.props.overlay.onClose } does not seem to work
            unmountOnExit>
            <div className='modal'
                tabIndex='-1' role='dialog'
                aria-hidden='true'>
                <div className='modal-dialog' role='document'>
                    <div className={ `modal-content${ this.getContentExtraClass() }` }>
                        <div className='modal-header'>
                            <h5 className='modal-title'>{ this.props.overlay.title }</h5>
                            <button type='button' className='close' aria-label='Close' onClick={ this.hideOverlay }>
                                <span aria-hidden='true'>&times;</span>
                            </button>
                        </div>
                        <div className='modal-body'>
                            { this.props.overlay.component }
                        </div>
                        { (this.props.overlay.closeButton || this.props.overlay.actionButton) &&
                        <div className='modal-footer'>
                            { this.props.overlay.closeButton &&
                            <button
                                type='button' onClick={ this.hideOverlay } className='btn btn-secondary'>Cerrar
                            </button>
                            } { this.props.overlay.actionButton }
                        </div>
                        }
                    </div>
                </div>
            </div>
        </CSSTransition>;
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
        this.props.dispatch(hideOverlay());
        this.props.overlay.onClose && this.props.overlay.onClose();
    }

    static propTypes = {
        dispatch: PropTypes.func,
        overlay: PropTypes.object,
        showMobileMenu: PropTypes.bool,
        onClose: PropTypes.func,
    };
}
