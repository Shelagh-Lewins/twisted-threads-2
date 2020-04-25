// Partial store for Tags collection
import { clearErrors, logErrors } from './errors';

// ////////////////////////////////
// Action creators

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

// create a new tag and assign it to the pattern
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

// assign an existing tag to the pattern
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
			return dispatch(logErrors({ 'assign-to-pattern': error.reason }));
		}
	});
};

export function removeTagFromDocument({
	name,
	targetId,
	targetType,
}) {
	return () => {
		Meteor.call('tags.removeFromDocument', {
			name,
			targetId,
			targetType,
		});
	};
}
