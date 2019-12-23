// Partial store for search
import { clearErrors, logErrors } from './errors';

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

export const SET_IS_SEARCHING = 'SET_IS_SEARCHING';
export const SEARCH_COMPLETE = 'SEARCH_COMPLETE';
export const CLEAR_SEARCH_RESULTS = 'CLEAR_SEARCH_RESULTS';

// define action types so they are visible
// and export them so other reducers can use them

export function setIsSearching(isSearching) {
	return {
		'type': 'SET_IS_SEARCHING',
		'payload': isSearching,
	};
}

export function searchComplete(result) {
	return {
		'type': 'SEARCH_COMPLETE',
		'payload': result,
	};
}

export function clearSearchResults() {
	return {
		'type': 'CLEAR_SEARCH_RESULTS',
	};
}

// ///////////////////////////
// Action that call Meteor methods

export const searchStart = (searchTerm) => (dispatch) => {
	dispatch(clearErrors());
	dispatch(clearSearchResults());

	if (!searchTerm || searchTerm === '') {
		return;
	}

	dispatch(setIsSearching(true));
	console.log('search term', searchTerm);
	Meteor.call('search.searchStart', searchTerm, (error, result) => {
		dispatch(setIsSearching(false));

		if (error) {
			return dispatch(logErrors({ 'search': error.reason }));
		}
console.log('result', result);
		dispatch(searchComplete(result));
	});
};

// ///////////////////////////
// State

// default state
const initialSearchState = {
	'isSearching': false,
	'searchResults': [],
};

// state updates
export default function auth(state = initialSearchState, action) {
	switch (action.type) {
		case SET_IS_SEARCHING: {
			return updeep({ 'isSearching': action.payload }, state);
		}

		case SEARCH_COMPLETE: {
			return updeep({ 'searchResults': action.payload }, state);
		}

		case CLEAR_SEARCH_RESULTS: {
			return updeep({ 'searchResults': updeep.constant([]) }, state);
		}

		default:
			return state;
	}
}
