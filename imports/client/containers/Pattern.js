// detail of a single pattern

import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { setIsLoading } from '../modules/pattern';

import Patterns from '../../collection';
import Loading from '../components/Loading';
import Threading from '../components/Threading';
import './Pattern.scss';

const bodyClass = 'pattern';

class Pattern extends PureComponent {
	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	render() {
		const { isLoading, pattern } = this.props;

		let content = <Loading />;

		if (!isLoading) {
			if (pattern.name && pattern.name !== '') {
				content = (
					<>
						<h1>{pattern.name}</h1>
						{/* if navigating from the home page, the pattern is in MiniMongo before Tracker sets isLoading to true. Since the Home version is just the summary, it doesn't have threading and causes an error. */}
						{pattern.threading && (
							<Threading
								pattern={pattern}
							/>
						)}
					</>
				);
			} else {
				content = <p>Either this pattern does not exist or you do not have permission to view it</p>;
			}
		}

		return (
			<div>
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
	console.log('map isLoading', state.pattern.isLoading);
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
