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
import store from '../modules/store';
import {
	addPattern,
	getIsLoading,
	getPatternCount,
	setIsLoading,
} from '../modules/pattern';
import {
	getCanCreatePattern,
	getIsAuthenticated,
	getIsVerified,
} from '../modules/auth';
import { PatternPreviews, Patterns, Tags } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PatternListPreview from '../components/PatternListPreview';
import AddPatternForm from '../forms/AddPatternForm';

import { ITEMS_PER_PREVIEW_LIST } from '../../modules/parameters';
import './Home.scss';

const bodyClass = 'home';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			'showAddPatternForm': false,
			'width': 0,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickShowAddPatternForm',
			'handleCancelShowAddPatternForm',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});

		// ref to find div into which pattern list previews must fit
		this.containerRef = React.createRef();
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
		window.addEventListener('resize', this.trackWindowSize);
		this.trackWindowSize();
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
		window.removeEventListener('resize', this.trackWindowSize);
	}

	trackWindowSize = () => {
		// find width of div into which lists must fit
		const containerElm = this.containerRef.current;

		// find the containing element's applied styles
		const compStyles = window.getComputedStyle(containerElm);

		const width = parseFloat(containerElm.clientWidth)
		- parseFloat(compStyles.getPropertyValue('padding-left'))
		- parseFloat(compStyles.getPropertyValue('padding-right'));

		this.setState({
			width,
		});
	}

	// to do set size at mount

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
			allPatterns,
			canCreatePattern,
			dispatch,
			errors,
			isAuthenticated,
			isLoading,
			isVerified,
			patternPreviews,
			tags,
			users,
		} = this.props;
		const { showAddPatternForm, width } = this.state;

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
				<div
					className="menu-selected-area"
					ref={this.containerRef}
				>
					<Container>
						{isLoading && <Loading />}
						<Row>
							<Col lg="12">
								<h1>Welcome</h1>
								This is the development version of Twisted Threads 2, the online app for tablet weaving. ALL DATA HERE MAY BE DELETED AT ANY TIME.
								{!isAuthenticated && <p>To get started, please <Link to="/login">Login</Link>. If you don&apos;t already have an account, please <Link to="/register">Register</Link>.</p>}
								{isAuthenticated && !canCreatePattern && !isVerified && <p>To create more patterns, please verify your email address. You can request a new verification email from your <Link to="/account">Account</Link> page</p>}
								{isAuthenticated && !canCreatePattern && isVerified && <p>To create more patterns, please get in touch with the developer of Twisted Threads via the <a href="https://www.facebook.com/groups/927805953974190/">Twisted Threads Facebook group</a>.</p>}
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
					</Container>
					{!isLoading && !showAddPatternForm && (
						<>
							<PatternListPreview
								dispatch={dispatch}
								listName="All patterns"
								patterns={allPatterns}
								patternPreviews={patternPreviews}
								tags={tags}
								url="/all-patterns"
								users={users}
								width={width}
							/>
						</>
					)}
				</div>
			</PageWrapper>
		);
	}
}

Home.propTypes = {
	'allPatterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'canCreatePattern': PropTypes.bool.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'isVerified': PropTypes.bool.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'canCreatePattern': getCanCreatePattern(state),
		'errors': state.errors,
		'isAuthenticated': getIsAuthenticated(state),
		'isLoading': getIsLoading(state),
		'isVerified': getIsVerified(state),
	};
}

const Tracker = withTracker(({ dispatch }) => {
	const state = store.getState();
	const isLoading = getIsLoading(state);

	const allPatterns = Patterns.find({}, {
		'limit': ITEMS_PER_PREVIEW_LIST,
		'sort': { 'nameSort': 1 },
	}).fetch();

	Meteor.subscribe('tags');

	const handle = Meteor.subscribe('allPatternsPreview', {
		'onReady': () => {
			const patternIds = allPatterns.map((pattern) => pattern._id);

			Meteor.subscribe('patternPreviews', { patternIds });

			const userIds = allPatterns.map((pattern) => pattern.createdBy);
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
		allPatterns,
		'patternPreviews': PatternPreviews.find().fetch(),
		'tags': Tags.find().fetch(),
		'users': Meteor.users.find().fetch(),
	};
})(Home);

export default connect(mapStateToProps)(Tracker);
