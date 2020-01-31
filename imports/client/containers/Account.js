import React, { Component } from 'react';
import {
	Button,
	Container,
	Row,
	Col,
} from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { FLASH_MESSAGE_TEXTS } from '../../modules/parameters';

import PageWrapper from '../components/PageWrapper';
import VerifyEmailForm from '../forms/VerifyEmailForm';
import {
	emailNotVerified,
	getIsAuthenticated,
	getIsVerified,
	getUserEmail,
	getUsername,
	logout,
	sendVerificationEmail,
	verificationEmailNotSent,
} from '../modules/auth';

class Account extends Component {
	constructor() {
		super();

		// bind onClick functions to provide context
		const functionsToBind = [
			'onCloseFlashMessage',
			'onLogout',
			'onSendVerificationEmail',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	onLogout(e) {
		e.preventDefault();

		const { dispatch, history } = this.props;

		dispatch(logout(history));
	}

	onCloseFlashMessage() {
		const { dispatch } = this.props;

		dispatch(verificationEmailNotSent());
		dispatch(emailNotVerified());
	}

	onSendVerificationEmail() {
		const { dispatch, history } = this.props;

		dispatch(sendVerificationEmail(Meteor.userId(), history));
	}

	render() {
		const {
			dispatch,
			emailVerified,
			errors,
			isAuthenticated,
			isVerified,
			userEmail,
			username,
			verificationEmailSent,
		} = this.props;

		let emailStatus;
		if (userEmail) {
			emailStatus = isVerified
				? <div><p>Status: verified</p></div>
				: (
					<div>
						<p>Status: unverified</p>
						<p>To create more patterns and colour books, please verify your email address using the code from the verification email that was sent to you.</p>
						<VerifyEmailForm
							dispatch={dispatch}
						/>
						<br />
						<p>If the code has expired, or you did not receive the email, you can request a new verification email by clicking the button below:</p>
						<p>
							<Button
								type="button"
								color="primary"
								onClick={this.onSendVerificationEmail}
							>
							Resend verification email
							</Button>
						</p>
					</div>
				);
		}

		let message = null;
		let onClick = this.onCloseFlashMessage;
		let type = null;

		if (verificationEmailSent) {
			message = 'Verification email has been re-sent. If you do not receive the email within a few minutes, please check your Junk or Spam folder.';
			onClick = this.onCloseFlashMessage;
			type = 'success';
		} else if (emailVerified) {
			message = FLASH_MESSAGE_TEXTS.emailVerified;
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
						<>
							<Row>
								<Col lg="12">
									<h1>Account: {username}</h1>
									<p>Your <Link to={`/user/${Meteor.userId()}`}>user page</Link> shows all your patterns and colour books.</p>
									<hr />
								</Col>
							</Row>
							<Row>
								<Col lg="12">
									{userEmail && <p>Email address: {userEmail}</p>}
									{emailStatus}
									<hr />
								</Col>
							</Row>
							<Row>
								<Col lg="12">
									<p><Link to="change-password">Change password</Link></p>
									<hr />
								</Col>
							</Row>
							<Row>
								<Col lg="12">
									<p>
										<Button
											type="button"
											color="danger"
											onClick={this.onLogout}
										>
										Logout
										</Button>
									</p>
								</Col>
							</Row>
						</>
					)}
					{!isAuthenticated && 'Log in to access this page'}
				</Container>
			</PageWrapper>
		);
	}
}

Account.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'emailVerified': PropTypes.bool.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isVerified': PropTypes.bool.isRequired,
	'userEmail': PropTypes.string,
	'username': PropTypes.string,
	'verificationEmailSent': PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	'emailVerified': state.auth.emailVerified,
	'errors': state.errors,
	'isAuthenticated': getIsAuthenticated(state),
	'isVerified': getIsVerified(state),
	'userEmail': getUserEmail(state),
	'username': getUsername(state),
	'verificationEmailSent': state.auth.verificationEmailSent,
});

export default connect(mapStateToProps)(Account);
