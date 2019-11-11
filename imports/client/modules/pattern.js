// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state

// Note: it may be better to separate these

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const GET_PATTERN_COUNT = 'GET_PATTERN_COUNT';
export const SET_PATTERN_COUNT = 'SET_PATTERN_COUNT';
export const SET_ISLOADING = 'SET_ISLOADING';

// ////////////////////////////
// Actions that change the Store

// used in pagination
export function setPatternCount(patternCount) {
	return {
		'type': 'SET_PATTERN_COUNT',
		'payload': patternCount,
	};
}

export const getPatternCount = () => (dispatch) => Meteor.call('getPatternCount', (error, result) => {
	dispatch(setPatternCount(result));
});

export const changePage = (newPageNumber, history) => (dispatch) => {
	const url = `/?page=${newPageNumber + 1}`;

	history.push(url);
	dispatch(getPatternCount());
};

// waiting for data subscription to be ready
export function setIsLoading(isLoading) {
	return {
		'type': 'SET_ISLOADING',
		'payload': isLoading,
	};
}

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI
export const addPattern = (text) => (dispatch) => Meteor.call('addPattern', text, () => {
	dispatch(getPatternCount());
});

export function removePattern(_id) {
	return () => {
		Meteor.call('removePattern', _id);
	};
}

// ///////////////////////////
// default state
const initialPatternState = {
	'currentPageNumber': 0,
	'error': null,
	'isLoading': false,
	'patternCount': 0,
};

// state updates
export default function pattern(state = initialPatternState, action) {
	switch (action.type) {
		case SET_PATTERN_COUNT: {
			return updeep({ 'patternCount': action.payload }, state);
		}

		case SET_ISLOADING: {
			return updeep({ 'isLoading': action.payload }, state);
		}

		default:
			return state;
	}
}
