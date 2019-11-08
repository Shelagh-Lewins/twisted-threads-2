// Actions for auth
// Using actions keeps the UI separated from the server.
import { logErrors, clearErrors } from './errors';
const updeep = require('updeep');

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const REGISTER = 'REGISTER';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';
export const VERIFICATION_EMAIL_SENT = 'VERIFICATION_EMAIL_SENT';
export const VERIFICATION_EMAIL_NOT_SENT = 'VERIFICATION_EMAIL_NOT_SENT';
export const FORGOT_PASSWORD_EMAIL_SENT = 'FORGOT_PASSWORD_EMAIL_SENT';
export const FORGOT_PASSWORD_EMAIL_NOT_SENT = 'FORGOT_PASSWORD_EMAIL_NOT_SENT';

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

export const register = ({
	email,
	username,
	password,
	history,
}) => (dispatch) => {
	dispatch(clearErrors());

	Accounts.createUser({ email, username, password }, (error) => {
		if (error) {
			return dispatch(logErrors({ 'register': error.reason }));
		}

		history.push('/welcome');
	});
};

// user can be email or username
export const login = ({ user, password, history }) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.loginWithPassword(user, password, (error) => {
		if (error) {
			return dispatch(logErrors({ 'login': error.reason }));
		}

		history.push('/');
	});
};

export const logout = (history) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.logout((error) => {
		if (error) {
			return dispatch(logErrors({ 'logout': error.reason }));
		}

		history.push('/');
	});
};

// ////////////////////////////////
// verification of email address

// allow UI feedback of email resend success
export function verificationEmailSent() {
	return {
		'type': 'VERIFICATION_EMAIL_SENT',
	};
}

export function verificationEmailNotSent() {
	return {
		'type': 'VERIFICATION_EMAIL_NOT_SENT',
	};
}

export const verifyEmail = (token, history) => (dispatch) => {
	dispatch(clearErrors());

	Accounts.verifyEmail(token, (error) => {
		if (error) {
			return dispatch(logErrors({ 'verify email': error.reason }));
		}

		history.push('/email-verified');
	});
};

export const sendVerificationEmail = (userId) => (dispatch) => {
	dispatch(clearErrors());
	dispatch(verificationEmailNotSent());

	Meteor.call('sendVerificationEmail', userId, (error) => {
		if (error) {
			return dispatch(logErrors({ 'send verification email': error.reason }));
		}
		dispatch(verificationEmailSent());
	});
};

// user forgot password
export function forgotPasswordEmailSent() {
	return {
		'type': 'FORGOT_PASSWORD_EMAIL_SENT',
	};
}

export function forgotPasswordEmailNotSent() {
	return {
		'type': 'FORGOT_PASSWORD_EMAIL_NOT_SENT',
	};
}

export const forgotPassword = (email) => (dispatch) => {
	dispatch(clearErrors());
	dispatch(forgotPasswordEmailNotSent());

	Accounts.forgotPassword(email, (error) => {
		if (error) {
			return dispatch(logErrors({ 'forgot password': error.reason }));
		}

		dispatch(forgotPasswordEmailSent());
	});
};

// ///////////////////////////
// Functions to provide info to UI

export function getUser() {
	return Meteor.user() || {};
}

export function getIsAuthenticated() {
	return Boolean(Meteor.userId());
}

// ///////////////////////////
// State

// default state
const initialAuthState = {
	'error': null,
	'forgotPasswordEmailSent': false,
	'verificationEmailSent': false,
};

// state updates
export default function auth(state = initialAuthState, action) {
	switch (action.type) {
		case FORGOT_PASSWORD_EMAIL_SENT: {
			return updeep({ 'forgotPasswordEmailSent': true }, state);
		}

		case FORGOT_PASSWORD_EMAIL_NOT_SENT: {
			return updeep({ 'forgotPasswordEmailSent': false }, state);
		}

		case VERIFICATION_EMAIL_SENT: {
			return updeep({ 'verificationEmailSent': true }, state);
		}

		case VERIFICATION_EMAIL_NOT_SENT: {
			return updeep({ 'verificationEmailSent': false }, state);
		}

		default:
			return state;
	}
}
