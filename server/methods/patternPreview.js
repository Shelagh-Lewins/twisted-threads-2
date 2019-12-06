import { check } from 'meteor/check';
import { PatternPreviews, Patterns } from '../../imports/modules/collection';

Meteor.methods({
	'patternPreview.save': function ({
		_id,
		uri,
	}) {
		check(_id, String);
		check(uri, String);
console.log('method');
		if (!Meteor.userId()) {
			throw new Meteor.Error('save-preview-not-logged-in', 'Unable to save preview because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('save-preview-not-found', 'Unable to save preview because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('save-preview-not-created-by-user', 'Unable to save preview because pattern was not created by the current logged in user');
		}

		// TO DO should the data be sanitized on the way in, which may happen often? They are currently sanitized before being displayed.

		const patternPreview = PatternPreviews.findOne({ 'patternId': _id });

		if (!patternPreview) {
			// create new
			return PatternPreviews.insert({
				'patternId': _id,
				'uri': uri,
			});
		}

		// update existing
		return PatternPreviews.update({ '_id': patternPreview._id }, { '$set': { 'uri': uri } });
	},
});
