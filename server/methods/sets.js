import { check } from 'meteor/check';
import {
	nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import { Patterns, Sets } from '../../imports/modules/collection';
import {
	getPatternPermissionQuery,
} from '../../imports/modules/permissionQueries';

Meteor.methods({
	'sets.add': function ({
		patternId,
		name,
	}) {
		// sets are created when a pattern is assigned to a new set
		// name does not have to be unique, it's up to the user
		check(patternId, nonEmptyStringCheck);
		check(name, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-set-not-logged-in', 'Unable to create set because the user is not logged in');
		}

		const pattern = Patterns.findOne({ '_id': patternId });

		if (!pattern) {
			throw new Meteor.Error('add-set-not-found', 'Unable to add tag because the pattern was not found');
		}

		const setId = Sets.insert({
			'createdBy': Meteor.userId(),
			'description': '',
			name,
			'nameSort': name.toLowerCase(),
			'patterns': [patternId],
		});

		return setId;
	},
	'sets.addPattern': function ({ // add a pattern to an existing set
		patternId,
		setId,
	}) {
		check(patternId, nonEmptyStringCheck);
		check(setId, nonEmptyStringCheck);
		// check user is logged in
		if (!Meteor.userId()) {
			throw new Meteor.Error('add-to-set-not-logged-in', 'Unable to add pattern to set because the user is not logged in');
		}

		// check set exists
		const set = Sets.findOne({ '_id': setId });

		if (!set) {
			throw new Meteor.Error('add-to-set-not-found', 'Unable to add pattern to set because the set was not found');
		}

		// check user owns set
		if (set.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('add-to-set-not-created-by-user', 'Unable to add pattern to set because the set was not created by the current logged in user');
		}

		// check pattern is visible to user
		const pattern = Patterns.findOne({
			'$and': [
				{ '_id': patternId },
				getPatternPermissionQuery(),
			],
		});

		if (!pattern) {
			throw new Meteor.Error('add-to-set-not-found', 'Unable to add pattern to set because the pattern was not found');
		}

		// check pattern is not already in set
		if (set.patterns.indexOf(patternId) !== -1) {
			throw new Meteor.Error('add-to-set-already-in-set', 'Unable to add pattern to set because the pattern is already in the set');
		}

		Sets.update(
			{ '_id': setId },
			{ '$push': { 'patterns': patternId } },
		);
	},
	'sets.removePattern': function ({ // remove a pattern from a set
		patternId,
		setId,
	}) {
		check(patternId, nonEmptyStringCheck);
		check(setId, nonEmptyStringCheck);
		// check user is logged in
		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-from-set-not-logged-in', 'Unable to remove pattern from set because the user is not logged in');
		}

		// check set exists
		const set = Sets.findOne({ '_id': setId });

		if (!set) {
			throw new Meteor.Error('remove-from-set-not-found', 'Unable to remove pattern from set because the set was not found');
		}

		// check user owns set
		if (set.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('remove-from-set-not-created-by-user', 'Unable to remove pattern from set because the set was not created by the current logged in user');
		}

		// check pattern is visible to user
		const pattern = Patterns.findOne({
			'$and': [
				{ '_id': patternId },
				getPatternPermissionQuery(),
			],
		});

		if (!pattern) {
			throw new Meteor.Error('remove-from-set-not-found', 'Unable to remove pattern from set because the pattern was not found');
		}

		// check pattern is in set
		if (set.patterns.indexOf(patternId) === -1) {
			throw new Meteor.Error('remove-from-set-already-in-set', 'Unable to remove pattern from set because the pattern is not in the set');
		}

		Sets.update(
			{ '_id': setId },
			{ '$pull': { 'patterns': patternId } },
		);

		// delete set if now empty
		const setUpdated = Sets.findOne({ '_id': setId });

		if (setUpdated.patterns.length === 0) {
			Sets.remove({ '_id': setId });
		}
	},
//TODO remove empty set after delete pattern
});
