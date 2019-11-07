import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { login } from '../modules/auth';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';

class Login extends Component {
	onCloseFlashMessage = () => {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	handleSubmit = (event) => {
		event.preventDefault();

		const { dispatch, history } = this.props;

		dispatch(login({
			'user': this.user.value,
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
				<h1>Login</h1>
				<label>
					Email or Username
					<input
						type="text"
						ref={(user) => this.user = user}
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
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
});

export default connect(mapStateToProps)(Login);
