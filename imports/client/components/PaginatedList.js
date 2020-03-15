// Preview lists for pattern and user listing pages

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Pagination from './Pagination';
import { changePage } from '../modules/pattern';
import { setItemsPerPage } from '../modules/page';
import { ALLOWED_ITEMS_PER_PAGE } from '../../modules/parameters';
import './PaginatedList.scss';

class PaginatedList extends PureComponent {
	constructor(props) {
		super(props);

		const { itemsPerPage } = props;

		this.state = {
			itemsPerPage,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handlePageClick',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	handleChangeItemPerPage = (event) => {
		const {
			dispatch,
		} = this.props;

		dispatch(setItemsPerPage(parseInt(event.target.value, 10)));

		this.setState({
			'itemsPerPage': event.target.value,
		});
	}

	handlePageClick = (data) => {
		const {
			dispatch,
			history,
		} = this.props;

		dispatch(changePage(data.selected, history));
	}

	render() {
		const {
			children,
			currentPageNumber,
			itemCount,
		} = this.props;
		const { itemsPerPage } = this.state;

		const itemsPerPageSelect = (
			<div className="select-items-per-page">
				Items per page:&nbsp;
				<select
					className="form-control"
					onChange={this.handleChangeItemPerPage}
					defaultValue={itemsPerPage}
				>
					{ALLOWED_ITEMS_PER_PAGE.map((value) => (
						<option
							key={`items-${value}`}
							label={value}
							value={value}
						>
							{value}
						</option>
					))}
				</select>
			</div>
		);

		const pagination = itemCount > itemsPerPage ? (
			<Pagination
				handlePageClick={this.handlePageClick}
				initialPage={currentPageNumber - 1}
				pageCount={Math.ceil(itemCount / itemsPerPage)}
			/>
		) : '';

		return (
			<div className="item-list">
				{itemsPerPageSelect}
				{pagination}
				{children}
				{pagination}
			</div>
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
	'itemsPerPage': PropTypes.number.isRequired,
};

function mapStateToProps(state) {
	return {
		'itemsPerPage': state.page.itemsPerPage,
	};
}

export default connect(mapStateToProps)(PaginatedList);
