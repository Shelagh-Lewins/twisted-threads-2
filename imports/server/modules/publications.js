import { check } from 'meteor/check';
import {
	ColorBooks,
	PatternImages,
	PatternPreviews,
	Patterns,
	Tags,
} from '../../modules/collection';
import { ITEMS_PER_PAGE, ITEMS_PER_PREVIEW_LIST } from '../../modules/parameters';
import {
	nonEmptyStringCheck,
	positiveIntegerCheck,
} from './utils';
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
					{
						'$or': [
							{ 'isPublic': { '$eq': true } },
							{ 'createdBy': this.userId },
						],
					},
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
	if (this.userId) {
		return ColorBooks.find(
			{
				'$or': [
					{ 'isPublic': { '$eq': true } },
					{ 'createdBy': this.userId },
				],
			},
			{
				'fields': ColorBooksFields,
				'sort': { 'nameSort': 1 },
			},
		);
	}

	return ColorBooks.find(
		{ 'isPublic': { '$eq': true } },
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
Meteor.publish('patterns', function (skip = 0, limit = ITEMS_PER_PAGE) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	check(skip, positiveIntegerCheck);

	// Meteor._sleepForMs(3000); // simulate server delay

	if (this.userId) {
		return Patterns.find(
			{
				'$or': [
					{ 'isPublic': { '$eq': true } },
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

	return Patterns.find(
		{ 'isPublic': { '$eq': true } },
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

	if (this.userId) {
		return Patterns.find(
			{
				_id,
				'$or': [
					{ 'isPublic': { '$eq': true } },
					{ 'createdBy': this.userId },
				],
			},
			{
				'fields': patternFields,
			},
		);
	}

	return Patterns.find(
		{
			_id,
			'isPublic': { '$eq': true },
		},
		{
			'fields': patternFields,
			'limit': 1,
		},
	);
});

// preview list for my patterns
// displayed on Home page
// and also used for full Recent Patterns page
// limited numbers of recent patterns are stored, they won't be paginated and don't need to be limited like All Patterns or All Users
// the list of recent patterns may be taken from the db if the user is logged in
// or provided by the client (from local storage) if not
Meteor.publish('recentPatterns', function (localStorageRecentPatterns) {
	check(localStorageRecentPatterns, Match.Maybe([Object]));

	// handle and transform allows the updatedAt field to be added to the pattern, from the recentPattern entry
	let recentPatternsList = [];
	let permissionQuery;

	if (this.userId) {
		const user = Meteor.users.findOne({ '_id': this.userId });
		recentPatternsList = user.profile.recentPatternsList;
		permissionQuery = {
			'$or': [
				{ 'isPublic': { '$eq': true } },
				{ 'createdBy': this.userId },
			],
		};
	} else {
		recentPatternsList = localStorageRecentPatterns;
		permissionQuery = { 'isPublic': { '$eq': true } };
	}

	const patternIds = recentPatternsList.map((pattern) => pattern.patternId);

	const transform = (pattern) => {
		const { updatedAt } = recentPatternsList.find(({ patternId }) => patternId === pattern._id);
		pattern.updatedAt = updatedAt;
		return pattern;
	};

	const fields = patternsFields;

	const self = this;

	const handle = Patterns.find(
		{
			'$and': [
				permissionQuery,
				{ '_id': { '$in': patternIds } },
			],
		},
		{
			'fields': fields,
			'sort': { 'updatedAt': 1 },
		},
	).observe({
		'added': function (pattern) {
			self.added('patterns', pattern._id, transform(pattern));
		},

		'changed': function (pattern) {
			self.changed('patterns', pattern._id, transform(pattern));
		},

		'removed': function (pattern) {
			self.removed('patterns', pattern._id);
		},
	});

	this.ready();

	this.onStop(function () {
		handle.stop();
	});

	this.ready();
});

// preview list for all patterns
// displayed on Home page
Meteor.publish('allPatternsPreview', function () {
	if (this.userId) {
		return Patterns.find(
			{
				'$or': [
					{ 'isPublic': { '$eq': true } },
					{ 'createdBy': this.userId },
				],
			},
			{
				'fields': patternsFields,
				'limit': ITEMS_PER_PREVIEW_LIST,
				'sort': { 'nameSort': 1 },
			},
		);
	}

	return Patterns.find(
		{
			'isPublic': { '$eq': true },
		},
		{
			'fields': patternsFields,
			'limit': ITEMS_PER_PREVIEW_LIST,
			'sort': { 'nameSort': 1 },
		},
	);
});

// ////////////////////////////////
// My patterns
Meteor.publish('myPatterns', function (skip = 0, limit = ITEMS_PER_PAGE) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	check(skip, positiveIntegerCheck);

	if (this.userId) {
		return Patterns.find(
			{ 'createdBy': this.userId },
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
Meteor.publish('newPatterns', function (skip = 0, limit = ITEMS_PER_PAGE) {
	// this needs to return the same number of patterns as the getPatternCount method, for pagination
	check(skip, positiveIntegerCheck);

	if (this.userId) {
		return Patterns.find(
			{
				'$or': [
					{ 'isPublic': { '$eq': true } },
					{ 'createdBy': this.userId },
				],
			},
			{
				'fields': patternsFields,
				'sort': { 'createdAt': -1 },
				'skip': skip,
				'limit': limit,
			},
		);
	}

	return Patterns.find(
		{ 'isPublic': { '$eq': true } },
		{
			'fields': patternsFields,
			'sort': { 'createdAt': -1 },
			'skip': skip,
			'limit': limit,
		},
	);
});

// preview list for my patterns
// displayed on Home page
Meteor.publish('newPatternsPreview', function () {
	if (this.userId) {
		return Patterns.find(
			{
				'$or': [
					{ 'isPublic': { '$eq': true } },
					{ 'createdBy': this.userId },
				],
			},
			{
				'fields': patternsFields,
				'limit': ITEMS_PER_PREVIEW_LIST,
				'sort': { 'createdAt': -1 },
			},
		);
	}

	return Patterns.find(
		{
			'isPublic': { '$eq': true },
		},
		{
			'fields': patternsFields,
			'limit': ITEMS_PER_PREVIEW_LIST,
			'sort': { 'createdAt': -1 },
		},
	);
});

// //////////////////////////
// Pattern preview graphics

Meteor.publish('patternPreviews', function ({ patternIds }) {
	// we previously explicitly returned nothing when user was not logged in
	// this is so we can test behaviour when user is not logged in: PublicationCollector passes in undefined userId, and find() is inconsistent between Meteor and MongoDB on undefined

	if (patternIds.length === 0) {
		this.ready();
		return;
	}

	// find the patterns the user can see
	// and that are in the array passed in
	const patterns = Patterns.find(
		{
			'$or': [
				{ 'isPublic': { '$eq': true } },
				{ 'createdBy': this.userId },
			],
			'_id': { '$in': patternIds },
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
	if (userIds[0] === null) {
		console.log('*** publish userIds', userIds);
		console.log('*** publish typeof userIds', typeof userIds);
	}
	if (userIds.length === 0) {
		this.ready();
		return;
	}

	check(userIds, [String]);

	if (userIds.length === 0) {
		this.ready();
		return;
	}

	// return those users with public patterns
	// whose ids are in the array passed in
	// note that all information is published automatically for the logged in user
	return Meteor.users.find(
		{
			'$or': [
				{ 'publicPatternsCount': { '$gt': 0 } },
				{ '_id': { '$in': userIds } },
			],
		},
		{
			'fields': {
				'_id': 1,
				'description': 1,
				'publicPatternsCount': 1,
				'username': 1,
			},
		},
	);
});

// ////////////////////////
// all users page
Meteor.publish('allUsers', function (skip = 0, limit = ITEMS_PER_PAGE) {
	// this needs to return the same number of patterns as the getUsersCount method, for pagination
	check(skip, positiveIntegerCheck);

	return Meteor.users.find(
		{
			'$or': [
				{ 'publicPatternsCount': { '$gt': 0 } },
				{ '_id': this.userId },
			],
		},
		{
			'fields': {
				'_id': 1,
				'publicPatternsCount': 1,
				'username': 1,
			},
			'sort': { 'username': 1 },
			'skip': skip,
			'limit': limit,
		},
	);
});

// preview list for users
// displayed on Home page
Meteor.publish('allUsersPreview', function () {
	return Patterns.find(
		{ 'publicPatternsCount': { '$gt': 0 } },
		{
			'fields': {
				'_id': 1,
				'publicPatternsCount': 1,
				'username': 1,
			},
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
		return;
	}

	if (!pattern.isPublic && pattern.createdBy !== this.userId) {
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
