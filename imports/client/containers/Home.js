import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Container, Row } from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import store from '../modules/store';
import { getIsLoading, setIsLoading } from '../modules/pattern';
import {
	getCanCreatePattern,
	getIsAuthenticated,
	getIsVerified,
} from '../modules/auth';
import { PatternPreviews, Patterns, Tags } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PatternListPreview from '../components/PatternListPreview';
import UserListPreview from '../components/UserListPreview';
import CreatorMessage from '../components/CreatorMessage';
import DonatePayPal from '../components/DonatePayPal';
import DonateKoFi from '../components/DonateKoFi';
import DonatePatreon from '../components/DonatePatreon';
import AddPatternButton from '../components/AddPatternButton';

import { ITEMS_PER_PREVIEW_LIST } from '../../modules/parameters';
import secondaryPatternSubscriptions from '../modules/secondaryPatternSubscriptions';
import findRecentPatterns from '../modules/findRecentPatterns';

import './Home.scss';

const bodyClass = 'home';

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {
			showAddPatternForm: false,
			width: 0,
		};

		// bind onClick functions to provide context
		const functionsToBind = ['updateShowAddPatternForm'];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});

		// ref to find div into which pattern list previews must fit
		this.containerRef = React.createRef();
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);

		this.trackWindowSize();
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
		window.removeEventListener('resize', this.trackWindowSize);
	}

	trackWindowSize = () => {
		// find width of div into which lists must fit
		const containerElm = this.containerRef.current;

		if (containerElm) {
			// avoid error in maintenance mode
			window.addEventListener('resize', containerElm);

			// find the containing element's applied styles
			const compStyles = window.getComputedStyle(containerElm);

			const width =
				parseFloat(containerElm.clientWidth) -
				parseFloat(compStyles.getPropertyValue('padding-left')) -
				parseFloat(compStyles.getPropertyValue('padding-right'));

			this.setState({
				width,
			});
		}
	};

	updateShowAddPatternForm(showForm) {
		this.setState({
			showAddPatternForm: showForm,
		});
	}

	render() {
		const {
			allPatterns,
			allUsers,
			canCreatePattern,
			dispatch,
			errors,
			history,
			isAuthenticated,
			isLoading,
			isVerified,
			myPatterns,
			newPatterns,
			patternPreviews,
			recentPatterns,
			tags,
			users,
		} = this.props;
		const { showAddPatternForm, width } = this.state;

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<MainMenu />
				<div
					className='menu-selected-area'
					ref={this.containerRef}
				>
					<Container>
						{isLoading && <Loading />}
						<Row>
							<Col lg='12'>
								<p>
									<strong>
										Welcome to Twisted Threads, the online app for tablet
										weaving.
										<br />
										You can use this site to design, weave and share patterns.
									</strong>
									<br />
								</p>
								{!isAuthenticated && (
									<p>
										To get started, please <Link to='/login'>Login</Link>. If
										you don&apos;t already have an account, please{' '}
										<Link to='/register'>Register</Link>.
									</p>
								)}
								{isAuthenticated && !canCreatePattern && !isVerified && (
									<p>
										To create more patterns, please verify your email address.
										You can request a new verification email from your{' '}
										<Link to='/account'>Account</Link> page
									</p>
								)}
								{isAuthenticated && !canCreatePattern && isVerified && (
									<p>
										To create more patterns, please get in touch with the
										developer of Twisted Threads via the{' '}
										<a
											href='https://www.facebook.com/groups/927805953974190/'
											target='_blank'
											rel='noreferrer noopener'
										>
											Twisted Threads Facebook group
										</a>
										.
									</p>
								)}
							</Col>
						</Row>
						<Row>
							<Col>
								<p>
									Join our{' '}
									<a
										href='https://www.facebook.com/groups/twistedthreadsapp/'
										target='_blank'
										rel='noreferrer noopener'
									>
										Facebook group
									</a>{' '}
									if you&apos;d like to discuss Twisted Threads with other
									users, request new features or share feedback with the app
									developer. For more information, see{' '}
									<Link to='/about'>About Twisted Threads</Link>.
								</p>
							</Col>
						</Row>
						<Row>
							<Col>
								<CreatorMessage />
								<div className='donations'>
									<DonatePatreon />
									<DonateKoFi />
									<DonatePayPal />
								</div>
								<p className='notice'>
									The copyright of any pattern designed using Twisted Threads
									rests with the designer of the pattern, not with the creator
									or owner of the software.
								</p>
							</Col>
						</Row>
						{canCreatePattern && (
							<Row>
								<Col lg='12'>
									<AddPatternButton
										dispatch={dispatch}
										history={history}
										updateShowAddPatternForm={this.updateShowAddPatternForm}
									/>
								</Col>
							</Row>
						)}
					</Container>
					{!isLoading && !showAddPatternForm && (
						<>
							{recentPatterns.length > 0 && (
								<PatternListPreview
									dispatch={dispatch}
									listName='Recently viewed patterns'
									patterns={recentPatterns}
									patternPreviews={patternPreviews}
									tags={tags}
									url='/recent-patterns'
									users={users}
									width={width}
								/>
							)}
							<PatternListPreview
								dispatch={dispatch}
								listName='New patterns'
								patterns={newPatterns}
								patternPreviews={patternPreviews}
								tags={tags}
								url='/new-patterns'
								users={users}
								width={width}
							/>
							{isAuthenticated && (
								<PatternListPreview
									dispatch={dispatch}
									listName='My patterns'
									patterns={myPatterns}
									patternPreviews={patternPreviews}
									tags={tags}
									url={`/user/${Meteor.userId()}/patterns`}
									users={users}
									width={width}
								/>
							)}
							<PatternListPreview
								dispatch={dispatch}
								listName='All patterns'
								patterns={allPatterns}
								patternPreviews={patternPreviews}
								tags={tags}
								url='/all-patterns'
								users={users}
								width={width}
							/>
							<UserListPreview
								listName='People'
								url='/people'
								users={allUsers}
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
	allPatterns: PropTypes.arrayOf(PropTypes.any).isRequired,
	allUsers: PropTypes.arrayOf(PropTypes.any).isRequired,
	canCreatePattern: PropTypes.bool.isRequired,
	dispatch: PropTypes.func.isRequired,
	errors: PropTypes.objectOf(PropTypes.any).isRequired,
	history: PropTypes.objectOf(PropTypes.any).isRequired,
	isAuthenticated: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired,
	isVerified: PropTypes.bool.isRequired,
	myPatterns: PropTypes.arrayOf(PropTypes.any).isRequired,
	newPatterns: PropTypes.arrayOf(PropTypes.any).isRequired,
	patternPreviews: PropTypes.arrayOf(PropTypes.any).isRequired,
	recentPatterns: PropTypes.arrayOf(PropTypes.any).isRequired,
	tags: PropTypes.arrayOf(PropTypes.any).isRequired,
	users: PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		canCreatePattern: getCanCreatePattern(state),
		errors: state.errors,
		isAuthenticated: getIsAuthenticated(state),
		isLoading: getIsLoading(state),
		isVerified: getIsVerified(state),
	};
}

const Tracker = withTracker(({ dispatch }) => {
	const state = store.getState();
	const isLoading = getIsLoading(state);

	const allPatterns = Patterns.find(
		{},
		{
			limit: ITEMS_PER_PREVIEW_LIST,
			sort: { nameSort: 1 },
		},
	).fetch();

	let myPatterns = [];
	let newPatterns = [];
	let { recentPatterns } = findRecentPatterns();

	recentPatterns = recentPatterns.slice(0, ITEMS_PER_PREVIEW_LIST);

	// if (Accounts.loginServicesConfigured()) { // broken in Meteor 2.9 https://github.com/meteor/meteor/issues/12375, but we only need this if the user is logged in.
	if (Meteor.userId()) {
		myPatterns = Patterns.find(
			{ createdBy: Meteor.userId() },
			{
				limit: ITEMS_PER_PREVIEW_LIST,
				sort: { nameSort: 1 },
			},
		).fetch();
	}
	//}

	const allUsers = Meteor.users
		.find(
			{},
			{
				limit: ITEMS_PER_PREVIEW_LIST,
				sort: { nameSort: 1 },
			},
		)
		.fetch();

	Meteor.subscribe('tags');

	// handle so we can use onReady to set isLoading to false
	const handle = Meteor.subscribe('allPatternsPreview', {
		onReady: () => {
			secondaryPatternSubscriptions(allPatterns);
		},
	});

	Meteor.subscribe('myPatternsPreview', {
		onReady: () => {
			secondaryPatternSubscriptions(myPatterns);
		},
	});

	Meteor.subscribe('newPatternsPreview', {
		onReady: () => {
			newPatterns = Patterns.find(
				{ isPublic: { $eq: true } },
				{
					limit: ITEMS_PER_PREVIEW_LIST,
					sort: { createdAt: -1 },
				},
			).fetch();
			secondaryPatternSubscriptions(newPatterns);
		},
	});

	Meteor.subscribe('allUsersPreview');

	if (isLoading && handle.ready()) {
		setTimeout(() => {
			dispatch(setIsLoading(false));
		}, 1);
	} else if (!isLoading && !handle.ready()) {
		setTimeout(() => {
			dispatch(setIsLoading(true));
		}, 1);
	}

	return {
		allPatterns,
		allUsers,
		myPatterns,
		newPatterns,
		patternPreviews: PatternPreviews.find().fetch(),
		recentPatterns,
		tags: Tags.find().fetch(),
		users: Meteor.users.find().fetch(),
	};
})(Home);

export default connect(mapStateToProps)(Tracker);
