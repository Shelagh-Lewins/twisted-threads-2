import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { forgotPassword } from '../modules/auth';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';
import ForgotPasswordForm from '../components/ForgotPasswordForm';

class ForgotPassword extends Component {
	componentDidMount() {
		this.clearErrors();
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	handleSubmit = ({ email }) => {
		const { dispatch } = this.props;

		dispatch(forgotPassword({
			email,
		}));
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const { errors, forgotPasswordEmailSent } = this.props;

		return (
			<div>
				<Container>
					<Row>
						<Col lg="12">
							{forgotPasswordEmailSent && (
								<FlashMessage
									message="A reset password email has been sent"
									type="success"
									onClick={this.onCloseFlashMessage}
								/>
							)}
						</Col>
					</Row>
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
							<h1>Forgot your password?</h1>
							<p>Enter your email address and a reset password email will be sent to you</p>
							<ForgotPasswordForm
								handleSubmit={this.handleSubmit}
							/>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

ForgotPassword.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
	'forgotPasswordEmailSent': state.auth.forgotPasswordEmailSent,
});

export default connect(mapStateToProps)(ForgotPassword);
