import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from '../modules/store';

import Navbar from '../components/Navbar';
import Login from './Login';
import Register from './Register';
import Welcome from './Welcome';
import Account from './Account';
import VerifyEmail from './VerifyEmail';
import EmailVerified from './EmailVerified';
import ForgotPassword from './ForgotPassword';
import Home from './Home';
import Pattern from './Pattern';
import DevTools from '../components/DevTools';
import './App.scss';

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
						<Route exact path="/email-verified" component={EmailVerified} />
						<Route exact path="/forgot-password" component={ForgotPassword} />
						<Route exact path="/" component={Home} />
						<Route exact path="/pattern/:id" component={Pattern} />
					</div>
				</div>
			</Router>
		</Provider>
	);
}

export default App;
