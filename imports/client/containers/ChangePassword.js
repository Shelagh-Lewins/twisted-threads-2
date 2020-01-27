import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
	changePassword,
	getIsAuthenticated,
	passwordNotChanged,
} from '../modules/auth';
import PageWrapper from '../components/PageWrapper';
import ChangePasswordForm from '../forms/ChangePasswordForm';

class ChangePassword extends Component {
	constructor() {
		super();

		// bind onClick functions to provide context
		const functionsToBind = [
			'onCloseFlashMessage',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	onCloseFlashMessage() {
		const { dispatch } = this.props;

		dispatch(passwordNotChanged());
	}

	handleSubmit = ({ newPassword, oldPassword }, { resetForm }) => {
		const { dispatch } = this.props;

		dispatch(changePassword({
			newPassword,
			oldPassword,
		}));
		resetForm();
	}

	render() {
		const {
			dispatch,
			errors,
			isAuthenticated,
			passwordChanged,
		} = this.props;

		let message = null;
		let onClick = this.onCloseFlashMessage;
		let type = null;

		if (passwordChanged) {
			message = 'Your password has been changed';
			onClick = this.onCloseFlashMessage;
			type = 'success';
		}

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
				message={message}
				onClick={onClick}
				type={type}
			>
				<Container>
					{isAuthenticated && (
						<Row>
							<Col lg="12">
								<h1>Change your password</h1>
								<ChangePasswordForm
									handleSubmit={this.handleSubmit}
								/>
							</Col>
						</Row>
					)}
					{!isAuthenticated && 'Log in to access this page'}
				</Container>
			</PageWrapper>
		);
	}
}

ChangePassword.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'passwordChanged': PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
	'isAuthenticated': getIsAuthenticated(state),
	'passwordChanged': state.auth.passwordChanged,
});

export default connect(mapStateToProps)(ChangePassword);
