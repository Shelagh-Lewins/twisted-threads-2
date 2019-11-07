import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { Meteor } from 'meteor/meteor';
import PropTypes from 'prop-types';

import { isAuthenticated, user, login } from '../modules/auth';

class Login extends Component {
	handleSubmit = (event) => {
		event.preventDefault();

		const { dispatch, history } = this.props;

		dispatch(login({
			'email': this.email.value,
			'password': this.password.value,
			history,
		}));

		// Meteor.loginWithPassword(this.email.value, this.password.value);
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<h1>Login</h1>
				<label>
					Email
					<input
						type="email"
						ref={(email) => this.email = email}
					/>
				</label>
				<label>
					Password
					<input
						type="password"
						ref={(password) => this.password = password}
					/>
				</label>
				<input type="submit" value="Log in" />
			</form>
		);
	}
}

Login.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
};

export default connect()(Login);
