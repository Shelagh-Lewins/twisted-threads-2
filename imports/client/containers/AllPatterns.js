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
import { PatternPreviews, Patterns, Tags } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import TabletFilterForm from '../forms/TabletFilterForm';
import PaginatedList from '../components/PaginatedList';
import PatternList from '../components/PatternList';

import { ITEMS_PER_PAGE } from '../../modules/parameters';
import secondaryPatternSubscriptions from '../modules/secondaryPatternSubscriptions';

import './Home.scss';

const queryString = require('query-string');

const bodyClass = 'all-patterns';

class AllPatterns extends Component {
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
							<h1>All patterns</h1>
						</Col>
					</Row>
					{!isLoading
						&& patternCount > 0
						&& (
							<>
								<TabletFilterForm />
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
							</>
						)}
				</Container>
			</PageWrapper>
		);
	}
}

AllPatterns.defaultProps = {
	'currentPageNumber': 1,
};

AllPatterns.propTypes = {
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

	const patterns = Patterns.find({}, {
		'sort': { 'nameSort': 1 },
		'limit': ITEMS_PER_PAGE,
	}).fetch();

	Meteor.subscribe('tags');

	const handle = Meteor.subscribe('patterns', pageSkip, ITEMS_PER_PAGE, {
		'onReady': () => {
			secondaryPatternSubscriptions(patterns);
		},
	});

	if (isLoading && handle.ready()) {
		dispatch(getPatternCount());
		dispatch(setIsLoading(false));
	} else if (!isLoading && !handle.ready()) {
		dispatch(setIsLoading(true));
	}

	return {
		patterns,
		'patternPreviews': PatternPreviews.find().fetch(),
		'tags': Tags.find().fetch(),
		'users': Meteor.users.find().fetch(),
	};
})(AllPatterns);

export default connect(mapStateToProps)(Tracker);
