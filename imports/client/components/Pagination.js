import React from 'react';
import ReactPaginate from 'react-paginate';
import PropTypes from 'prop-types';

function Pagination({ handlePageClick, pageCount }) {
	return (
		<div className="paginate">
			<ReactPaginate
				previousLabel={'previous'}
        nextLabel={'next'}
        breakLabel={'...'}
        breakClassName={'break-me'}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={'pagination'}
        subContainerClassName={'pages pagination'}
        activeClassName={'active'}
			/>
		</div>
	);
}

Pagination.propTypes = {
	'handlePageClick': PropTypes.func.isRequired,
	'pageCount': PropTypes.number.isRequired,
};

export default Pagination;
