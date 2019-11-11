import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import PatternSummary from './PatternSummary';
import Pagination from './Pagination';
import { changePage } from '../modules/pattern';
import { ITEMS_PER_PAGE } from '../../parameters';

class PatternList extends PureComponent {
	render() {
		const {
			currentPageNumber,
			dispatch,
			history,
			patternCount,
			patterns,
		} = this.props;

		const pagination = patternCount > ITEMS_PER_PAGE ? (
			<Pagination
				handlePageClick={(data) => dispatch(changePage(data.selected, history))}
				initialPage={currentPageNumber - 1}
				pageCount={Math.ceil(patternCount / ITEMS_PER_PAGE)}
			/>
		) : '';

		return (
			<div className="pattern-list">
				<h2>Patterns</h2>
				{patterns.map((pattern) => (
					<PatternSummary
						key={pattern._id}
						name={pattern.name}
						_id={pattern._id}
						dispatch={dispatch}
					/>
				))}
				{pagination}
			</div>
		);
	}
}

PatternList.propTypes = {
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'patternCount': PropTypes.number.isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default PatternList;
