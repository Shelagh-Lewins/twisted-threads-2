// Preview lists for pattern and user listing pages

import React, { PureComponent } from 'react';
import { Row, Col } from 'reactstrap';
import PropTypes from 'prop-types';

import Pagination from './Pagination';
import { changePage } from '../modules/pattern';
import { ITEMS_PER_PAGE } from '../../modules/parameters';
import './PaginatedList.scss';

class PaginatedList extends PureComponent {
	render() {
		const {
			children,
			currentPageNumber,
			dispatch,
			history,
			itemCount,
			patternCountParams,
		} = this.props;

		const pagination = itemCount > ITEMS_PER_PAGE ? (
			<Pagination
				handlePageClick={(data) => dispatch(changePage(data.selected, history, patternCountParams))}
				initialPage={currentPageNumber - 1}
				pageCount={Math.ceil(itemCount / ITEMS_PER_PAGE)}
			/>
		) : '';

		return (
			<Row className="item-list">
				{children}
				<Col lg="12">
					{pagination}
				</Col>
			</Row>
		);
	}
}

PaginatedList.propTypes = {
	'children': PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.arrayOf(PropTypes.element),
		PropTypes.node,
	]),
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'itemCount': PropTypes.number.isRequired,
	'patternCountParams': PropTypes.objectOf(PropTypes.any),
};

export default PaginatedList;