import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
// fontawesome
import { library } from '@fortawesome/fontawesome-svg-core';
import {
	// faPencilAlt,
	// faQuestionCircle,
	// faBell,
	// faUser,
	// faFileDownload,
	faBookOpen,
	faLock,
	faLockOpen,
	faTrash,
} from '@fortawesome/free-solid-svg-icons'; // import the icons you want
import store from '../modules/store';

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
import InteractiveWeavingChartPage from './InteractiveWeavingChartPage';
import DevTools from '../components/DevTools';
import './App.scss';

library.add(
	faBookOpen,
	faLock,
	faLockOpen,
	faTrash,
); // and add them to your library

function App() {
	return (
		<Provider store={store}>
			<Router>
				<div className="app-container">
					<Navbar />
					<div className="main-container">
						<DevTools />
						<Route exact path="/login" component={Login} />
						<Route exact path="/register" component={Register} />
						<Route exact path="/welcome" component={Welcome} />
						<Route exact path="/account" component={Account} />
						<Route exact path="/verify-email/:token" component={VerifyEmail} />
						<Route exact path="/change-password" component={ChangePassword} />
						<Route exact path="/forgot-password" component={ForgotPassword} />
						<Route exact path="/reset-password/:token" component={ResetPassword} />
						<Route exact path="/" component={Home} />
						<Route exact path="/pattern/:id" component={Pattern} />
						<Route exact path="/pattern/:id/weaving" component={InteractiveWeavingChartPage} />
						<Route exact path="/user/:id" component={User} />
					</div>
				</div>
			</Router>
		</Provider>
	);
}

export default App;
