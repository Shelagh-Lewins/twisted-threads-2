import React, { Component } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import {
	getIsLoading,
	register,
	setIsLoading,
} from '../modules/auth';
import PageWrapper from '../components/PageWrapper';
import RegisterForm from '../forms/RegisterForm';
import Loading from '../components/Loading';

class Register extends Component {
	componentDidMount() {
		const { dispatch } = this.props;
		dispatch(setIsLoading(false));
	}

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
		const { dispatch, isLoading, errors } = this.props;

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<Container>
					{isLoading && <Loading />}
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
	'isLoading': PropTypes.bool.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
};

const mapStateToProps = (state) => ({
	'errors': state.errors,
	'isLoading': getIsLoading(state),
});

export default connect(mapStateToProps)(Register);
