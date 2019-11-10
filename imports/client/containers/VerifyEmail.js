// this is the page the user sees if they click a "verify email address" link in an email
// it retrieves a token from the url and attempts to verify the email address

import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import { verifyEmail } from '../modules/auth';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';

class VerifyEmail extends Component {
	componentDidMount() {
		const { dispatch, token } = this.props;
		this.clearErrors();

		dispatch(verifyEmail(token));
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const { emailVerified, errors } = this.props;

		let showFlashMessage = false;
		let message;
		let type;

		if (!isEmpty(errors)) {
			showFlashMessage = true;
			message = formatErrorMessages(errors);
			type = 'error';
		} else if (emailVerified) {
			showFlashMessage = true;
			message = 'Your email address has been verified';
			type = 'success';
		}

		return (
			<div>
				<Container>
					{showFlashMessage && (
						<Row>
							<Col lg="12">
								<FlashMessage
									message={message}
									type={type}
									onClick={this.onCloseFlashMessage}
								/>
							</Col>
						</Row>
					)}
					{!showFlashMessage && (
						<Row>
							<Col lg="12">
								<p>Verifying email address...</p>
							</Col>
						</Row>
					)}
				</Container>
			</div>
		);
	}
}

VerifyEmail.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'emailVerified': PropTypes.bool.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'token': PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
	'emailVerified': state.auth.emailVerified,
	'errors': state.errors,
	'token': ownProps.match.params.token, // read the url parameter to find the token
});

export default connect(mapStateToProps)(VerifyEmail);
