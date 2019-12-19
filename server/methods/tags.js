import { check } from 'meteor/check';
import {
	nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import { Patterns, Tags } from '../../imports/modules/collection';

Meteor.methods({
	'tags.add': function ({
		patternId,
		tagText,
	}) {
		// tags are created when a new text is assigned to a pattern
		check(patternId, nonEmptyStringCheck);
		check(tagText, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-tag-not-logged-in', 'Unable to create tag because the user is not logged in');
		}

		if (!Meteor.user().emails[0].verified) {
			throw new Meteor.Error('add-tag-not-verified', 'Unable to create tag because the user\'s email address is not verified');
		}

		const pattern = Patterns.findOne({ '_id': patternId });

		if (!pattern) {
			throw new Meteor.Error('add-tag-not-found', 'Unable to add tag because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('add-tag-not-created-by-user', 'Unable to add tag because the pattern was not created by the current logged in user');
		}

		const { tagId } = Tags.insert({
			'text': tagText,
		});

		Patterns.update(
			{ '_id': patternId },
			{ '$push': { 'tags': tagId } },
		);

		return tagId;
	},
});
