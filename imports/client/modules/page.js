// Partial reducer for page, e.g. selected item
const updeep = require('updeep');

export const SET_MAIN_MENU_ITEM = 'SET_MAIN_MENU_ITEM';

// ////////////////////////////
// Actions that change the Store
export function setSelectedMainMenuItem(selectedMainMenuItem) {
	return {
		'type': 'SET_MAIN_MENU_ITEM',
		'payload': selectedMainMenuItem,
	};
}

// ///////////////////////////
// Provide information to the UI
export const getSelectedMainMenuItem = (state) => state.page.selectedMainMenuItem;

// ///////////////////////////
// default state
const initialPageState = {
	'selectedMainMenuItem': '',
};

// state updates
export default function page(state = initialPageState, action) {
	switch (action.type) {
		case SET_MAIN_MENU_ITEM: {
			return updeep({ 'selectedMainMenuItem': action.payload }, state);
		}

		default:
			return state;
	}
}
