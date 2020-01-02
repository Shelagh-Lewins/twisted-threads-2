// Actions for auth
// Using actions keeps the UI separated from the server.
import { createSelector } from 'reselect';
import { logErrors, clearErrors } from './errors';
import {
	MAX_RECENTS,
	ROLE_LIMITS,
} from '../../modules/parameters';

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
// export const SET_USER_CAN_CREATE_PATTERN = 'SET_USER_CAN_CREATE_PATTERN';
export const SET_USER_CAN_ADD_PATTERN_IMAGE = 'SET_USER_CAN_ADD_PATTERN_IMAGE';

export const SET_USER = 'SET_USER';
export const SET_NUMBER_OF_PATTERNS = 'SET_NUMBER_OF_PATTERNS';

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
	Meteor.call('auth.checkUserCanCreateColorBook', (error, result) => {
		if (error) {
			dispatch(setUserCanCreateColorBook(false));
			return dispatch(logErrors({ 'check-create-color-book': error.reason }));
		}

		dispatch(setUserCanCreateColorBook(result.value));
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
		dispatch(setUserCanAddPatternImage(result.value));
	});
};

// track user status
export function setUser(result) {
	return {
		'type': 'SET_USER',
		'payload': result,
	};
}

export function setNumberOfPatterns(result) {
	return {
		'type': 'SET_NUMBER_OF_PATTERNS',
		'payload': result,
	};
}

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
// Selectors
//TODO
// checkUserCanCreateColorBook
// checkUserCanCreatePattern
// checkUserCanAddPatternImage
// use selectors
// remove all methods and actions

const getUser = (state) => state.auth.user;

export const getUserId = createSelector(
	[getUser],
	(user) => {
		if (user) {
			return user._id;
		}
		return undefined;
	},
);

export const getUsername = createSelector(
	[getUser],
	(user) => {
		if (user) {
			return user.username;
		}
		return undefined;
	},
);

export const getNumberOfPatterns = (state) => state.auth.numberOfPatterns;

export const getUserRoles = createSelector(
	[getUserId],
	(userId) => {
		if (!userId) {
			return [];
		}

		return Roles.getRolesForUser(userId);
	},
);

export const getIsAuthenticated = createSelector(
	[getUserId],
	(userId) => Boolean(userId),
);

// is the user logged in AND has a verified email address?
// used on Accounts page to show resend verification email link
export const getIsVerified = createSelector(
	[getUser],
	(user) => {
		if (!user) {
			return false;
		}

		if (!user.emails[0]) {
			return false;
		}
		return user.emails[0].verified;
	},
);

export const getUserEmail = createSelector(
	[getUser],
	(user) => {
		if (!user) {
			return undefined;
		}

		if (!user.emails[0]) {
			return undefined;
		}
		return user.emails[0].address;
	},
);

export const getCanCreatePattern = createSelector(
	[getUserRoles, getNumberOfPatterns],
	(userRoles, numberOfPatterns) => {
		console.log('getCanCreatePattern selector', userRoles);
		if (userRoles.length === 0) {
			return false;
		}

		// user must not have reached the limit on number of patterns
		// const numberOfPatterns = Patterns.find({ 'createdBy': userId }).count();

		const limits = [];
		userRoles.forEach((role) => {
			if (ROLE_LIMITS[role]) {
				limits.push(ROLE_LIMITS[role].maxPatternsPerUser);
			}
		});

		const limit = Math.max(...limits); // user can create the largest number of patterns of any role they have

		if (numberOfPatterns < limit) {
			return true;
		}

		return false;
	},
);

// ///////////////////////////
// State

// default state
const initialAuthState = {
	'error': null,
	'forgotPasswordEmailSent': false,
	'isLoading': true,
	'numberOfPatterns': 0,
	'passwordChanged': false,
	'passwordReset': false,
	'userCanCreateColorBook': false,
	'userCanAddPatternImage': false,
	'verificationEmailSent': false,
	'emailVerified': false,
	'user': null,
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

		case SET_USER_CAN_ADD_PATTERN_IMAGE: {
			return updeep({ 'userCanAddPatternImage': action.payload }, state);
		}

		case SET_USER: {
			return updeep({ 'user': action.payload }, state);
		}

		case SET_NUMBER_OF_PATTERNS: {
			return updeep({ 'numberOfPatterns': action.payload }, state);
		}

		default:
			return state;
	}
}
