// Partial store for Tags collection
import { clearErrors, logErrors } from './errors';

// ////////////////////////////////
// Action creators

// ///////////////////////////
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

export function addTag({ patternId, tagText }) {
	return () => {
		Meteor.call('tags.add', { patternId, tagText });
	};
}

export function assignTagToPattern({ patternId, tagId }) {
	return () => {
		Meteor.call('tags.assignToPattern', { patternId, tagId });
	};
}

export function removeTagFromPattern({ patternId, tagId }) {
	return () => {
		Meteor.call('tags.removeTagFromPattern', { patternId, tagId });
	};
}
