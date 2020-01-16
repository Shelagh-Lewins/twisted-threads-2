import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Button,
	Col,
	Container,
	Row,
} from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import store from '../modules/store';
import {
	addPattern,
	getIsLoading,
	getPatternCount,
	setIsLoading,
} from '../modules/pattern';
import {
	getCanCreatePattern,
} from '../modules/auth';
import { PatternPreviews, Patterns, Tags } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PaginatedList from '../components/PaginatedList';
import PatternList from '../components/PatternList';
import AddPatternForm from '../forms/AddPatternForm';

import { ITEMS_PER_PAGE } from '../../modules/parameters';
import './Home.scss';

const queryString = require('query-string');

const bodyClass = 'my-patterns';

class MyPatterns extends Component {
	constructor(props) {
		super(props);

		this.state = {
			'showAddPatternForm': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickShowAddPatternForm',
			'handleCancelShowAddPatternForm',
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

	handleSubmitAddPattern = (data, { resetForm }) => {
		const { dispatch, history } = this.props;
		const modifiedData = { ...data };
		modifiedData.holes = parseInt(data.holes, 10); // select value is string

		dispatch(addPattern(modifiedData, history));
		resetForm();

		this.setState({
			'showAddPatternForm': false,
		});
	}

	handleClickShowAddPatternForm() {
		this.setState({
			'showAddPatternForm': true,
		});
	}

	handleCancelShowAddPatternForm() {
		this.setState({
			'showAddPatternForm': false,
		});
	}

	render() {
		const {
			canCreatePattern,
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
		const { showAddPatternForm } = this.state;

		const addPatternButton = (
			<Row>
				<Col lg="12">
					<Button
						className="show-add-pattern-form"
						color="primary"
						onClick={this.handleClickShowAddPatternForm}
					>
						New patterrn
					</Button>
				</Col>
			</Row>
		);

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
							<h1>My patterns</h1>
						</Col>
					</Row>
					{canCreatePattern && !showAddPatternForm && addPatternButton}
					{showAddPatternForm && (
						<Row>
							<Col lg="12">
								<AddPatternForm
									handleCancel={this.handleCancelShowAddPatternForm}
									handleSubmit={this.handleSubmitAddPattern}
								/>
								<hr />
							</Col>
						</Row>
					)}
					{!isLoading
						&& !showAddPatternForm
						&& patternCount > 0
						&& (
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
				</Container>
			</PageWrapper>
		);
	}
}

MyPatterns.defaultProps = {
	'currentPageNumber': 1,
};

MyPatterns.propTypes = {
	'canCreatePattern': PropTypes.bool.isRequired,
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
		'canCreatePattern': getCanCreatePattern(state),
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

	const patterns = Patterns.find(
		{ 'createdBy': Meteor.userId },
		{
			'sort': { 'nameSort': 1 },
			'limit': ITEMS_PER_PAGE,
		},
	).fetch();

	Meteor.subscribe('tags');

	const handle = Meteor.subscribe('myPatterns', pageSkip, ITEMS_PER_PAGE, {
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
})(MyPatterns);

export default connect(mapStateToProps)(Tracker);
