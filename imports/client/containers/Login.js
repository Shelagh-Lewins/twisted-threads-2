import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { login } from '../modules/auth';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';
import LoginForm from '../components/LoginForm';

class Login extends Component {
	componentDidMount() {
		this.clearErrors();
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	handleSubmit = ({ user, password }) => {
		const { dispatch, history } = this.props;

		dispatch(login({
			user,
			password,
			history,
		}));
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const { errors } = this.props;

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
							<h1>Login</h1>
							<LoginForm
								handleSubmit={this.handleSubmit}
							/>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

Login.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
});

export default connect(mapStateToProps)(Login);
