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
		'type': SET_COLORBOOK_ADDED,
		'payload': colorBookId,
	};
}

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

export const addColorBook = ({ colors, name }) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('colorBook.add', { colors, name }, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'add-color-book': error.reason }));
		}

		dispatch(setColorBookAdded(result));
	});
};

export const editIsPublic = ({
	_id,
	isPublic,
}) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('colorBook.edit', {
		_id,
		'data': {
			'type': 'isPublic',
			isPublic,
		},
	}, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'edit-color-book-is-public': error.reason }));
		}
	});
};

export const editColorBookColor = ({
	_id,
	colorHexValue,
	colorIndex,
}) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('colorBook.edit', {
		_id,
		'data': {
			'type': 'color',
			colorHexValue,
			colorIndex,
		},
	}, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'edit-color-book-color': error.reason }));
		}
	});
};

export const editColorBookName = ({ _id, name }) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('colorBook.edit', {
		_id,
		'data': {
			'type': 'name',
			name,
		},
	}, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'edit-color-book-name': error.reason }));
		}
	});
};

export const removeColorBook = (_id) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('colorBook.remove', _id, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'edit-color-book': error.reason }));
		}
	});
};

export const copyColorBook = (_id, history) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('colorBook.copy', _id, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'copy-color-book': error.reason }));
		}

		const currentPath = history.location.pathname;
		const userPage = `/user/${Meteor.userId()}`;

		if (currentPath !== userPage) {
			history.push(userPage);
		}
		// history.push(url);
		// so they will see the new color book
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
