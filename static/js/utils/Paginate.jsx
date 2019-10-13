/**
 * Created by Jon on 2019-02-26.
 */

import React from 'react';
import PropTypes from 'prop-types';
import ReactPaginate from 'react-paginate';

const Paginate = (props) => {
    return <ReactPaginate
        pageCount={ props.total_pages }
        onPageChange={ ({ selected }) => {
            if (selected !== Number(props.initialPage) - 1) {
                props.onPageChange(selected + 1);
            }
        } }
        initialPage={ Number(props.initialPage) - 1 }
        previousLabel={ props.previousLabel }
        nextLabel={ props.nextLabel }
        breakLabel='...'
        marginPagesDisplayed={ 2 }
        pageRangeDisplayed={ 5 }
        breakClassName='page-item'
        containerClassName='pagination'
        pageClassName='page-item'
        pageLinkClassName='page-link'
        breakLinkClassName='page-link'
        activeClassName='active'
        disabledClassName='disabled'
        previousClassName='page-item'
        nextClassName='page-item'
        previousLinkClassName='page-link'
        nextLinkClassName='page-link'
    />;
};

Paginate.propTypes = {
    total_pages: PropTypes.number,
    onPageChange: PropTypes.func,
    initialPage: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    previousLabel: PropTypes.object,
    nextLabel: PropTypes.object,
};

Paginate.defaultProps = {
    previousLabel: (
        <span>
            <span aria-hidden="true">&laquo;</span>
            <span className="sr-only">Next</span>
        </span>
    ),
    nextLabel: (
        <span>
            <span aria-hidden="true">&raquo;</span>
            <span className="sr-only">Next</span>
        </span>
    ),
    initialPage: 1,
};

export default Paginate;
