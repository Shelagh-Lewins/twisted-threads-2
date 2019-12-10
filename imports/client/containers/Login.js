import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { login } from '../modules/auth';
import { clearErrors } from '../modules/errors';
import PageWrapper from '../components/PageWrapper';
import LoginForm from '../components/LoginForm';

class Login extends Component {
	componentDidMount() {
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
		const { dispatch, errors } = this.props;

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<Container>
					<Row>
						<Col lg="12">
							<h1>Login</h1>
							<LoginForm
								handleSubmit={this.handleSubmit}
							/>
						</Col>
					</Row>
					<Row>
						<Col lg="12">
							<Link to="forgot-password">Forgot password?</Link>
						</Col>
					</Row>
				</Container>
			</PageWrapper>
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
