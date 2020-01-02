// Partial store for search
import { clearErrors, logErrors } from './errors';
import { createSelector } from 'reselect';
import { SEARCH_LIMIT } from '../../modules/parameters';
import { PatternsIndex } from '../../modules/collection';

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

export const SET_IS_SEARCHING = 'SET_IS_SEARCHING';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const SEARCH_COMPLETE = 'SEARCH_COMPLETE';
export const CLEAR_SEARCH_RESULTS = 'CLEAR_SEARCH_RESULTS';

// define action types so they are visible
// and export them so other reducers can use them

export function setIsSearching(isSearching) {
	console.log('isSearching', isSearching);
	return {
		'type': 'SET_IS_SEARCHING',
		'payload': isSearching,
	};
}

export function setSearchTerm(searchTerm) {
	return {
		'type': 'SET_SEARCH_TERM',
		'payload': searchTerm,
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

export const searchStart = (searchTerm) => (dispatch, getState) => {
	dispatch(clearErrors());
	dispatch(setIsSearching(true));
	dispatch(clearSearchResults());

	if (!searchTerm || searchTerm === '') {
		return;
	}

	dispatch(setSearchTerm(searchTerm));
	
	console.log('*** search for', searchTerm);

	/*const { searchLimit } = getState().search;
	// console.log('limit', searchLimit);

	Meteor.call('search.searchStart', { searchTerm, searchLimit }, (error, result) => {
		dispatch(setIsSearching(false));

		if (error) {
			return dispatch(logErrors({ 'search': error.reason }));
		}
// console.log('result', result);
		dispatch(searchComplete(result));
	}); */
};

// Provide info to UI
// Selectors
export const getSearchTerm = (state) => state.search.searchTerm;

// ///////////////////////////
// State

// default state
const initialSearchState = {
	'isSearching': false,
	'searchLimit': SEARCH_LIMIT,
	'searchResults': [],
	'searchTerm': '',
};

// state updates
export default function auth(state = initialSearchState, action) {
	switch (action.type) {
		case SET_IS_SEARCHING: {
			console.log('payload', action.payload);
			return updeep({ 'isSearching': action.payload }, state);
		}

		case SET_SEARCH_TERM: {
			return updeep({ 'searchTerm': action.payload }, state);
		}

		case SEARCH_COMPLETE: {
			return updeep({ 'searchResults': action.payload }, state);
		}

		case CLEAR_SEARCH_RESULTS: {
			return updeep({
				'searchResults': updeep.constant([]),
				'searchTerm': '',
			}, state);
		}

		default:
			return state;
	}
}
