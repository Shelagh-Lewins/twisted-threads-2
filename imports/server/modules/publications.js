import { check } from 'meteor/check';
import {
	ColorBooks,
	PatternImages,
	PatternPreviews,
	Patterns,
	Tags,
} from '../../modules/collection';
import {
	ITEMS_PER_PAGE,
	ITEMS_PER_PREVIEW_LIST,
	USER_FIELDS,
} from '../../modules/parameters';
import {
	getTabletFilter,
	nonEmptyStringCheck,
	positiveIntegerCheck,
} from './utils';
import {
	getPatternPermissionQuery,
	getUserPermissionQuery,
} from '../../modules/permissionQueries';
// arrow functions lose "this" context
/* eslint-disable func-names */
/* eslint-disable prefer-arrow-callback */

// don't allow users to edit their profile
// https://docs.meteor.com/api/accounts.html
Meteor.users.deny({ 'update': () => true });

// note: if there is ever a need to publish nothing when the user is not logged in, the function should return explicitly like this:
/*
if (!this.userId) {
	this.ready();
	return;
}
*/
// this is so we can test behaviour when user is not logged in: PublicationCollector passes in undefined userId, and find() is inconsistent between Meteor and MongoDB on undefined

// Meteor._sleepForMs(3000); // simulate server delay in a publish function

// //////////////////////////
// Color books

const ColorBooksFields = {
	'colors': 1,
	'createdAt': 1,
	'createdBy': 1,
	'isPublic': 1,
	'name': 1,
	'nameSort': 1,
};

Meteor.publish('colorBooks', function (userId) {
	check(userId, Match.Maybe(nonEmptyStringCheck));

	// color books created by a particular user
	if (userId) {
		return ColorBooks.find(
			{
				'$and': [
					getPatternPermissionQuery(),
					{ 'createdBy': userId },
				],
			},
			{
				'fields': ColorBooksFields,
				'sort': { 'nameSort': 1 },
			},
		);
	}

	// all color books the user can see
	return ColorBooks.find(
		getPatternPermissionQuery(),
		{
			'fields': ColorBooksFields,
			'sort': { 'nameSort': 1 },
		},
	);
});

// //////////////////////////
// Patterns

// limited fields for all patterns
const patternsFields = {
	'createdAt': 1,
	'createdBy': 1,
	'description': 1,
	'holes': 1,
	'isPublic': 1,
	'name': 1,
	'nameSort': 1,
	'numberOfRows': 1,
	'numberOfTablets': 1,
	'patternType': 1,
	'tags': 1,
};

// additional fields for individual pattern
const patternFields = {
	...patternsFields,
	...{
		'holeHandedness': 1,
		'orientations': 1,
		'palette': 1,
		'patternDesign': 1,
		'previewOrientation': 1,
		'threading': 1,
		'threadingNotes': 1,
		'weavingNotes': 1,
		'weftColor': 1,
	},
};

// ////////////////////////////////
// All patterns
Meteor.publish('patterns', function ({
	filterMaxTablets,
	filterMinTablets,
	skip = 0,
	limit = ITEMS_PER_PAGE,
}) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
	check(filterMinTablets, Match.Maybe(positiveIntegerCheck));
	check(limit, positiveIntegerCheck);
	check(skip, positiveIntegerCheck);

	return Patterns.find(
		{
			'$and': [
				getTabletFilter({ filterMaxTablets, filterMinTablets }),
				getPatternPermissionQuery(),
			],
		},
		{
			'fields': patternsFields,
			'sort': { 'nameSort': 1 },
			'skip': skip,
			'limit': limit,
		},
	);
});

Meteor.publish('patternsById', function (patternIds) {
	check(patternIds, [nonEmptyStringCheck]);

	return Patterns.find(
		{
			'$and': [
				{ '_id': { '$in': patternIds } },
				getPatternPermissionQuery(),
			],
		},
		{
			'fields': patternsFields,
		},
	);
});

// individual pattern
Meteor.publish('pattern', function (_id) {
	check(_id, nonEmptyStringCheck);

	return Patterns.find(
		{
			'$and': [
				{ _id },
				getPatternPermissionQuery(),
			],
		},
		{
			'fields': patternFields,
			'limit': 1,
		},
	);
});

// preview list for all patterns
// displayed on Home page
Meteor.publish('allPatternsPreview', function () {
	return Patterns.find(
		getPatternPermissionQuery(),
		{
			'fields': patternsFields,
			'limit': ITEMS_PER_PREVIEW_LIST,
			'sort': { 'nameSort': 1 },
		},
	);
});

// ////////////////////////////////
// My patterns
Meteor.publish('myPatterns', function ({
	filterMaxTablets,
	filterMinTablets,
	skip = 0,
	limit = ITEMS_PER_PAGE,
}) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
	check(filterMinTablets, Match.Maybe(positiveIntegerCheck));
	check(limit, positiveIntegerCheck);
	check(skip, positiveIntegerCheck);

	if (this.userId) {
		return Patterns.find(
			{
				'$and': [
					getTabletFilter({ filterMaxTablets, filterMinTablets }),
					{ 'createdBy': this.userId },
				],
			},
			{
				'fields': patternsFields,
				'sort': { 'nameSort': 1 },
				'skip': skip,
				'limit': limit,
			},
		);
	}

	this.ready();
});

// preview list for my patterns
// displayed on Home page
Meteor.publish('myPatternsPreview', function () {
	if (this.userId) {
		return Patterns.find(
			{ 'createdBy': this.userId },
			{
				'fields': patternsFields,
				'limit': ITEMS_PER_PREVIEW_LIST,
				'sort': { 'nameSort': 1 },
			},
		);
	}

	this.ready();
});

// ////////////////////////////////
// New patterns
// returns all patterns, but sorted by creation date
Meteor.publish('newPatterns', function ({
	filterMaxTablets,
	filterMinTablets,
	skip = 0,
	limit = ITEMS_PER_PAGE,
}) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
	check(filterMinTablets, Match.Maybe(positiveIntegerCheck));
	check(limit, positiveIntegerCheck);
	check(skip, positiveIntegerCheck);

	return Patterns.find(
		{
			'$and': [
				getTabletFilter({ filterMaxTablets, filterMinTablets }),
				getPatternPermissionQuery(),
			],
		},
		{
			'fields': patternsFields,
			'sort': { 'createdAt': -1 },
			'skip': skip,
			'limit': limit,
		},
	);
});

// preview list for new patterns
// displayed on Home page
// only public patterns to reduce overlap with Recents
Meteor.publish('newPatternsPreview', function () {
	return Patterns.find(
		{ 'isPublic': { '$eq': true } },
		{
			'fields': patternsFields,
			'limit': ITEMS_PER_PREVIEW_LIST,
			'sort': { 'createdAt': -1 },
		},
	);
});

// patterns cretaed by a user
Meteor.publish('userPatterns', function ({
	filterMaxTablets,
	filterMinTablets,
	skip = 0,
	limit = ITEMS_PER_PAGE,
	userId,
}) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
	check(filterMinTablets, Match.Maybe(positiveIntegerCheck));
	check(limit, positiveIntegerCheck);
	check(skip, positiveIntegerCheck);
	check(userId, nonEmptyStringCheck);

	return Patterns.find(
		{
			'$and': [
				getTabletFilter({ filterMaxTablets, filterMinTablets }),
				{ 'createdBy': userId },
				getPatternPermissionQuery(),
			],
		},
		{
			'fields': patternsFields,
			'sort': { 'nameSort': 1 },
			'skip': skip,
			'limit': limit,
		},
	);
});

// //////////////////////////
// Pattern preview graphics

Meteor.publish('patternPreviews', function ({ patternIds }) {
	// we previously explicitly returned nothing when user was not logged in
	// this is so we can test behaviour when user is not logged in: PublicationCollector passes in undefined userId, and find() is inconsistent between Meteor and MongoDB on undefined
	check(patternIds, [String]);

	if (patternIds.length === 0) {
		this.ready();
		return;
	}

	// find the patterns the user can see
	// and that are in the array passed in
	const patterns = Patterns.find(
		{
			'$and': [
				{ '_id': { '$in': patternIds } },
				getPatternPermissionQuery(),
			],
		},
		{
			'fields': {},
		},
	).fetch();

	// extract their _ids as an array
	const targetPatternIds = patterns.map((pattern) => pattern._id);

	// find the previews for those patterns
	return PatternPreviews.find(
		{ 'patternId': { '$in': targetPatternIds } },
	);
});

// Public information about particular users
Meteor.publish('users', function (userIds) {
	if (userIds.length === 0) {
		this.ready();
		return;
	}

	check(userIds, [String]);

	if (userIds.length === 0) {
		this.ready();
		return;
	}

	// return those users with public color books or patterns
	// whose ids are in the array passed in
	return Meteor.users.find(
		{
			'$and': [
				getUserPermissionQuery(),
				{ '_id': { '$in': userIds } },
			],
		},
		{
			'fields': USER_FIELDS,
		},
	);
});

// preview list for users
// displayed on Home page
Meteor.publish('allUsersPreview', function () {
	return Meteor.users.find(
		getUserPermissionQuery(),
		{
			'fields': USER_FIELDS,
			'limit': ITEMS_PER_PREVIEW_LIST,
			'sort': { 'nameSort': 1 },
		},
	);
});

// Pattern Images that have been uploaded by the pattern's owner
// Show images for a particular pattern
Meteor.publish('patternImages', function (patternId) {
	check(patternId, nonEmptyStringCheck);

	const pattern = Patterns.findOne(
		{ '_id': patternId },
		{ 'fields': { 'createdBy': 1, 'isPublic': 1 } },
	);

	if (!pattern) {
		this.ready();
		return;
	}

	if (!pattern.isPublic && pattern.createdBy !== this.userId) {
		this.ready();
		return;
	}

	return PatternImages.find({ patternId });
});

// all tags are public
Meteor.publish('tags', () => Tags.find());

// //////////////////////////
// Roles

Meteor.publish(null, function () {
	if (this.userId) {
		return Meteor.roleAssignment.find({ 'user._id': this.userId });
	}

	this.ready();
});
