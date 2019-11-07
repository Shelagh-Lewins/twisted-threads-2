// Actions and reducer for auth
// most of this will actually be calls to the Meteor.Accounts system, but using actions keeps the UI agnostic.

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const REGISTER = 'REGISTER';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI
export function register({
	email,
	username,
	password,
	history,
}) {
	return () => {
		Accounts.createUser({ email, username, password }, (error) => {
			if (error) {
				console.log('register error', error);
			} else {
				history.push('/welcome');
			}
		});
	};
}

export function login({ email, password, history }) {
	return () => {
		Meteor.loginWithPassword(email, password, (error) => {
			if (error) {
				console.log('login error', error);
			} else {
				history.push('/');
			}
		});
	};
}

export function logout(history) {
	return () => {
		Meteor.logout((error) => {
			if (error) {
				console.log('logout error', error);
			} else {
				history.push('/');
			}
		});
	};
}

// ///////////////////////////
// Functions to provide info to UI

export function getUser() {
	return Meteor.user() || {};
}

export function getIsAuthenticated() {
	return Boolean(Meteor.userId());
}
