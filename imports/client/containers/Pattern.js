// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';

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
	// 'dispatch': PropTypes.func.isRequired,
	'_id': PropTypes.string.isRequired,
	// 'name': PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
	};
}

const Tracker = withTracker(({ _id }) => {
	Meteor.subscribe('pattern', _id, {
		'onReady': () => console.log('pattern subscribe ready'),
	});

	const pattern = Patterns.findOne({ _id }) || {};

	return {
		'name': pattern.name,
	};
})(Pattern);

export default connect(mapStateToProps)(Tracker);

// export default connect(mapStateToProps)(Pattern);
