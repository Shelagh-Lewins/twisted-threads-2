// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state

// Note: it may be better to separate these

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const SET_PAGE_NUMBER = 'SET_PAGE_NUMBER';
export const GET_PATTERN_COUNT = 'GET_PATTERN_COUNT';
export const SET_PATTERN_COUNT = 'SET_PATTERN_COUNT';
export const SET_ISLOADING = 'SET_ISLOADING';

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI
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

// ////////////////////////////
// Actions that change the Store

// pagination
export function setPageNumber(currentPageNumber) {
	return {
		'type': 'SET_PAGE_NUMBER',
		'payload': currentPageNumber,
	};
}

export function setPatternCount(patternCount) {
	return {
		'type': 'SET_PATTERN_COUNT',
		'payload': patternCount,
	};
}

export const getPatternCount = () => (dispatch) => {
	return Meteor.call('getPatternCount', (error, result) => {
		dispatch(setPatternCount(result));
	});
};

export const changePage = (currentPageNumber) => (dispatch) => {
	dispatch(setPageNumber(currentPageNumber));
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
		case SET_PAGE_NUMBER: {
			return updeep({ 'currentPageNumber': action.payload }, state);
		}

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
