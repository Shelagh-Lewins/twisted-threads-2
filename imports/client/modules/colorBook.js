// Partial store for ColorBooks collection in database e.g. actions to call a method to edit a color book

import { logErrors, clearErrors } from './errors';

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const SET_COLORBOOK_ADDED = 'SET_COLORBOOK_ADDED';

// ////////////////////////////
// Actions that change the Store

export function setColorBookAdded(colorBookId) {
	return {
		'type': 'SET_COLORBOOK_ADDED',
		'payload': colorBookId,
	};
}

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

export const addColorBook = (name) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('addColorBook', name, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'add-color-book': error.reason }));
		}

		dispatch(setColorBookAdded(result));
	});
};

export const editColorBookColor = (data) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('editColorBookColor', data, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'edit-color-book': error.reason }));
		}
	});
};

// ///////////////////////////
// default state
const initialColorBookState = {
	'colorBookAdded': '',
	'error': null,
};

// state updates
export default function pattern(state = initialColorBookState, action) {
	switch (action.type) {
		case SET_COLORBOOK_ADDED: {
			return updeep({ 'colorBookAdded': action.payload }, state);
		}

		default:
			return state;
	}
}
