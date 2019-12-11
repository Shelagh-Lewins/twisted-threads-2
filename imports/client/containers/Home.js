import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Button,
	Col,
	Container,
	Row,
} from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import { addPattern, getPatternCount, setIsLoading } from '../modules/pattern';
import { getIsAuthenticated, getIsVerified } from '../modules/auth';
import { PatternPreviews, Patterns } from '../../modules/collection';
import Loading from '../components/Loading';
import PatternList from '../components/PatternList';
import AddPatternForm from '../forms/AddPatternForm';

import { ITEMS_PER_PAGE } from '../../modules/parameters';
import './Home.scss';

const queryString = require('query-string');

const bodyClass = 'home';

class Home extends Component {
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
			currentPageNumber,
			dispatch,
			errors,
			history,
			isAuthenticated,
			isLoading,
			patterns,
			patternCount,
			patternPreviews,
			users,
			verified,
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
				<Container>
					{isLoading && <Loading />}
					<Row>
						<Col lg="12">
							<h1>Welcome</h1>
							This is the development version of Twisted Threads 2, the online app for tablet weaving. ALL DATA HERE MAY BE DELETED AT ANY TIME.
							{!isAuthenticated && <p>To get started, please <Link to="/login">Login</Link>. If you don&apos;t already have an account, please <Link to="/register">Register</Link>.</p>}
							{isAuthenticated && !verified && <p>To create patterns, please verify your email address. You can request a new verification email from your <Link to="/account">Account</Link> page</p>}
						</Col>
					</Row>
					{verified && !showAddPatternForm && addPatternButton}
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
						&& patternCount > 0
						&& !showAddPatternForm && (
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
								users={users}
							/>
						</>
					)}
				</Container>
			</PageWrapper>
		);
	}
}

Home.defaultProps = {
	'currentPageNumber': 1,
};

Home.propTypes = {
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'patternCount': PropTypes.number.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
	'verified': PropTypes.bool.isRequired,
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
		'isAuthenticated': getIsAuthenticated(),
		'isLoading': state.pattern.isLoading,
		'pageSkip': (currentPageNumber - 1) * ITEMS_PER_PAGE,
		'patternCount': state.pattern.patternCount,
		'verified': getIsVerified(), // calling getUser here causes an infinite update loop. But getting just a boolean is OK.
	};
}

const Tracker = withTracker(({ pageSkip, dispatch }) => {
	dispatch(setIsLoading(true));

	const patterns = Patterns.find({}, {
		'sort': { 'nameSort': 1 },
		'limit': ITEMS_PER_PAGE,
	}).fetch();

	Meteor.subscribe('patterns', pageSkip, ITEMS_PER_PAGE, {
		'onReady': () => {
			dispatch(getPatternCount());
			dispatch(setIsLoading(false));

			const patternIds = patterns.map((pattern) => pattern._id);

			Meteor.subscribe('patternPreviews', { patternIds });

			const userIds = patterns.map((pattern) => pattern.createdBy);
			const uniqueUsers = [...(new Set(userIds))];

			Meteor.subscribe('users', uniqueUsers);
		},
	});

	return {
		patterns,
		'patternPreviews': PatternPreviews.find().fetch(),
		'users': Meteor.users.find().fetch(),
	};
})(Home);

export default connect(mapStateToProps)(Tracker);
