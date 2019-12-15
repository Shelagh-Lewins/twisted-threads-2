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
	faTrash,
} from '@fortawesome/free-solid-svg-icons'; // import the icons you want
import { withTracker } from 'meteor/react-meteor-data';
import { ColorBooks, Patterns } from '../../modules/collection';
import store from '../modules/store';
import { getIsAuthenticated, getIsVerified, getUser } from '../modules/auth';
import { setIsLoading } from '../modules/pattern';
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
			<Route exact path="/pattern/:id/:tab(design|description)?" component={Pattern} />
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

export const withDatabase = withTracker(({ dispatch, location }) => {
	let pattern = {};
	let createdBy;
	let patternIdParam;

	dispatch(setIsLoading(true));

	// provide information for any pattern page
	if (location) {
		const match = matchPath(location.pathname, {
			'path': '/pattern/:id',
			'exact': false,
			'strict': false,
		});

		if (match) {
			patternIdParam = match.params.id;

			if (patternIdParam) {
				Meteor.subscribe('pattern', patternIdParam, {
					'onReady': () => {
						pattern = Patterns.findOne({ '_id': patternIdParam }) || {}; // in case pattern doesn't exist or cannot be viewed

						createdBy = pattern.createdBy;
						Meteor.subscribe('users', [createdBy], {
							'onReady': () => dispatch(setIsLoading(false)),
						});
					},
				});

				Meteor.subscribe('colorBooks');
			}
		}
	}

	pattern = Patterns.findOne({ '_id': patternIdParam }) || {};

	return {
		'colorBooks': ColorBooks.find({}, {
			'sort': { 'nameSort': 1 },
		}).fetch(),
		// 'createdBy': pattern.createdBy,
		'createdByUser': Meteor.users.findOne({ '_id': createdBy }),
		'isAuthenticated': getIsAuthenticated(),
		'pattern': pattern,
		'patternId': pattern._id, // passed separately from URL in case pattern doesn't exist
		'username': getUser().username,
		'verified': getIsVerified(),
	};
});

// put the database data into the provider as 'value', a magic property name
function ProviderInner({
	children,
	colorBooks,
	createdByUser,
	isAuthenticated,
	pattern,
	username,
	verified,
}) {
	return (
		<AppContext.Provider value={{
			colorBooks,
			createdByUser,
			isAuthenticated,
			pattern,
			'patternId': pattern._id,
			username,
			verified,
		}}
		>
			{children}
		</AppContext.Provider>
	);
}

ProviderInner.propTypes = {
	'children': PropTypes.oneOfType([
		PropTypes.element,
		PropTypes.arrayOf(PropTypes.element),
		PropTypes.node,
	]).isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any),
	'createdByUser': PropTypes.objectOf(PropTypes.any),
	'isAuthenticated': PropTypes.bool.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any),
	'username': PropTypes.string,
	'verified': PropTypes.bool.isRequired,
};

// const mapStateToProps = (state, ownProps) => ({
	// 'location': ownProps.location,
// });

// withRouter gives us location
// connect gives us dispatch
export const DatabaseProvider = withRouter(connect()(withDatabase(ProviderInner)));
export const DatabaseConsumer = AppContext.Consumer;

export default App;
