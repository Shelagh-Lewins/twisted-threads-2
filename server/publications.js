import { check } from 'meteor/check';
import Patterns from '../imports/collection';
import { ITEMS_PER_PAGE } from '../imports/parameters';
// arrow functions lose "this" context
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */

// don't allow users to edit their profile
// https://docs.meteor.com/api/accounts.html
Meteor.users.deny({ 'update': () => true });

const patternsPublishFields = {
	'name': 1,
};

// list of patterns
Meteor.publish('patterns', (skip = 0, limit = ITEMS_PER_PAGE) => {
	const positiveIntegerCheck = Match.Where((x) => {
		check(x, Match.Integer);
		return x >= 0;
	});

	check(skip, positiveIntegerCheck);

	return Patterns.find({},
		{
			'fields': patternsPublishFields,
			'sort': { 'name_sort': 1 },
			'skip': skip,
			'limit': limit,
		});
});

// individual pattern
const patternPublishFields = {
	'name': 1,
};

// example of how to stop subscription, e.g. if user logs out, but not sure it's necessary here
Meteor.publish('pattern', function (_id = undefined) {
	const nonEmptyStringCheck = Match.Where((x) => {
		check(x, String);
		return x !== '';
	});

	// check(_id, String);
	check(_id, nonEmptyStringCheck);

	if (_id) {
		return Patterns.find(
			{ _id },
			{
				'fields': patternPublishFields,
			},
		);
	}
	return this.stop();
});
