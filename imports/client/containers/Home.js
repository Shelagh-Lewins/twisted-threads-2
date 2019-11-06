import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { getPatternCount, setIsLoading } from '../modules/pattern';

import Patterns from '../../collection';
import Loading from '../components/Loading';
import PatternList from '../components/PatternList';
import AddPattern from '../components/AddPattern';
import { ITEMS_PER_PAGE } from '../../parameters';
import './Home.scss';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		const { patterns, isLoading } = this.props;
		return (
			<div>
				{isLoading && <Loading />}
				<h1>Home</h1>
				<AddPattern />
				<PatternList
					patterns={patterns}
				/>
			</div>
		);
	}
}

Home.propTypes = {
	'isLoading': PropTypes.bool.isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state) {
	return {
		'pageSkip': state.pattern.currentPageNumber * ITEMS_PER_PAGE,
		'isLoading': state.pattern.isLoading,
	};
}

const Tracker = withTracker(({ pageSkip, dispatch }) => {
	dispatch(setIsLoading(true));

	Meteor.subscribe('patterns', pageSkip, ITEMS_PER_PAGE, {
		'onReady': () => {
			dispatch(getPatternCount());
			dispatch(setIsLoading(false));
		},
	});

	return {
		'patterns': Patterns.find({}, { 'limit': ITEMS_PER_PAGE }, { 'sort': { 'name': 1 } }).fetch(),
	};
})(Home);

export default connect(mapStateToProps)(Tracker);
