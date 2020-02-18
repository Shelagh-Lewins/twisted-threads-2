import { check } from 'meteor/check';
import {
	nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import { Patterns, Tags } from '../../imports/modules/collection';
import {
	MIN_TAG_LENGTH,
	MAX_TAG_LENGTH,
} from '../../imports/modules/parameters';

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

		// check the name is long enough
		if (name < MIN_TAG_LENGTH) {
			throw new Meteor.Error('add-tag-too-short', `Unable to add tag because tag must be at least ${MIN_TAG_LENGTH} characters`);
		}

		// check the name is not too long
		if (name > MAX_TAG_LENGTH) {
			throw new Meteor.Error('add-tag-too-long', `Unable to add tag because tag must be no longer than ${MAX_TAG_LENGTH} characters`);
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
			{ '$push': { 'tags': name } },
		);

		return tagId;
	},
	'tags.assignToPattern': function ({
		patternId,
		name,
	}) {
		// assign an existing tag to a pattern
		check(patternId, nonEmptyStringCheck);
		check(name, nonEmptyStringCheck);

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
		const existing = Tags.findOne({ name });
		if (!existing) {
			throw new Meteor.Error('assign-tag-not-found', 'Unable to assign tag because the tag was not found');
		}

		// check the tag is not already assigned to the pattern
		if (pattern.tags.indexOf(name) !== -1) {
			throw new Meteor.Error('assign-tag-already-assigned', 'Unable to assign tag because the tag is already assigned to the pattern');
		}

		Patterns.update(
			{ '_id': patternId },
			{ '$push': { 'tags': name } },
		);
	},
	'tags.removeTagFromPattern': function ({
		patternId,
		name,
	}) {
		// remove an existing tag from a pattern
		check(patternId, nonEmptyStringCheck);
		check(name, nonEmptyStringCheck);

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
		if (pattern.tags.indexOf(name) === -1) {
			throw new Meteor.Error('remove-tag-not-assigned', 'Unable to remove tag because the tag is not assigned to the pattern');
		}

		// Remove the tag from the pattern
		Patterns.update(
			{ '_id': patternId },
			{ '$pull': { 'tags': name } },
		);

		// Delete unused tag
		Meteor.call('tags.removeUnused', name);
	},
	'tags.removeUnused': function (names) {
		// remove any tags that are no longer referenced
		check(names, Match.OneOf([nonEmptyStringCheck], nonEmptyStringCheck));

		let namesArray = [];
		if (typeof names === 'string') {
			namesArray.push(names);
		} else {
			namesArray = [...names];
		}

		namesArray.forEach((name) => {
			if (Patterns.find({ 'tags': name }).count() === 0) {
				Tags.remove({ 'name': name });
			}
		});
	},
});
