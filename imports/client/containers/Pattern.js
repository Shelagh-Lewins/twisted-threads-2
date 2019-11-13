// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { setIsLoading } from '../modules/pattern';

import Patterns from '../../collection';
import Loading from '../components/Loading';

class Pattern extends PureComponent {
	render() {
		const { isLoading, pattern } = this.props;

		let content = <Loading />;

		if (!isLoading) {
			if (pattern.name && pattern.name !== '') {
				content = <h2>{pattern.name}</h2>;
			} else {
				content = <p>Either this pattern does not exist or you do not have permission to view it</p>;
			}
		}

		return (
			<div className="pattern-detail">
				{content}
			</div>
		);
	}
}

Pattern.propTypes = {
	'isLoading': PropTypes.bool.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
		'isLoading': state.pattern.isLoading,
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
		'pattern': pattern || {},
	};
})(Pattern);

export default connect(mapStateToProps)(Tracker);
