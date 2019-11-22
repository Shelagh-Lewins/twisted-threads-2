import { check } from 'meteor/check';
import { ColorBooks, Patterns } from '../imports/collection';
import { ITEMS_PER_PAGE } from '../imports/parameters';
import {
	nonEmptyStringCheck,
	positiveIntegerCheck,
} from './utils';
// arrow functions lose "this" context
/* eslint-disable func-names */

// don't allow users to edit their profile
// https://docs.meteor.com/api/accounts.html
Meteor.users.deny({ 'update': () => true });

// //////////////////////////
// Color books

Meteor.publish('colorBooks', function () {
	// Meteor._sleepForMs(3000); // simulate server delay

	// explicitly return nothing when user is not logged in
	// this is so we can test behaviour when user is not logged in: PublicationCollector passes in undefined userId, and find() is inconsistent between Meteor and MongoDB on undefined
	if (!this.userId) {
		this.ready();
		return;
	}

	return ColorBooks.find(
		{ 'createdBy': this.userId },
	);
});

// //////////////////////////
// Patterns

// limited fields for all patterns
const patternsFields = {
	'createdAt': 1,
	'createdBy': 1,
	'holes': 1,
	'isPublic': 1,
	'name': 1,
	'nameSort': 1,
	'patternType': 1,
	'rows': 1,
	'tablets': 1,
};

// additional fields for individual pattern
const patternFields = {
	...patternsFields,
	...{
		'orientations': 1,
		'palette': 1,
		'threading': 1,
	},
};

// list of patterns
Meteor.publish('patterns', function (skip = 0, limit = ITEMS_PER_PAGE) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	check(skip, positiveIntegerCheck);

	// Meteor._sleepForMs(3000); // simulate server delay

	// explicitly return nothing when user is not logged in
	if (!this.userId) {
		this.ready();
		return;
	}

	return Patterns.find(
		{ 'createdBy': this.userId },
		{
			'fields': patternsFields,
			'sort': { 'nameSort': 1 },
			'skip': skip,
			'limit': limit,
		},
	);
});

// individual pattern
Meteor.publish('pattern', function (_id = undefined) {
	check(_id, nonEmptyStringCheck);

	// explicitly return nothing when user is not logged in
	if (!this.userId) {
		this.ready();
		return;
	}

	return Patterns.find(
		{
			_id,
			'createdBy': this.userId,
		},
		{
			'fields': patternFields,
		},
	);
});
