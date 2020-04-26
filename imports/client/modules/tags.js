// Partial store for Tags collection
import { clearErrors, logErrors } from './errors';

// ////////////////////////////////
// Action creators

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

// Tags can be assigned to patterns or sets

// create a new tag and assign it to the document
export const addTag = ({
	name,
	targetId,
	targetType,
}) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('tags.add', {
		name,
		targetId,
		targetType,
	}, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'add-tag': error.reason }));
		}
	});
};

// assign an existing tag to the document
export const assignTagToDocument = ({
	name,
	targetId,
	targetType,
}) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('tags.assignToDocument', {
		name,
		targetId,
		targetType,
	}, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'assign-tag-to-document': error.reason }));
		}
	});
};

export const removeTagFromDocument = ({
	name,
	targetId,
	targetType,
}) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('tags.removeFromDocument', {
		name,
		targetId,
		targetType,
	}, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'remove-tag-from-document': error.reason }));
		}
	});
};
