import React, { Component } from 'react';
import { Button, Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';

import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import { getUser, sendVerificationEmail } from '../modules/auth';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';

class Account extends Component {
	constructor() {
		super();

		this.onSendVerificationEmail = this.onSendVerificationEmail.bind(this);
	}

	componentDidMount() {
		this.clearErrors();
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	onSendVerificationEmail() {
		const { dispatch, user, history } = this.props;

		dispatch(sendVerificationEmail(user._id, history));
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const { errors, user, verificationEmailSent } = this.props;

		let emailStatus;
		if (user.emails) {
			const { verified } = user.emails[0];

			emailStatus = verified
				? <div><p>Status: verified</p></div>
				: (
					<div>
						<p>Status: unverified</p>
						<Button
							type="button"
							color="primary"
							onClick={this.onSendVerificationEmail}
						>Resend verification email
						</Button>
					</div>
				);
		}

		return (
			<div>
				<Container>
					<Row>
						<Col lg="12">
							{!isEmpty(errors) && (
								<FlashMessage
									message={formatErrorMessages(errors)}
									type="error"
									onClick={this.onCloseFlashMessage}
								/>
							)}
						</Col>
					</Row>
					<Row>
						<Col lg="12">
							{verificationEmailSent && (
								<FlashMessage
									message="Verification email has been sent"
									type="success"
									onClick={this.onCloseFlashMessage}
								/>
							)}
						</Col>
					</Row>
					<Row>
						<Col lg="12">
							<h1>Account: {user.username}</h1>
							{user.emails && <p>Email address: {user.emails[0].address}</p>}
							{emailStatus}
						</Col>
					</Row>
				</Container>
			</div>
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
