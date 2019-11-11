import { check } from 'meteor/check';
import Patterns from '../imports/collection';
import { ITEMS_PER_PAGE } from '../imports/parameters';
// arrow functions lose "this" context
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */

// don't allow users to edit their profile
// https://docs.meteor.com/api/accounts.html
Meteor.users.deny({ 'update': () => true });

/* Meteor.publish('patternstest', async function () {
	const result = await Patterns.rawCollection().find({});
	console.log('result', result);
	return result;
}); */

// list of patterns
Meteor.publish('patterns', (skip = 0, limit = ITEMS_PER_PAGE) => {
	const positiveIntegerCheck = Match.Where((x) => {
		check(x, Match.Integer);
		return x >= 0;
	});

	check(skip, positiveIntegerCheck);

	// Meteor._sleepForMs(3000); // simulate server delay

	return Patterns.find({},
		{
			'fields': {
				'name': 1,
				'name_sort': 1,
			},
			'sort': { 'name_sort': 1 },
			'skip': skip,
			'limit': limit,
		});
});

// individual pattern
Meteor.publish('pattern', function (_id = undefined) {
	const nonEmptyStringCheck = Match.Where((x) => {
		check(x, String);
		return x !== '';
	});

	check(_id, nonEmptyStringCheck);

	return Patterns.find(
		{ _id },
		{
			'fields': {
				'name': 1,
				'name_sort': 1,
			},
		},
	);
});
