import React from 'react';
import ReactPaginate from 'react-paginate';
import PropTypes from 'prop-types';
import './Pagination.scss';

function Pagination({ handlePageClick, initialPage, pageCount }) {
	return (
		<div className="paginate">
			<ReactPaginate
				initialPage={initialPage || 0}
				previousLabel="previous"
				nextLabel="next"
				breakLabel="..."
				breakClassName="break-me"
				pageCount={pageCount}
				marginPagesDisplayed={2}
				pageRangeDisplayed={5}
				onPageChange={handlePageClick}
				containerClassName="pagination"
				subContainerClassName="pages pagination"
				activeClassName="active"
			/>
		</div>
	);
}

Pagination.propTypes = {
	'handlePageClick': PropTypes.func.isRequired,
	'pageCount': PropTypes.number.isRequired,
	'initialPage': PropTypes.number.isRequired,
};

export default Pagination;
