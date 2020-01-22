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

import PageWrapper from '../components/PageWrapper';
import {
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
	}

	onSendVerificationEmail() {
		const { dispatch, history } = this.props;

		dispatch(sendVerificationEmail(Meteor.userId(), history));
	}

	render() {
		const {
			dispatch,
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
			message = 'Verification email has been sent';
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
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isVerified': PropTypes.bool.isRequired,
	'userEmail': PropTypes.string,
	'username': PropTypes.string,
	'verificationEmailSent': PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
	'isAuthenticated': getIsAuthenticated(state),
	'isVerified': getIsVerified(state),
	'userEmail': getUserEmail(state),
	'username': getUsername(state),
	'verificationEmailSent': state.auth.verificationEmailSent,
});

export default connect(mapStateToProps)(Account);
