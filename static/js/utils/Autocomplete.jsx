/**
 * Created by Jon on 2019-05-29.
 */

import React from 'react';
import PropTypes from 'prop-types';
import FontAwesome from './FontAwesome';

export default class Autocomplete extends React.Component {
    constructor(props) {
        super(props);

        this.state = { showItems: false };

        this.input = React.createRef();

        this.showItems = this.showItems.bind(this);
        this.hideItems = this.hideItems.bind(this);
        this.selectItem = this.selectItem.bind(this);
    }

    render() {
        return <div className='dropdown autocomplete'>
            <input
                ref={ this.input }
                className={ this.props.className }
                placeholder={ this.props.placeholder }
                onClick={ this.showItems }
                name={ this.props.name }
                onChange={ this.props.onChange }
                autoComplete='off'
            />
            { this.state.showItems && <FontAwesome type='times' onClick={ this.hideItems }/> }
            { this.state.showItems && <ul className='item-list'>{ this.getItems() }</ul> }
        </div>;
    }

    getItems() {
        if (this.props.loading) {
            return <li className='loading-list'/>;
        }
        let i = 0;
        const result = this.props.items.map((item) => {
            i++;

            let className = 'drop-item';
            let onClick = this.selectItem;

            if (Number(item.key) === 0 || item.unselectable) {
                className += ' unselectable';
                onClick = null;
            }
            return <li key={ i } className={ className } data-id={ item.key } onClick={ onClick }>
                { item.label }
            </li>;
        });
        if (this.props.total_pages > 1) {
            result.push(
                <li key={ ++i } className='paginate'>
                    { this.props.page !== 1 &&
                    <FontAwesome type='backward' onClick={ this.props.onPrevious } className='left'/> }
                    { this.props.page !== this.props.total_pages &&
                    <FontAwesome type='forward' onClick={ this.props.onNext } className='right'/> }
                </li>,
            );
        }
        return result;
    }

    selectItem({ target }) {
        this.hideItems();
        this.input.current.value = target.textContent;
        this.props.onSelect({ key: target.getAttribute('data-id'), label: target.textContent });
    }

    showItems({ target }) {
        this.setState({ showItems: true, target });
    }

    hideItems() {
        this.setState({ showItems: false });
        if (this.input.current.value === '') {
            this.props.onSelect({ key: 0, label: '' });
        }
    }

    static propTypes = {
        className: PropTypes.string,
        loading: PropTypes.bool,
        name: PropTypes.string,
        placeholder: PropTypes.string,
        items: PropTypes.arrayOf(PropTypes.shape({
            key: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
            label: PropTypes.string.isRequired,
            unselectable: PropTypes.bool,
        })),
        onChange: PropTypes.func,
        onSelect: PropTypes.func,
        onNext: PropTypes.func,
        onPrevious: PropTypes.func,
        total_pages: PropTypes.number,
        page: PropTypes.number,
    };
}
