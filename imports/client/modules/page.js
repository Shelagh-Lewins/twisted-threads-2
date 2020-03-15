// Partial reducer for page, e.g. selected main menu item
import { ALLOWED_ITEMS_PER_PAGE } from '../../modules/parameters';

const updeep = require('updeep');

export const SET_MAIN_MENU_ITEM = 'SET_MAIN_MENU_ITEM';
export const SET_ITEMS_PER_PAGE	= 'SET_ITEMS_PER_PAGE';

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

// ///////////////////////////
// Provide information to the UI
export const getSelectedMainMenuItem = (state) => state.page.selectedMainMenuItem;

// ///////////////////////////
// default state
const initialPageState = {
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

		default:
			return state;
	}
}
