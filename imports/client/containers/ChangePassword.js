import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { changePassword } from '../modules/auth';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';
import ChangePasswordForm from '../components/ChangePasswordForm';

class ChangePassword extends Component {
	componentDidMount() {
		this.clearErrors();
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	handleSubmit = ({ newPassword, oldPassword }) => {
		const { dispatch } = this.props;

		dispatch(changePassword({
			newPassword,
			oldPassword,
		}));
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const { errors, passwordChanged } = this.props;
		let showFlashMessage = false;
		let message;
		let type;

		if (!isEmpty(errors)) {
			showFlashMessage = true;
			message = formatErrorMessages(errors);
			type = 'error';
		} else if (passwordChanged) {
			showFlashMessage = true;
			message = 'Your password has been changed';
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
					<Row>
						<Col lg="12">
							<h1>Change your password</h1>
							<ChangePasswordForm
								handleSubmit={this.handleSubmit}
							/>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

ChangePassword.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'passwordChanged': PropTypes.bool.isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
	'passwordChanged': state.auth.passwordChanged,
});

export default connect(mapStateToProps)(ChangePassword);
