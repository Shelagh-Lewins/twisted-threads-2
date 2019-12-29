import { check } from 'meteor/check';
import {
	nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import { Patterns, Tags } from '../../imports/modules/collection';

Meteor.methods({
	'tags.add': function ({
		patternId,
		name,
	}) {
		// tags are created when a new text is assigned to a pattern
		check(patternId, nonEmptyStringCheck);
		check(name, nonEmptyStringCheck);

		// ensure all tags are lower case
		const processedName = name.toLowerCase();

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-tag-not-logged-in', 'Unable to create tag because the user is not logged in');
		}

		const pattern = Patterns.findOne({ '_id': patternId });

		if (!pattern) {
			throw new Meteor.Error('add-tag-not-found', 'Unable to add tag because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('add-tag-not-created-by-user', 'Unable to add tag because the pattern was not created by the current logged in user');
		}

		// check the name does not already exist
		const existing = Tags.find({ 'name': processedName });
		if (existing.count() > 0) {
			throw new Meteor.Error('add-tag-already-exists', 'Unable to add tag because a tag with that name already exists');
		}

		const tagId = Tags.insert({
			'name': processedName,
		});

		if (!pattern.tags) {
			Patterns.update(
				{ '_id': patternId },
				{ '$set': { 'tags': [] } },
			);
		}

		Patterns.update(
			{ '_id': patternId },
			{ '$push': { 'tags': tagId } },
		);

		return tagId;
	},
	'tags.assignToPattern': function ({
		patternId,
		tagId,
	}) {
		// assign an existing tag to a pattern
		check(patternId, nonEmptyStringCheck);
		check(tagId, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('assign-tag-not-logged-in', 'Unable to assign tag because the user is not logged in');
		}

		const pattern = Patterns.findOne({ '_id': patternId });

		if (!pattern) {
			throw new Meteor.Error('assign-tag-not-found', 'Unable to assign tag because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('assign-tag-not-created-by-user', 'Unable to assign tag because the pattern was not created by the current logged in user');
		}

		// check the tag exists
		const existing = Tags.findOne({ '_id': tagId });
		if (!existing) {
			throw new Meteor.Error('assign-tag-not-found', 'Unable to assign tag because the tag was not found');
		}

		// check the tag is not already assigned to the pattern
		if (pattern.tags.indexOf(tagId) !== -1) {
			throw new Meteor.Error('assign-tag-already-assigned', 'Unable to assign tag because the tag is already assigned to the pattern');
		}

		Patterns.update(
			{ '_id': patternId },
			{ '$push': { 'tags': tagId } },
		);
	},
	'tags.removeTagFromPattern': function ({
		patternId,
		tagId,
	}) {
		// remove an existing tag from a pattern
		check(patternId, nonEmptyStringCheck);
		check(tagId, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-tag-not-logged-in', 'Unable to remove tag because the user is not logged in');
		}

		const pattern = Patterns.findOne({ '_id': patternId });

		if (!pattern) {
			throw new Meteor.Error('remove-tag-not-found', 'Unable to remove tag because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('remove-tag-not-created-by-user', 'Unable to remove tag because the pattern was not created by the current logged in user');
		}

		// check the tag is assigned to the pattern
		if (pattern.tags.indexOf(tagId) === -1) {
			throw new Meteor.Error('remove-tag-not-assigned', 'Unable to remove tag because the tag is not assigned to the pattern');
		}

		// Remove the tag from the pattern
		Patterns.update(
			{ '_id': patternId },
			{ '$pull': { 'tags': tagId } },
		);

		// Delete unused tag
		Meteor.call('tags.removeUnused', tagId);
	},
	'tags.removeUnused': function (tagIds) {
		// remove any tags that are no longer referenced
		check(tagIds, Match.OneOf([nonEmptyStringCheck], nonEmptyStringCheck));

		let ids = [];
		if (typeof tagIds === 'string') {
			ids.push(tagIds);
		} else {
			ids = [...tagIds];
		}

		ids.forEach((tagId) => {
			if (Patterns.find({ 'tags': tagId }).count() === 0) {
				Tags.remove({ '_id': tagId });
			}
		});
	},
});
