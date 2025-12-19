// Shown after successful registration of a new user

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import {
	Container,
	Row,
	Col,
} from 'reactstrap';
import { connect } from 'react-redux';
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
	verificationEmailNotSent,
} from '../modules/auth';

class Welcome extends Component {
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

		dispatch(verificationEmailNotSent());
		dispatch(emailNotVerified());
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
		} = this.props;

		let message = null;
		let onClick = this.onCloseFlashMessage;
		let type = null;

		if (emailVerified) {
			message = FLASH_MESSAGE_TEXTS.emailVerified;
			onClick = this.onCloseFlashMessage;
			type = 'success';
		}

		let content = <p>Please log in to use Twisted Threads</p>;

		if (isAuthenticated) {
			if (isVerified) {
				content = <p>Your email address is verified. Go ahead and start using <Link to="/">Twisted Threads</Link>!</p>;
			} else {
				content = (
					<>
						<p>Your account has been created.</p>
						<p>Your username is <strong>{username}</strong>.</p>
						<p>An email containing a verification link has been sent to <strong>{userEmail}</strong>. Please click the link to verify your email address, or enter the verification code from the email in the box below. This will allow you to create more patterns and colour books.</p>
						<p>If you do not receive the email within a few minutes, please check your Junk or Spam folder.</p>
						<p>If the code has expired, or you did not receive the email, you can request a new verification email on your <Link to="/account">user account page</Link>.</p>
						<VerifyEmailForm
							dispatch={dispatch}
						/>
					</>
				);
			}
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
					<Row>
						<Col>
							<h2>Welcome to Twisted Threads</h2>
							{content}
						</Col>
					</Row>
				</Container>
			</PageWrapper>
		);
	}
}

Welcome.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'emailVerified': PropTypes.bool.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isVerified': PropTypes.bool.isRequired,
	'userEmail': PropTypes.string,
	'username': PropTypes.string,
};

const mapStateToProps = (state) => ({
	'emailVerified': state.auth.emailVerified,
	'errors': state.errors,
	'isAuthenticated': getIsAuthenticated(state),
	'isVerified': getIsVerified(state),
	'userEmail': getUserEmail(state),
	'username': getUsername(state),
});

export default connect(mapStateToProps)(Welcome);
