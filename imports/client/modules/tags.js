// Partial store for Tags collection
import { clearErrors, logErrors } from './errors';

// ////////////////////////////////
// Action creators

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

// create a new tag and assign it to the pattern
export const addTag = ({ patternId, name }) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('tags.add', { patternId, name }, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'add-tag': error.reason }));
		}
	});
};

// assign an existing tag to the pattern
export const assignTagToPattern = ({ patternId, tagId }) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('tags.assignToPattern', { patternId, tagId }, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'assign-to-pattern': error.reason }));
		}
	});
};

export function removeTagFromPattern({ patternId, tagId }) {
	return () => {
		Meteor.call('tags.removeTagFromPattern', { patternId, tagId });
	};
}
