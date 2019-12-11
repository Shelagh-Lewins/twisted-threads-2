import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { register } from '../modules/auth';
import PageWrapper from '../components/PageWrapper';
import RegisterForm from '../forms/RegisterForm';

class Register extends Component {
	handleSubmit = ({ email, username, password }) => {
		const { dispatch, history } = this.props;

		dispatch(register({
			email,
			username,
			password,
			history,
		}));
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
							<h1>Create an account</h1>
							<RegisterForm
								handleSubmit={this.handleSubmit}
							/>
						</Col>
					</Row>
				</Container>
			</PageWrapper>
		);
	}
}

Register.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
});

export default connect(mapStateToProps)(Register);
