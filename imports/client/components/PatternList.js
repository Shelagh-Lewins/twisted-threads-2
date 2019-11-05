import { Meteor } from 'meteor/meteor';
import { createContainer } from 'react-meteor-data';
import { connect } from 'react-redux';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

import Patterns from '../../collection';
import Pattern from './Pattern';

class PatternList extends PureComponent {
	render() {
		const { dispatch, patternList } = this.props;

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
			</div>
		);
	}
}

const PatternListContainer = createContainer(({ visibilityFilter, pageSkip }) => {
	const patternSub = Meteor.subscribe('getPatterns', visibilityFilter, pageSkip);
	return {
		'todoSubReady': patternSub.ready(),
		'patternList': Patterns.find({}, { 'limit': 10 }).fetch() || [],
	};
}, PatternList);

PatternList.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'patternList': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state) {
	return {};
}

export default connect(mapStateToProps)(PatternListContainer);
