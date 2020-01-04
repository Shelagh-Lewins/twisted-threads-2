import React from 'react';
import PropTypes from 'prop-types';
import {
	matchPath,
	BrowserRouter as Router,
	Route,
	Switch,
	withRouter,
} from 'react-router-dom';
import { connect, Provider } from 'react-redux';

// fontawesome
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	// faQuestionCircle,
	// faUser,
	// faFileDownload,
	faBookOpen,
	faClone,
	faLock,
	faLockOpen,
	faPencilAlt,
	faSearch,
	faTrash,
} from '@fortawesome/free-solid-svg-icons'; // import the icons you want
import { withTracker } from 'meteor/react-meteor-data';
import {
	ColorBooks,
	PatternImages,
	Patterns,
	Tags,
} from '../../modules/collection';
import store from '../modules/store';
import {
	getNumberOfColorBooks,
	getNumberOfPatternImages,
	getNumberOfPatterns,
	getUserRoles,
	getUserId,
	getUsername,
	setNumberOfColorBooks,
	setNumberOfPatternImages,
	setNumberOfPatterns,
	setUser,
	setUserRoles,
} from '../modules/auth';
import {
	getIsLoading,
	setIsLoading,
} from '../modules/pattern';
import AppContext from '../modules/appContext';
import Navbar from '../components/Navbar';
import Login from './Login';
import Register from './Register';
import Welcome from './Welcome';
import Account from './Account';
import ChangePassword from './ChangePassword';
import VerifyEmail from './VerifyEmail';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Home from './Home';
import Pattern from './Pattern';
import User from './User';
import InteractiveWeavingChart from './InteractiveWeavingChart';
import WeavingPrintView from './PrintView';
import DevTools from '../components/DevTools';
import './App.scss';

// for optional url parameter with specified options, use regex: https://stackoverflow.com/questions/47369023/react-router-v4-allow-only-certain-parameters-in-url
// this allows pattern/id/tabname and pattern/id/weaving with different components

library.add(
	faBookOpen,
	faClone,
	faLock,
	faLockOpen,
	faPencilAlt,
	faSearch,
	faTrash,
); // and add them to your library

const PrintViewContainer = () => (
	<div className="app-container">
		<Route exact path="/pattern/:id/print-view" component={WeavingPrintView} />
	</div>
);

const DefaultContainer = () => (
	<div className="app-container">
		<Navbar	/>
		<div className="main-container">
			{process.env.NODE_ENV === 'development' && <DevTools />}
			<Route exact path="/login" component={Login} />
			<Route exact path="/register" component={Register} />
			<Route exact path="/welcome" component={Welcome} />
			<Route exact path="/account" component={Account} />
			<Route exact path="/verify-email/:token" component={VerifyEmail} />
			<Route exact path="/change-password" component={ChangePassword} />
			<Route exact path="/forgot-password" component={ForgotPassword} />
			<Route exact path="/reset-password/:token" component={ResetPassword} />
			<Route exact path="/" component={Home} />
			<Route exact path="/pattern/:id/:tab(design|info)?" component={Pattern} />
			<Route exact path="/pattern/:id/weaving" component={InteractiveWeavingChart} />
			<Route exact path="/user/:id" component={User} />
		</div>
	</div>
);

function App() {
	return (
		<Provider store={store}>
			<Router>
				<DatabaseProvider>
					<Switch>
						<Route exact path="/pattern/:id/print-view" component={PrintViewContainer} />
						<Route component={DefaultContainer} />
					</Switch>
				</DatabaseProvider>
			</Router>
		</Provider>
	);
}

export const withDatabase = withTracker((props) => {
	const { dispatch, location } = props;
	let pattern;
	let patternIdParam;

	// provide information about the user
	const state = store.getState();
	const userId = getUserId(state);

	// check for changes to avoid unnecessary store updates
	const userRoles = Roles.getRolesForUser(userId);

	if (JSON.stringify(userRoles) !== JSON.stringify(getUserRoles(state))) {
		dispatch(setUserRoles(userRoles));
	}

	const isLoading = getIsLoading(state);

	// check for login, logout, change of email verifiction status. Update record of user in state.auth if there is a change.
	const MeteorUserId = Meteor.user() ? Meteor.user()._id : undefined; // Meteor.userId() can load before Meteor.user(), causing a double update

	let numberOfPatterns = 0;
	let numberOfColorBooks = 0;
	let numberOfPatternImages = 0;

	if (Meteor.user()) {
		// change in the database must trigger a change in the numbers in the Redux store
		// check for change in number of patterns the user has created
		numberOfPatterns = Patterns.find({ 'createdBy': Meteor.userId() }).count();

		if (numberOfPatterns !== getNumberOfPatterns(state)) {
			dispatch(setNumberOfPatterns(numberOfPatterns));
		}

		// check for change in the number of color books the user has created
		numberOfColorBooks = ColorBooks.find({ 'createdBy': Meteor.userId() }).count();

		if (numberOfColorBooks !== getNumberOfColorBooks(state)) {
			dispatch(setNumberOfColorBooks(numberOfColorBooks));
		}
	}

	if (userId !== MeteorUserId) {
		dispatch(setUser(Meteor.user()));
	}
	const username = getUsername(store.getState());

	// provide information for any pattern page
	// using context allows us to send data to the page component and the Navbar with a single subscription
	if (location) {
		// Navbar always needs to know about user
		const values = {
			'allTags': [],
			'username': username,
		};

		const matchPattern = matchPath(location.pathname, {
			'path': '/pattern/:id',
			'exact': false,
			'strict': false,
		});

		const matchHome = matchPath(location.pathname, {
			'path': '/',
			'exact': false,
			'strict': false,
		});

		if (matchPattern) {
			// on any pattern route, page component and Navbar need pattern data
			patternIdParam = matchPattern.params.id;

			if (patternIdParam) {
				const handle = Meteor.subscribe('pattern', patternIdParam, {
					'onReady': () => {
						pattern = Patterns.findOne({ '_id': patternIdParam });

						// check pattern is found
						if (pattern) {
							const { createdBy } = pattern;

							Meteor.subscribe('users', [createdBy]);
							Meteor.subscribe('colorBooks', createdBy);
							Meteor.subscribe('patternImages', pattern._id);
							Meteor.subscribe('tags');
						}
					},
				});

				numberOfPatternImages = PatternImages.find({ 'patternId': patternIdParam }).count();

				if (numberOfPatternImages !== getNumberOfPatternImages(state)) {
					dispatch(setNumberOfPatternImages(numberOfPatternImages));
				}

				// we must find pattern here or the tracker doesn't update when the subscription is loaded
				pattern = Patterns.findOne({ '_id': patternIdParam });
	//console.log('tracker gets pattern again', pattern);
	//console.log('id', patternIdParam);
	//console.log('all patterns', Patterns.find().fetch());
				if (pattern) {
					values.colorBooks = ColorBooks.find({ 'createdBy': pattern.createdBy }, {
						'sort': { 'nameSort': 1 },
					}).fetch();
					values.createdByUser = Meteor.users.findOne({ '_id': pattern.createdBy });
					values.pattern = pattern;
					values.patternImages = PatternImages.find({ 'patternId': pattern._id }).fetch();
					values.allTags = Tags.find().fetch();

					// make sure full individual pattern data are loaded and the user who owns it
					// if you navigate from a user page, the pattern summary detail will already by loaded
					// but not the full details, causing an error
					// only dispatch the action if there will be a change
					// which can be because of switching to a different pattern
					if (isLoading && handle.ready()) {
						dispatch(setIsLoading(false));
					} else if (!isLoading && !handle.ready()) {
						dispatch(setIsLoading(true));
					}
				}
				values.patternId = patternIdParam; // passed separately in case pattern isn't found
			}
		}

		if (matchHome) {
			// console.log('home page');
			// it would be nice to pass data to Home page here
			// for consistency
			// however, Home needs component properties for pagination
			// to know what patterns to subscribe to
			// this could probably be done via Redux state
			// but the current code is DRY so leave it for now
		}

		return values;
	}
});

// put the database data into the provider as 'value', a magic property name
function ProviderInner({
	allTags,
	children,
	colorBooks,
	createdByUser,
	pattern,
	patternId,
	patternImages,
	username,
}) {
	return (
		<AppContext.Provider value={{
			allTags,
			colorBooks,
			createdByUser,
			pattern,
			patternId,
			patternImages,
			username,
		}}
		>
			{children}
		</AppContext.Provider>
	);
}

// all props are optional because they vary with route
ProviderInner.propTypes = {
	'allTags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'children': PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.arrayOf(PropTypes.element),
		PropTypes.node,
	]).isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any),
	'createdByUser': PropTypes.objectOf(PropTypes.any),
	'pattern': PropTypes.objectOf(PropTypes.any),
	'patternId': PropTypes.string,
	'patternImages': PropTypes.arrayOf(PropTypes.any),
	'username': PropTypes.string,
};

// withRouter gives us location
// connect gives us dispatch
export const DatabaseProvider = withRouter(connect()(withDatabase(ProviderInner)));
export const DatabaseConsumer = AppContext.Consumer;

export default App;
