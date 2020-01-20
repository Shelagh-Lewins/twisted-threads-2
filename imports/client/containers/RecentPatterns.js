import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Col,
	Container,
	Row,
} from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import store from '../modules/store';
import {
	getIsLoading,
	getPatternCount,
	setIsLoading,
} from '../modules/pattern';
import { PatternPreviews, Tags } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PaginatedList from '../components/PaginatedList';
import PatternList from '../components/PatternList';

import { ITEMS_PER_PAGE } from '../../modules/parameters';
//import secondaryPatternSubscriptions from '../modules/secondaryPatternSubscriptions';
import findRecentPatterns from '../modules/findRecentPatterns';

import './Home.scss';

const queryString = require('query-string');

const bodyClass = 'new-patterns';

class RecentPatterns extends Component {
	constructor(props) {
		super(props);

		// bind onClick functions to provide context
		const functionsToBind = [
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	render() {
		const {
			currentPageNumber,
			dispatch,
			errors,
			history,
			isLoading,
			patternCount,
			patternPreviews,
			patterns,
			tags,
			users,
		} = this.props;

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<MainMenu />
				<Container
					className="menu-selected-area"
				>
					{isLoading && <Loading />}
					<Row>
						<Col lg="12">
							<h1>Recently viewed patterns</h1>
						</Col>
					</Row>
					{!isLoading && patternCount > 0 && (
						<PaginatedList
							currentPageNumber={currentPageNumber}
							dispatch={dispatch}
							history={history}
							itemCount={patternCount}
						>
							<PatternList
								dispatch={dispatch}
								patternPreviews={patternPreviews}
								patterns={patterns}
								tags={tags}
								users={users}
							/>
						</PaginatedList>
					)}
					{!isLoading && patternCount === 0 && (
						<div className="no-patterns">
							There are no recently viewed patterns to display
						</div>
					)}
				</Container>
			</PageWrapper>
		);
	}
}

RecentPatterns.defaultProps = {
	'currentPageNumber': 1,
};

RecentPatterns.propTypes = {
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'patternCount': PropTypes.number.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	// find page number as URL query parameter, if present, in the form '/?page=1'
	let currentPageNumber = 1;
	const parsed = queryString.parse(ownProps.location.search);
	const page = parseInt(parsed.page, 10);

	if (!Number.isNaN(page)) {
		currentPageNumber = page;
	}

	return {
		'currentPageNumber': currentPageNumber, // read the url parameter to find the currentPage
		'errors': state.errors,
		'isLoading': getIsLoading(state),
		'pageSkip': (currentPageNumber - 1) * ITEMS_PER_PAGE,
		'patternCount': state.pattern.patternCount,
	};
}

const Tracker = withTracker(({ pageSkip, dispatch }) => {
	const state = store.getState();
	const isLoading = getIsLoading(state);
//console.log('recentPatterns tracker');

	const { ready, recentPatterns } = findRecentPatterns();
	console.log('recents 1', recentPatterns);
	const sliceEnd = ITEMS_PER_PAGE + pageSkip;
	const patterns = recentPatterns.slice(pageSkip, sliceEnd);

	Meteor.subscribe('tags');

	/* const handle2 = Meteor.subscribe('patterns', pageSkip, 100, {
		'onReady': () => {
			console.log('Recentpatterns handle2 ready', patterns);
			//secondaryPatternSubscriptions(patterns);
		},
	}); */

	/* const handle = Meteor.subscribe('recentPatterns', patterns, {
		'onReady': () => {
			console.log('recentPatterns ready', patterns);
			secondaryPatternSubscriptions(patterns);
		},
	}); */

	if (isLoading && ready) {
		dispatch(getPatternCount({ 'countRecentPatterns': true }));
		dispatch(setIsLoading(false));
	} else if (!isLoading && !ready) {
		dispatch(setIsLoading(true));
	}
	/* if (isLoading && ready) {
		console.log('get pattern count');
		dispatch(getPatternCount({ 'countRecentPatterns': true }));
		dispatch(setIsLoading(false));
	} */
	//dispatch(setIsLoading(false));
console.log('recents 2', recentPatterns);
	return {
		patterns,
		'patternPreviews': PatternPreviews.find().fetch(),
		'tags': Tags.find().fetch(),
		'users': Meteor.users.find().fetch(),
	};
})(RecentPatterns);

export default connect(mapStateToProps)(Tracker);
