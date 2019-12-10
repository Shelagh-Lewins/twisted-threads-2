import React, { Component } from 'react';
import {
	Button,
	Container,
	Row,
	Col,
} from 'reactstrap';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import PageWrapper from '../components/PageWrapper';
import {
	getIsAuthenticated,
	getIsVerified,
	getUser,
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
		const { dispatch, user, history } = this.props;

		dispatch(sendVerificationEmail(user._id, history));
	}

	render() {
		const {
			dispatch,
			errors,
			user,
			verificationEmailSent,
		} = this.props;

		let emailStatus;
		if (user.emails) {
			emailStatus = getIsVerified()
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
					{getIsAuthenticated() && (
						<>
							<Row>
								<Col lg="12">
									<h1>Account: {user.username}</h1>
								</Col>
							</Row>
							<Row>
								<Col lg="12">
									{user.emails && <p>Email address: {user.emails[0].address}</p>}
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
					{!getIsAuthenticated() && 'Log in to access this page'}
				</Container>
			</PageWrapper>
		);
	}
}

Account.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'user': PropTypes.objectOf(PropTypes.any).isRequired,
	'verificationEmailSent': PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
	'verificationEmailSent': state.auth.verificationEmailSent,
});

// withTracker makes checks of user status reactive
const Tracker = withTracker(() => ({
	'user': getUser(),
}))(Account);

export default withRouter(connect(mapStateToProps)(Tracker));
