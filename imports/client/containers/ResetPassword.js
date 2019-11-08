import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { resetPassword } from '../modules/auth';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';
import ResetPasswordForm from '../components/ResetPasswordForm';

class ResetPassword extends Component {
	componentDidMount() {
		this.clearErrors();
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	handleSubmit = ({ password }) => {
		const { dispatch, token } = this.props;

		dispatch(resetPassword({
			token,
			password,
		}));
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const { errors, passwordReset } = this.props;
		let showFlashMessage = false;
		let message;
		let type;

		if (!isEmpty(errors)) {
			showFlashMessage = true;
			message = formatErrorMessages(errors);
			type = 'error';
		} else if (passwordReset) {
			showFlashMessage = true;
			message = 'Your password has been reset';
			type = 'success';
		}

		return (
			<div>
				<Container>
					<Row>
						<Col lg="12">
							{showFlashMessage && (
								<FlashMessage
									message={message}
									type={type}
									onClick={this.onCloseFlashMessage}
								/>
							)}
						</Col>
					</Row>
					<Row>
						<Col lg="12">
							<h1>Reset your password</h1>
							<ResetPasswordForm
								handleSubmit={this.handleSubmit}
							/>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

ResetPassword.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'passwordReset': PropTypes.bool.isRequired,
	'token': PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
	'errors': state.errors,
	'passwordReset': state.auth.passwordReset,
	'token': ownProps.match.params.token, // read the url parameter to find the token
});

export default connect(mapStateToProps)(ResetPassword);
