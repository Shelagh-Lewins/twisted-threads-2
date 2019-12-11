import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { forgotPassword, forgotPasswordEmailNotSent } from '../modules/auth';
import PageWrapper from '../components/PageWrapper';
import ForgotPasswordForm from '../forms/ForgotPasswordForm';

class ForgotPassword extends Component {
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

		dispatch(forgotPasswordEmailNotSent());
	}

	handleSubmit = ({ email }) => {
		const { dispatch } = this.props;

		dispatch(forgotPassword({
			email,
		}));
	}

	render() {
		const {
			dispatch,
			errors,
			forgotPasswordEmailSent,
		} = this.props;

		let message = null;
		let onClick = this.onCloseFlashMessage;
		let type = null;

		if (forgotPasswordEmailSent) {
			message = 'A reset password email has been sent';
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
			</PageWrapper>
		);
	}
}

ForgotPassword.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'forgotPasswordEmailSent': PropTypes.bool.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
	'forgotPasswordEmailSent': state.auth.forgotPasswordEmailSent,
});

export default connect(mapStateToProps)(ForgotPassword);
