import { check } from 'meteor/check';
import {
	nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import { Patterns, Sets } from '../../imports/modules/collection';
import {
	getPatternPermissionQuery,
} from '../../imports/modules/permissionQueries';
import { MAX_PATTERNS_IN_SET, MAX_SETS } from '../../imports/modules/parameters';

Meteor.methods({
	'set.add': function ({
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

		if (Sets.find({ 'createdBy': Meteor.userId() }).count() >= MAX_SETS) {
			throw new Meteor.Error('add-set-too-many-sets', `Unable to create set because the user has created the maximum allowed number of sets (${MAX_SETS})`);
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
	'set.addPattern': function ({ // add a pattern to an existing set
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

		// don't exceed the maximum allowed number of patterns in a set
		if (set.patterns.length >= MAX_PATTERNS_IN_SET) {
			throw new Meteor.Error('add-set-too-many-patterns', `Unable to add pattern to set because the set contains the maximum allowed number of patterns (${MAX_PATTERNS_IN_SET})`);
		}

		Sets.update(
			{ '_id': setId },
			{ '$push': { 'patterns': patternId } },
		);
	},
	'set.removePattern': function ({ // remove a pattern from a set
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
	'set.remove': function (_id) {
		check(_id, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-set-not-logged-in', 'Unable to remove set because the user is not logged in');
		}

		const set = Sets.findOne({ _id });

		if (!set) {
			throw new Meteor.Error('remove-set-not-found', 'Unable to remove set because the set was not found');
		}

		if (set.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('remove-set-not-created-by-user', 'Unable to remove set because it was not created by the current logged in user');
		}

		return Sets.remove({ _id });
	},
	// /////////////////////
	// multi-purpose edit pattern method to avoid having to repeat the same permissions checks
	// at present, this is simpler than pattern.edit because only name and description can be edited
	// so it's always a text field
	'set.edit': function ({
		_id,
		data,
	}) {
		check(_id, nonEmptyStringCheck);
		check(data, Match.ObjectIncluding({ 'type': String }));
		// type specifies the update operation
		// e.g. orientation, weftColor
		const { type } = data;

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-set-not-logged-in', 'Unable to edit set because the user is not logged in');
		}

		const set = Sets.findOne({ _id });

		if (!set) {
			throw new Meteor.Error('edit-set-not-found', 'Unable to edit set because the set was not found');
		}

		if (set.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-set-not-created-by-user', 'Unable to edit set because set was not created by the current logged in user');
		}

		const { fieldName, fieldValue } = data;
		check(fieldName, nonEmptyStringCheck);

		const optionalFields = [
			'description',
		];

		if (optionalFields.indexOf(fieldName) === -1) {
			check(fieldValue, nonEmptyStringCheck);
		} else {
			check(fieldValue, String);
		}

		const update = {};
		update[fieldName] = fieldValue;

		// if the pattern name changes, we must also update nameSort
		if (fieldName === 'name') {
			update.nameSort = fieldValue.toLowerCase();
		}

		return Sets.update({ _id }, { '$set': update });
	},
});
