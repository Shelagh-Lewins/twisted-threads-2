import React, { Component } from 'react';
import { connect } from 'react-redux';
// import { Accounts } from 'meteor/accounts-base';
import PropTypes from 'prop-types';

import { isAuthenticated, user, register } from '../modules/auth';

class Register extends Component {
	handleSubmit = (event) => {
		event.preventDefault();

		const { dispatch, history } = this.props;

		dispatch(register({
			'email': this.email.value,
			'username': this.username.value,
			'password': this.password.value,
			history,
		}));
	}

	render() {
		return (
			<form onSubmit={this.handleSubmit}>
				<h1>Register</h1>
				<label>
					Email
					<input
						type="email"
						ref={(email) => this.email = email}
					/>
				</label>
				<label>
					Username
					<input
						type="text"
						ref={(username) => this.username = username}
					/>
				</label>
				<label>
					Password
					<input
						type="password"
						ref={(password) => this.password = password}
					/>
				</label>
				<input type="submit" value="Create an account" />
			</form>
		);
	}
}

Register.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
});

export default connect(mapStateToProps)(Register);
