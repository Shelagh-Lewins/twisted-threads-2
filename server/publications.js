import { check } from 'meteor/check';
import Patterns from '../imports/collection';
import { ITEMS_PER_PAGE } from '../imports/parameters';
// arrow functions lose "this" context
/* eslint-disable func-names */

// don't allow users to edit their profile
// https://docs.meteor.com/api/accounts.html
Meteor.users.deny({ 'update': () => true });

// list of patterns
Meteor.publish('patterns', function (skip = 0, limit = ITEMS_PER_PAGE) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	const positiveIntegerCheck = Match.Where((x) => {
		check(x, Match.Integer);
		return x >= 0;
	});

	check(skip, positiveIntegerCheck);

	// Meteor._sleepForMs(3000); // simulate server delay

	return Patterns.find(
		{ 'created_by': this.userId },
		{
			'fields': {
				'name': 1,
				'name_sort': 1,
			},
			'sort': { 'name_sort': 1 },
			'skip': skip,
			'limit': limit,
		},
	);
});

// individual pattern
Meteor.publish('pattern', function (_id = undefined) {
	const nonEmptyStringCheck = Match.Where((x) => {
		check(x, String);
		return x !== '';
	});

	check(_id, nonEmptyStringCheck);

	return Patterns.find(
		{
			_id,
			'created_by': this.userId,
		},
		{
			'fields': {
				'name': 1,
				'name_sort': 1,
			},
		},
	);
});
