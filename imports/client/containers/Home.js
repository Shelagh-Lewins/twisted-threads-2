import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { getPatternCount } from '../modules/pattern';

import Patterns from '../../collection';
import PatternList from '../components/PatternList';
import AddPattern from '../components/AddPattern';
import { ITEMS_PER_PAGE } from '../constants/parameters';
import './Home.scss';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	render() {
		const { patterns } = this.props;
		return (
			<div>
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
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state) {
	return {
		'pageSkip': state.pattern.currentPageNumber * ITEMS_PER_PAGE,
	};
}

const Tracker = withTracker(({ pageSkip, dispatch }) => {
	Meteor.subscribe('patterns', pageSkip, ITEMS_PER_PAGE, {
		'onReady': () => dispatch(getPatternCount()),
	});

	return {
		'patterns': Patterns.find({}, { 'limit': ITEMS_PER_PAGE }, { 'sort': { 'name': -1 } }).fetch(),
	};
})(Home);

export default connect(mapStateToProps)(Tracker);
