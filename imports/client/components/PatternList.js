import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import PatternSummary from './PatternSummary';
import Pagination from './Pagination';
import { changePage } from '../modules/pattern';
import { ITEMS_PER_PAGE } from '../../parameters';

class PatternList extends PureComponent {
	render() {
		const { dispatch, patternCount, patterns } = this.props;

		const pagination = patternCount > ITEMS_PER_PAGE ? (
			<Pagination
				handlePageClick={(data) => dispatch(changePage(data.selected))}
				pageCount={patternCount / ITEMS_PER_PAGE}
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
	'dispatch': PropTypes.func.isRequired,
	'patternCount': PropTypes.number.isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state) {
	return {
		'patternCount': state.pattern.patternCount,
		'currentPageNumber': state.pattern.currentPageNumber,
	};
}

export default connect(mapStateToProps)(PatternList);
