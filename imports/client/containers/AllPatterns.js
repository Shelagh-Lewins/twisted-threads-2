import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Col,
	Container,
	Row,
} from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import store from '../modules/store';
import {
	getIsLoading,
	getPatternCount,
	setIsLoading,
} from '../modules/pattern';
import {
	getIsAuthenticated,
} from '../modules/auth';
import { PatternPreviews, Patterns, Tags } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PatternList from '../components/PatternList';

import { ITEMS_PER_PAGE } from '../../modules/parameters';
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
			isAuthenticated,
			isLoading,
			isVerified,
			patterns,
			patternCount,
			patternPreviews,
			tags,
			users,
		} = this.props;

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<MainMenu />
				<Container className="menu-selected-area">
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
								<Row>
									<Col lg="12">
										<h2>All patterns</h2>
									</Col>
								</Row>
								<PatternList
									currentPageNumber={currentPageNumber}
									dispatch={dispatch}
									history={history}
									patternCount={patternCount}
									patterns={patterns}
									patternPreviews={patternPreviews}
									tags={tags}
									users={users}
								/>
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
	'isAuthenticated': PropTypes.bool.isRequired,
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
		'isAuthenticated': getIsAuthenticated(state),
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
			const patternIds = patterns.map((pattern) => pattern._id);

			Meteor.subscribe('patternPreviews', { patternIds });

			const userIds = patterns.map((pattern) => pattern.createdBy);
			const uniqueUsers = [...(new Set(userIds))];

			Meteor.subscribe('users', uniqueUsers);
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
