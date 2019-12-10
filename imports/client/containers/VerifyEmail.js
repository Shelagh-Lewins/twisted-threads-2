// this is the page the user sees if they click a "verify email address" link in an email
// it retrieves a token from the url and attempts to verify the email address

import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { verifyEmail } from '../modules/auth';
import PageWrapper from '../components/PageWrapper';

class VerifyEmail extends Component {
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

	componentDidMount() {
		const { dispatch, token } = this.props;

		dispatch(verifyEmail(token));
	}

	onCloseFlashMessage() {
		// no action
	}

	render() {
		const { dispatch, emailVerified, errors } = this.props;

		let message = null;
		let onClick = this.onCloseFlashMessage;
		let type = null;

		if (emailVerified) {
			message = 'Your email address has been verified';
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
			/>
		);
	}
}

VerifyEmail.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'emailVerified': PropTypes.bool.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'token': PropTypes.string.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
	'emailVerified': state.auth.emailVerified,
	'errors': state.errors,
	'token': ownProps.match.params.token, // read the url parameter to find the token
});

export default connect(mapStateToProps)(VerifyEmail);
