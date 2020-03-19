// Preview lists for pattern and user listing pages

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import Pagination from './Pagination';
import { changePage, setItemsPerPage } from '../modules/page';
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

	componentDidUpdate(prevProps) {
		const {
			currentPageNumber,
			dispatch,
			handlePaginationUpdate,
			history,
			itemCount,
			itemsPerPage,
		} = this.props;
		const lastPage = Math.ceil(itemCount / itemsPerPage);
		let runCallback = false;

		// make sure the user is on a valid page
		if (currentPageNumber === 0) {
			dispatch(changePage(0, history));

			runCallback = true;
		} else if (itemCount > 0 && (currentPageNumber > (lastPage))) {
			dispatch(changePage(lastPage - 1, history));

			runCallback = true;
		} else if (currentPageNumber !== prevProps.currentPageNumber) {
			runCallback = true;
		}

		if (runCallback && typeof handlePaginationUpdate === 'function') {
			handlePaginationUpdate();
		}
	}

	handleChangeItemPerPage = (event) => {
		const {
			dispatch,
			handlePaginationUpdate,
		} = this.props;

		dispatch(setItemsPerPage(parseInt(event.target.value, 10)));

		this.setState({
			'itemsPerPage': event.target.value,
		});

		if (typeof handlePaginationUpdate === 'function') {
			handlePaginationUpdate();
		}
	}

	handlePageClick = (data) => {
		const {
			dispatch,
			handlePaginationUpdate,
			history,
		} = this.props;

		dispatch(changePage(data.selected, history));

		if (typeof handlePaginationUpdate === 'function') {
			handlePaginationUpdate();
		}
	}

	render() {
		const {
			children,
			currentPageNumber,
			itemCount,
			useForcePage,
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

		const initialPage = currentPageNumber - 1;

		// unlike pattern pages, User page does not refresh on pagination
		// so we must force both pagination instances to show the correct page number
		const pagination = itemCount > itemsPerPage ? (
			<Pagination
				forcePage={useForcePage ? initialPage : undefined}
				handlePageClick={this.handlePageClick}
				initialPage={initialPage}
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
	'handlePaginationUpdate': PropTypes.func,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'itemCount': PropTypes.number.isRequired,
	'itemsPerPage': PropTypes.number.isRequired,
	'useForcePage': PropTypes.bool,
};

function mapStateToProps(state) {
	return {
		'itemsPerPage': state.page.itemsPerPage,
	};
}

export default connect(mapStateToProps)(PaginatedList);
