// Partial store for search
import { clearErrors, logErrors } from './errors';
import { createSelector } from 'reselect';
import { SEARCH_LIMIT, SEARCH_MORE } from '../../modules/parameters';

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

export const SET_IS_SEARCHING = 'SET_IS_SEARCHING';
export const SET_SEARCH_TERM = 'SET_SEARCH_TERM';
export const SEARCH_COMPLETE = 'SEARCH_COMPLETE';
export const CLEAR_SEARCH_RESULTS = 'CLEAR_SEARCH_RESULTS';
export const SET_PATTERN_SEARCH_LIMIT = 'SET_PATTERN_SEARCH_LIMIT';

// define action types so they are visible
// and export them so other reducers can use them

export function setIsSearching(isSearching) {
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

// Start search
export const searchStart = (searchTerm) => (dispatch, getState) => {
	dispatch(clearErrors());
	dispatch(setIsSearching(true));
	dispatch(clearSearchResults());

	if (!searchTerm || searchTerm === '') {
		return;
	}

	dispatch(setSearchTerm(searchTerm));
};

export function setPatternSearchLimit(patternSearchLimit) {
	return {
		'type': 'SET_PATTERN_SEARCH_LIMIT',
		'payload': patternSearchLimit,
	};
}

export const showMorePatterns = () => (dispatch, getState) => {
					console.log('show more!');
	const { patternSearchLimit } = getState().search;
	dispatch(setPatternSearchLimit(patternSearchLimit + SEARCH_MORE));
};

// Provide info to UI
// Selectors
export const getSearchTerm = (state) => state.search.searchTerm;

export const getPatternSearchLimit = (state) => state.search.patternSearchLimit;

// ///////////////////////////
// State

// default state
const initialSearchState = {
	'isSearching': false,
	'patternSearchLimit': SEARCH_LIMIT,
	'searchResults': [],
	'searchTerm': '',
};

// state updates
export default function auth(state = initialSearchState, action) {
	switch (action.type) {
		case SET_IS_SEARCHING: {
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

		case SET_PATTERN_SEARCH_LIMIT: {
			return updeep({ 'patternSearchLimit': action.payload }, state);
		}

		default:
			return state;
	}
}
