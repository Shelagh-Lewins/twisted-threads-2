// Partial store for PatternPreviews collection in database e.g. actions to call a method to save a pattern preview

import { logErrors, clearErrors } from './errors';

// define action types so they are visible
// and export them so other reducers can use them
export const SET_COLORBOOK_ADDED = 'SET_COLORBOOK_ADDED';

// ////////////////////////////
// Actions that change the Store

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

// used for create new and edit. Simply overwrite the data
export const savePatternPreview = ({ _id, data }) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('patternPreview.save', { _id, data }, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'save-pattern-preview': error.reason }));
		}
	});
};
