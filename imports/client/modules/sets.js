// Partial store for Sets collection

import { clearErrors, logErrors } from './errors';

// ////////////////////////////////
// Action creators

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

// create a new set and add the pattern to it
export const addSet = ({ patternId, name }) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('sets.add', { patternId, name }, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'add-set': error.reason }));
		}

		return result; // id of the new set
	});
};

// add a pattern to a set
export const addPatternToSet = ({ patternId, setId }) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('sets.addPattern', { patternId, setId }, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'add-to-set': error.reason }));
		}
	});
};

// remove a pattern from a set
export const removePatternFromSet = ({ patternId, setId }) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('sets.removePattern', { patternId, setId }, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'remove-from-set': error.reason }));
		}
	});
};
