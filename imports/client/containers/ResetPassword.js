import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { passwordNotReset, resetPassword } from '../modules/auth';

import PageWrapper from '../components/PageWrapper';
import ResetPasswordForm from '../components/ResetPasswordForm';

class ResetPassword extends Component {
	onCloseFlashMessage() {
		const { dispatch } = this.props;

		dispatch(passwordNotReset());
	}

	handleSubmit = ({ password }) => {
		const { dispatch, token } = this.props;

		dispatch(resetPassword({
			token,
			password,
		}));
	}

	render() {
		const { dispatch, errors, passwordReset } = this.props;

		let message = null;
		let onClick = this.onCloseFlashMessage;
		let type = null;

		if (passwordReset) {
			message = 'Your password has been reset';
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
							<h1>Reset your password</h1>
							<ResetPasswordForm
								handleSubmit={this.handleSubmit}
							/>
						</Col>
					</Row>
				</Container>
			</PageWrapper>
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
