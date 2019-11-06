// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { setIsLoading } from '../modules/pattern';

import Patterns from '../../collection';

class Pattern extends PureComponent {
	render() {
		const { name } = this.props;

		return (
			<div className="pattern-detail">
				<h2>{name}</h2>
			</div>
		);
	}
}

Pattern.propTypes = {
	'name': PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
	};
}

const Tracker = withTracker(({ _id, dispatch }) => {
	dispatch(setIsLoading(true));

	Meteor.subscribe('pattern', _id, {
		'onReady': () => dispatch(setIsLoading(false)),
	});

	const pattern = Patterns.findOne({ _id }) || {};

	// pass database data as props
	return {
		'name': pattern.name || '',
	};
})(Pattern);

export default connect(mapStateToProps)(Tracker);
