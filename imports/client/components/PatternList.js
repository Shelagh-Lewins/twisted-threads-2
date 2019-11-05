import { Meteor } from 'meteor/meteor';
import { createContainer } from 'react-meteor-data';
import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Patterns from '../../collection';
import Pattern from './Pattern';
import Pagination from './Pagination';

const PER_PAGE_SKIP = 10;

class PatternList extends PureComponent {
	render() {
		const { dispatch, patternList } = this.props;
		console.log('count', this.props.patternCount);
		const pagination = this.props.patternCount > 10 ? (
			<Pagination
				handlePageClick={(data) => { return dispatch(changePage(data.selected)); }}
				pageCount={2}
			/>
		) : '';

		return (
			<div className="pattern-list">
				{patternList.map((pattern) => (
					<Pattern
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

const PatternListContainer = createContainer(({ pageSkip }) => {
	const patternSub = Meteor.subscribe('getPatterns', pageSkip);
	Meteor.subscribe('patternsCountByFilter', 'all');

	return {
		'todoSubReady': patternSub.ready(),
		'patternList': Patterns.find({}, { 'limit': PER_PAGE_SKIP }).fetch() || [],
		'patternCount': Counts.get('PatternCount'),
	};
}, PatternList);

PatternList.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'patternList': PropTypes.arrayOf(PropTypes.any).isRequired,
	// 'pageSkip': PropTypes.number.isRequired,
};

function mapStateToProps(state) {
	return {
		'pageSkip': state.currentPageNumber * PER_PAGE_SKIP,
	};
}

export default connect(mapStateToProps)(PatternListContainer);
