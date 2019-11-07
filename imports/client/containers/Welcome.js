// Shown after successful registration of a new user

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link, withRouter } from 'react-router-dom';

import { getIsAuthenticated } from '../modules/auth';

class Welcome extends Component {
	constructor() {
		super();
		this.state = {
			'errors': {},
		};
	}

	componentDidMount() {
		const { isAuthenticated, history } = this.props;
		if (isAuthenticated) {
			history.push('/'); // if logged in, redirect to Home
		}
	}

	componentDidUpdate(prevProps) {
		const { isAuthenticated, history } = this.props;
		if (isAuthenticated) {
			history.push('/'); // if logged in, redirect to Home
		}
	}

	render() {
		return (
			<div>
				<h2>Welcome to the Demo App</h2>
				<p>Your account has been created.</p>
				<p>To create patterns, you will need to verify your email address. An email containing a verification link has been sent to the email address with which you registered. Please click the link to verify your email address.</p>
				<p>If you do not receive the email within a few minutes, please check your Junk or Spam folder.</p>
				<p>You can request a new registration email by <Link to="/login">Logging in</Link> and going to your user account (click your username in the header bar).</p>
			</div>
		);
	}
}

Welcome.propTypes = {
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
	'location': ownProps.location,
});

// required to make checks of user status reactive
const Tracker = withTracker(() => {
	return {
		'isAuthenticated': getIsAuthenticated(),
	};
})(Welcome);

export default withRouter(connect(mapStateToProps)(Tracker));
