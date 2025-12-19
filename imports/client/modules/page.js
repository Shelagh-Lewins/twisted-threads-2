import { ALLOWED_ITEMS_PER_PAGE } from '../../modules/parameters';
import * as updeepModule from 'updeep';
const updeep = updeepModule.default || updeepModule;

export const SET_MAIN_MENU_ITEM = 'SET_MAIN_MENU_ITEM';
export const SET_ITEMS_PER_PAGE	= 'SET_ITEMS_PER_PAGE';
export const SET_PATTERN_FOR_SETS_LIST = 'SET_PATTERN_FOR_SETS_LIST';

// ////////////////////////////
// Actions that change the Store
export function setSelectedMainMenuItem(selectedMainMenuItem) {
	return {
		'type': SET_MAIN_MENU_ITEM,
		'payload': selectedMainMenuItem,
	};
}

export function setItemsPerPage(value) {
	return {
		'type': SET_ITEMS_PER_PAGE,
		'payload': value,
	};
}

export const changePage = (newPageNumber, history) => (dispatch) => {
	const url = `?page=${newPageNumber + 1}`;

	history.push(url);
};

export function setPatternForSetsList(patternId) {
	return {
		'type': SET_PATTERN_FOR_SETS_LIST,
		'payload': patternId,
	};
}

// ///////////////////////////
// Provide information to the UI
export const getSelectedMainMenuItem = (state) => state.page.selectedMainMenuItem;

// ///////////////////////////
// default state
const initialPageState = {
	'patternForSetsList': '',
	'selectedMainMenuItem': '',
	'itemsPerPage': ALLOWED_ITEMS_PER_PAGE[0],
};

// state updates
export default function page(state = initialPageState, action) {
	switch (action.type) {
		case SET_MAIN_MENU_ITEM: {
			return updeep({ 'selectedMainMenuItem': action.payload }, state);
		}

		case SET_ITEMS_PER_PAGE: {
			return updeep({ 'itemsPerPage': action.payload }, state);
		}

		case SET_PATTERN_FOR_SETS_LIST: {
			return updeep({ 'patternForSetsList': action.payload }, state);
		}

		default:
			return state;
	}
}
