// Actions for auth
// Using actions keeps the UI separated from the server.
import { logErrors, clearErrors } from './errors';
import { MAX_RECENTS } from '../../modules/parameters';

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

export const SET_USER_CAN_CREATE_COLOR_BOOK = 'SET_USER_CAN_CREATE_COLOR_BOOK';
export const SET_USER_CAN_CREATE_PATTERN = 'SET_USER_CAN_CREATE_PATTERN';
export const SET_USER_CAN_ADD_PATTERN_IMAGE = 'SET_USER_CAN_ADD_PATTERN_IMAGE';

// ///////////////////////////
// Action that call Meteor methods; these may not change the Store but are located here in order to keep server interactions away from UI

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

	Meteor.call('auth.sendVerificationEmail', userId, (error) => {
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
		// different failure cases provide different types of error
		// not logged in provides message
		// incorrect password provides reason

		if (error) {
			const message = error.reason || error.message;
			return dispatch(logErrors({ 'change password': message }));
		}

		dispatch(passwordChanged());
	});
};

// user permissions
// color book
export function setUserCanCreateColorBook(result) {
	return {
		'type': 'SET_USER_CAN_CREATE_COLOR_BOOK',
		'payload': result,
	};
}

export const checkUserCanCreateColorBook = () => (dispatch) => {
	// clearErrors here causes an infinite loop of onReady

	Meteor.call('auth.checkUserCanCreateColorBook', (error, result) => {
		if (error) {
			dispatch(setUserCanCreateColorBook(false));
			return dispatch(logErrors({ 'check-create-color-book': error.reason }));
		}

		dispatch(setUserCanCreateColorBook(true));
	});
};

// pattern
export function setUserCanCreatePattern(result) {
	return {
		'type': 'SET_USER_CAN_CREATE_PATTERN',
		'payload': result,
	};
}

export const checkUserCanCreatePattern = () => (dispatch) => {
	Meteor.call('auth.checkUserCanCreatePattern', (error, result) => {

		if (error) {

			dispatch(setUserCanCreatePattern(false));
			return dispatch(logErrors({ 'check-create-pattern': error.reason }));
		}

		dispatch(setUserCanCreatePattern(true));
	});
};

// pattern image
export function setUserCanAddPatternImage(result) {
	return {
		'type': 'SET_USER_CAN_ADD_PATTERN_IMAGE',
		'payload': result,
	};
}

export const checkUserCanAddPatternImage = ({ patternId }) => (dispatch) => {
	Meteor.call('auth.checkUserCanAddPatternImage', { patternId }, (error, result) => {
		if (error) {
			dispatch(setUserCanAddPatternImage(false));
			return dispatch(logErrors({ 'check-add-pattern-image': error.reason }));
		}
		dispatch(setUserCanAddPatternImage(true));
	});
};

// ///////////////////////////
// record a recently viewed pattern, with weaving chart row if the user has been weaving
export function addRecentPattern({ currentWeavingRow, patternId }) {
	if (!Meteor.user()) {
		return () => {};
	}

	const newRecentPatterns = updateRecentPatterns({ currentWeavingRow, patternId });
	return () => {
		Meteor.call('auth.setRecentPatterns', { newRecentPatterns, 'userId': Meteor.userId(), patternId });
	};
}

// ///////////////////////////
// update recent patterns. We want to avoid duplicates, and put the most recently edited pattern at the end of the array.
// Mongo doesn't support the required array operations (update multiple) so it's necessary to loop over the array to ensure no duplicates.
// Better to do this work on the client
export function updateRecentPatterns({ currentWeavingRow, patternId }) {
	// ensure the recent patterns list exists
	if (!Meteor.user()) {
		return;
	}

	const currentRecentPatterns = Meteor.user().profile.recentPatterns || [];

	const newRecentPatterns = [];

	// construct the new entry
	const newEntry = {
		patternId,
		'updatedAt': new Date(),
	};

	// find existing entry, if any
	const thisRecentPattern = currentRecentPatterns.find((recentPattern) => recentPattern.patternId === patternId);

	// capture currentWeavingRow from existing entry
	if (typeof currentWeavingRow !== 'undefined') { // the user is on the Interactive Weaving Chart
		newEntry.currentWeavingRow = currentWeavingRow;
	} else if (thisRecentPattern && typeof thisRecentPattern.currentWeavingRow !== 'undefined') { // preserve a previous value, the user may be on the Pattern page
		newEntry.currentWeavingRow = thisRecentPattern.currentWeavingRow;
	}

	// exclude any existing entry for this pattern
	currentRecentPatterns.forEach((entry) => {
		if (entry.patternId !== patternId) {
			newRecentPatterns.push(entry);
		}
	});

	// newest entry goes at the start of the array
	newRecentPatterns.unshift(newEntry);

	// if we've reached the limit of how many recents to store
	// remove the oldest
	if (newRecentPatterns.length > MAX_RECENTS) {
		newRecentPatterns.pop();
	}

	return newRecentPatterns;
}


// Provide info to UI

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
	'isLoading': true,
	'passwordChanged': false,
	'passwordReset': false,
	'userCanCreateColorBook': false,
	'userCanCreatePattern': false,
	'userCanAddPatternImage': false,
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

		case SET_USER_CAN_CREATE_COLOR_BOOK: {
			return updeep({ 'userCanCreateColorBook': action.payload }, state);
		}

		case SET_USER_CAN_CREATE_PATTERN: {
			return updeep({ 'userCanCreatePattern': action.payload }, state);
		}

		case SET_USER_CAN_ADD_PATTERN_IMAGE: {
			return updeep({ 'userCanAddPatternImage': action.payload }, state);
		}

		default:
			return state;
	}
}
