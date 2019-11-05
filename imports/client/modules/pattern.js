// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state

// Note: it may be better to separate these

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const CHANGE_PAGE = 'CHANGE_PAGE';

// ///////////////////////////
export function addPattern(text) {
	return () => {
		Meteor.call('addPattern', text);
	};
}

export function removePattern(_id) {
	return () => {
		Meteor.call('removePattern', _id);
	};
}

// this would be a UI state change
export function changePage(currentPageNumber) {
	return {
		'type': 'CHANGE_PAGE',
		'payload': currentPageNumber,
	};
}

// ///////////////////////////
// default state
const initialPatternState = {
	'currentPageNumber': 1,
	'isLoading': false,
	'error': null,
};

// state updates
export default function pattern(state = initialPatternState, action) {
	switch (action.type) {
		case CHANGE_PAGE: {
			return updeep({ 'currentPageNumber': action.payload }, state);
		}

		default:
			return state;
	}
}
