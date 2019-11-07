import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { register } from '../modules/auth';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';

class Register extends Component {
	onCloseFlashMessage = () => {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

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
		const { errors } = this.props;

		return (
			<form onSubmit={this.handleSubmit}>
				{!isEmpty(errors) && (
					<FlashMessage
						message={formatErrorMessages(errors)}
						type="error"
						onClick={this.onCloseFlashMessage}
					/>
				)}
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
