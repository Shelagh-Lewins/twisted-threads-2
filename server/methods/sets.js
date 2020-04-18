import { check } from 'meteor/check';
import {
	nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import { Patterns, Sets } from '../../imports/modules/collection';

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
});
