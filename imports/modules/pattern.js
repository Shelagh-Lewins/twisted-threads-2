const updeep = require('updeep');

/* eslint-disable array-callback-return */

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const TEST_ACTION_FOR_PATTERN = 'TEST_ACTION_FOR_PATTERN';

// ///////////////////////////
export function addPattern(text) {
	return () => {
		Meteor.call('addPattern', text);
	};
}

export function testActionForPattern(text) {
	return () => {
		Meteor.call('addPattern', text);
	};
}

// ///////////////////////////
// default state
const initialPatternState = {
	'isLoading': false,
	'error': null,
};

// state updates
export default function reusableItem(state = initialPatternState, action) {
	switch (action.type) {
		case TEST_ACTION_FOR_PATTERN: {
			return updeep(state, state);
		}

		default:
			return state;
	}
}
