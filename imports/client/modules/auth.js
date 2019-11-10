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

export const EMAIL_VERIFIED = 'EMAIL_VERIFIED';
export const EMAIL_NOT_VERIFIED = 'EMAIL_NOT_VERIFIED';

export const FORGOT_PASSWORD_EMAIL_SENT = 'FORGOT_PASSWORD_EMAIL_SENT';
export const FORGOT_PASSWORD_EMAIL_NOT_SENT = 'FORGOT_PASSWORD_EMAIL_NOT_SENT';

export const PASSWORD_RESET = 'PASSWORD_RESET';
export const PASSWORD_NOT_RESET = 'PASSWORD_NOT_RESET';

export const PASSWORD_CHANGED = 'PASSWORD_CHANGED';
export const PASSWORD_NOT_CHANGED = 'PASSWORD_NOT_CHANGED';

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

// UI feedback of email verification success
export function emailVerified() {
	return {
		'type': 'EMAIL_VERIFIED',
	};
}

export function emailNotVerified() {
	return {
		'type': 'EMAIL_NOT_VERIFIED',
	};
}

export const verifyEmail = (token) => (dispatch) => {
	dispatch(clearErrors());
	dispatch(emailNotVerified());

	Accounts.verifyEmail(token, (error) => {
		if (error) {
			return dispatch(logErrors({ 'verify email': error.reason }));
		}

		dispatch(emailVerified());
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

// reset password
export function passwordReset() {
	return {
		'type': 'PASSWORD_RESET',
	};
}

export function passwordNotReset() {
	return {
		'type': 'PASSWORD_NOT_RESET',
	};
}

export const resetPassword = ({ token, password }) => (dispatch) => {
	dispatch(clearErrors());
	dispatch(passwordNotReset());

	Accounts.resetPassword(token, password, (error) => {
		if (error) {
			return dispatch(logErrors({ 'reset password': error.reason }));
		}

		dispatch(passwordReset());
	});
};

// change password
export function passwordChanged() {
	return {
		'type': 'PASSWORD_CHANGED',
	};
}

export function passwordNotChanged() {
	return {
		'type': 'PASSWORD_NOT_CHANGED',
	};
}

export const changePassword = ({ oldPassword, newPassword }) => (dispatch) => {
	dispatch(clearErrors());
	dispatch(passwordNotReset());

	Accounts.changePassword(oldPassword, newPassword, (error) => {
		if (error) {
			return dispatch(logErrors({ 'change password': error.reason }));
		}

		dispatch(passwordChanged());
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
	'passwordChanged': false,
	'passwordReset': false,
	'verificationEmailSent': false,
	'emailVerified': false,
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

		case EMAIL_VERIFIED: {
			return updeep({ 'emailVerified': true }, state);
		}

		case EMAIL_NOT_VERIFIED: {
			return updeep({ 'emailVerified': false }, state);
		}

		case PASSWORD_RESET: {
			return updeep({ 'passwordReset': true }, state);
		}

		case PASSWORD_NOT_RESET: {
			return updeep({ 'passwordReset': false }, state);
		}

		case PASSWORD_CHANGED: {
			return updeep({ 'passwordChanged': true }, state);
		}

		case PASSWORD_NOT_CHANGED: {
			return updeep({ 'passwordChanged': false }, state);
		}

		default:
			return state;
	}
}
