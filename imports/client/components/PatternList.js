import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import { connect } from 'react-redux';
import React, { Component } from 'react';
import Patterns from '../../collection';
import Pattern from './Pattern';

class PatternList extends Component {
	render() {
		const { dispatch } = this.props;
		const patterns = this.props.patternList;

		return (
			<div className="pattern-list">
				{patterns.map((pattern) => (
					<Pattern
						key={pattern._id}
						name={pattern.name}
						id={pattern._id}
					/>
				))}
			</div>
		);
	}
}

const PatternListContainer = createContainer(({ visibilityFilter, pageSkip }) => {
	const todoSub = Meteor.subscribe('getTodos', visibilityFilter, pageSkip);
	return {
		'todoSubReady': todoSub.ready(),
		'patternList': Patterns.find({}, { 'limit': 10 }).fetch() || [],
	};
}, PatternList);

function mapStateToProps(state) {
	return {};
}

export default connect(mapStateToProps)(PatternListContainer);
