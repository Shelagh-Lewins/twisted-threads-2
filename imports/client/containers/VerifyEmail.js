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
		const { dispatch, history, token } = this.props;
		this.clearErrors();

		dispatch(verifyEmail(token, history));
	}

	onCloseFlashMessage() {
		this.clearErrors();
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
							<p>Verifying email address...</p>
						</Col>
					</Row>
				</Container>
			</div>
		);
	}
}

VerifyEmail.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'token': PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
	'errors': state.errors,
	'token': ownProps.match.params.token, // read the url parameter to find the token
});

export default connect(mapStateToProps)(VerifyEmail);
