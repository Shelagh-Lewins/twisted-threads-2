/* eslint-env mocha */

// the basic examples don't show how to catch async failure cases without an error: 'UnhandledPromiseRejectionWarning: AssertionError:'
// it seems publicationcollector is async
// I adapted a solution from https://staxmanade.com/2015/11/testing-asyncronous-code-with-mochajs-and-es7-async-await/

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'chai';
import '../../imports/server/modules/publications';
import {
	ColorBooks,
	Patterns,
	PatternPreviews,
} from '../../imports/modules/collection';
import { ITEMS_PER_PAGE, ITEMS_PER_PREVIEW_LIST } from '../../imports/modules/parameters';
import {
	createManyUsers,
	logOutButLeaveUser,
	stubNoUser,
	stubOtherUser,
	stubUser,
	unwrapUser,
} from './mockUser';
import {
	defaultColorBookData,
	defaultPatternData,
	defaultPatternPreviewData,
} from './testData';

// fields that should be published for patterns list
const patternsFields = [
	'_id',
	'createdAt',
	'createdBy',
	'description',
	'holes',
	'isPublic',
	'name',
	'nameSort',
	'numberOfRows',
	'numberOfTablets',
	'patternType',
	'tags',
];

// pattern fields that are generated programmatically so cannot be checked from default pattern data
const excludedPatternFields = [
	'_id',
	'createdAt',
	'createdBy',
];

// fields that should be published for individual pattern
const patternFields = patternsFields.concat([
	'holeHandedness',
	'orientations',
	'palette',
	'patternDesign',
	'previewOrientation',
	'threading',
	'threadingNotes',
	'weavingNotes',
	'weftColor',
]);

// it seems not to matter where factories are defined, but keep an eye on this.
Factory.define('user', Meteor.users, {
	'username': 'Jennifer',
	'emails': [{
		'address': 'jennifer@here.com',
		'verified': true,
	}],
	'publicPatternsCount': 0,
	'publicColorBooksCount': 0,
});

Factory.define('colorBook', ColorBooks, defaultColorBookData);

Factory.define('pattern', Patterns, defaultPatternData);

Factory.define('patternPreview', PatternPreviews, defaultPatternPreviewData);

let publicMyPatternNames;
let privateMyPatternNames;

let publicOtherPatternNames;
let privateOtherPatternNames;

const createManyPatterns = () => {
	Patterns.remove({});

	publicMyPatternNames = [];
	privateMyPatternNames = [];

	publicOtherPatternNames = [];
	privateOtherPatternNames = [];

	const numberOfMyPublicPatterns = 20;
	const numberOfMyPrivatePatterns = 15;
	const numberOfOtherPublicPatterns = 9;
	const numberOfOtherPrivatePatterns = 23;

	// patterns belonging to current user
	for (let i = 0; i < numberOfMyPublicPatterns; i += 1) {
		const name = `${i} my public pattern`;
		publicMyPatternNames.push(name);

		Factory.create('pattern', {
			'name': name,
			'nameSort': name,
			'createdBy': Meteor.user()._id,
			'isPublic': true,
		});
	}

	for (let i = 0; i < numberOfMyPrivatePatterns; i += 1) {
		const name = `${i} my private pattern`;
		privateMyPatternNames.push(name);

		Factory.create('pattern', {
			'name': name,
			'nameSort': name,
			'createdBy': Meteor.user()._id,
			'isPublic': false,
		});
	}

	// patterns belongiing to some other user
	for (let i = 0; i < numberOfOtherPublicPatterns; i += 1) {
		const name = `${i} other public pattern`;
		publicOtherPatternNames.push(name);

		Factory.create('pattern', {
			'name': name,
			'nameSort': name,
			'createdBy': 'xxx',
			'isPublic': true,
		});
	}

	for (let i = 0; i < numberOfOtherPrivatePatterns; i += 1) {
		const name = `${i} other private pattern`;
		privateOtherPatternNames.push(name);

		Factory.create('pattern', {
			'name': name,
			'nameSort': name,
			'createdBy': 'xxx',
			'isPublic': false,
		});
	}

	// make sure all patterns have different createdAt dates
	const now = new Date();
	let count = 0;

	Patterns.find().fetch().forEach((pattern) => {
		const newDate = pattern.createdAt.setSeconds(now.getSeconds() + (10 * count));
		Patterns.update({ '_id': pattern._id },
			{ '$set': { 'createdAt': newDate } });
		count += 1;
	});
};



if (Meteor.isServer) {
	describe('test publications', function () { // eslint-disable-line func-names
		this.timeout(5000);
		beforeEach(() => {
			resetDatabase();

			const currentUser = stubUser();

			this.pattern1 = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });
			this.pattern2 = Factory.create('pattern', { 'name': 'Pattern 2', 'createdBy': currentUser._id });
			this.colorBook = Factory.create('colorBook', { 'name': 'My book', 'createdBy': currentUser._id });

			Factory.create('patternPreview', { 'patternId': this.pattern1._id });
			Factory.create('patternPreview', { 'patternId': this.pattern2._id });
		});
		afterEach(() => {
			unwrapUser();
		});
		describe('publish patterns', () => {
			it('should publish nothing if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
			it('should publish public documents if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				Patterns.update(
					{ '_id': this.pattern1._id },
					{ '$set': { 'isPublic': true } },
				);

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
			it('should publish 2 documents if the user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 2);

				// check the published pattern
				const testPattern = result[0];

				assert.equal(testPattern.createdBy, Meteor.user()._id);

				// the required fields are published
				patternsFields.forEach((fieldName) => {
					assert.notEqual(testPattern[fieldName], undefined);
					// don't test the fields that are created programmatically
					if (excludedPatternFields.indexOf(fieldName) === -1) {
						// the values are correct
						// use stringify to compare arrays and objects
						assert.equal(JSON.stringify(testPattern[fieldName]), JSON.stringify(defaultPatternData[fieldName]));
					}
				});

				// no extra fields are published
				Object.keys(testPattern).forEach((fieldName) => {
					assert.include(patternsFields, fieldName);
				});
			});
			it('should publish 0 documents if a different user is logged in', async () => {
				// log in a different user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
		});
		describe('publish single pattern', () => {
			it('should publish nothing if user not logged in', async () => {
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('pattern',
						this.pattern1._id,
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
			it('should publish public documents if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				Patterns.update(
					{ '_id': this.pattern1._id },
					{ '$set': { 'isPublic': true } },
				);

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('pattern',
						this.pattern1._id,
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
			it('should publish the document if the user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('pattern',
						this.pattern1._id,
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);

				// check the published pattern
				const testPattern = result[0];

				assert.equal(testPattern.createdBy, Meteor.user()._id);

				// the required fields are published
				patternFields.forEach((fieldName) => {
					assert.notEqual(testPattern[fieldName], undefined);
					// don't test the fields that are created programmatically

					if (excludedPatternFields.indexOf(fieldName) === -1) {
						// the values are correct
						// use stringify to compare arrays and objects
						assert.equal(JSON.stringify(testPattern[fieldName]), JSON.stringify(defaultPatternData[fieldName]));
					}
				});

				// no extra fields are published
				Object.keys(testPattern).forEach((fieldName) => {
					assert.include(patternFields, fieldName);
				});
			});
			it('should publish nothing if a different user is logged in', async () => {
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('pattern',
						this.pattern1._id,
						(collections) => {
							resolve(collections.patterns.length);
						});
				});

				const result = await testPromise;

				assert.equal(result, 0);
			});
		});
		// /////////////////////////
		describe('publish patternsById', () => {
			it('should publish nothing if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternsById',
						[this.pattern1._id, this.pattern2._id],
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
			it('should publish public documents if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				Patterns.update(
					{ '_id': this.pattern1._id },
					{ '$set': { 'isPublic': true } },
				);

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patterns',
						[this.pattern1._id, this.pattern2._id],
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
			it('should publish 2 documents if the user is logged in', async () => {
				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternsById', [this.pattern1._id, this.pattern2._id],
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 2);
			});
			it('should publish 0 documents if no valid ids specified', async () => {
				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternsById', ['xxx'],
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
			it('should publish 0 documents if a different user is logged in', async () => {
				// log in a different user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternsById', [this.pattern1._id, this.pattern2._id],
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
		});
		// /////////////////////////
		describe('publish allPatternsPreview', () => {
			it('should publish only public patterns if user not logged in', async () => {
				createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('allPatternsPreview',
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const expectedNames = (publicMyPatternNames.concat(publicOtherPatternNames)).sort().slice(0, ITEMS_PER_PREVIEW_LIST);

				const result = await testPromise;

				// these should be the first patterns alphabetically
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
			it('should publish private and public patterns if the user is logged in', async () => {
				createManyPatterns();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('allPatternsPreview',
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(privateMyPatternNames).concat(publicOtherPatternNames);

				const expectedNames = allPatterns.sort().slice(0, ITEMS_PER_PREVIEW_LIST);
				const result = await testPromise;

				// these should be the first patterns alphabetically
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
			it('should publish only public patterns if a different user is logged in', async () => {
				createManyPatterns();

				// log in a different user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('allPatternsPreview',
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(publicOtherPatternNames);

				const expectedNames = allPatterns.sort().slice(0, ITEMS_PER_PREVIEW_LIST);

				const result = await testPromise;

				// these should be the first patterns alphabetically
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
		});
		// /////////////////////////
		describe('publish myPatterns', () => {
			it('should publish nothing if user not logged in', async () => {
				createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('myPatterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result, undefined); // this.ready() returns undefined
			});
			it('should publish all the user\'s patterns if the user is logged in', async () => {
				createManyPatterns();

				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('myPatterns', { 'limit': 100 },
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, publicMyPatternNames.length + privateMyPatternNames.length);
			});
			it('should respect limit if the user is logged in', async () => {
				createManyPatterns();
				const limit = 5;

				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('myPatterns', { 'limit': limit },
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const expectedNames = (publicMyPatternNames.concat(privateMyPatternNames)).sort().slice(0, limit);

				const result = await testPromise;

				// these should be the first patterns alphabetically
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, limit);
			});
			it('should publish nothing if a different user is logged in', async () => {
				createManyPatterns();

				// log in a different user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('myPatterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result, undefined); // this.ready() returns undefined
			});
		});
		// /////////////////////////
		describe('publish myPatternsPreview', () => {
			it('should publish nothing if user not logged in', async () => {
				createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('myPatternsPreview', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result, undefined); // this.ready() returns undefined
			});
			it('should publish the user\'s patterns if the user is logged in', async () => {
				createManyPatterns();

				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('myPatternsPreview', { 'limit': 100 },
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(privateMyPatternNames);
				const expectedNames = allPatterns.sort().slice(0, ITEMS_PER_PREVIEW_LIST);
				const result = await testPromise;

				// these should be the first patterns alphabetically
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
			it('should publish nothing if a different user is logged in', async () => {
				createManyPatterns();

				// log in a different user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('myPatternsPreview', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result, undefined); // this.ready() returns undefined
			});
		});
		// /////////////////////////
		describe('publish newPatterns', () => {
			it('should publish only public patterns if user not logged in', async () => {
				createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(publicOtherPatternNames);

				const allPatternsObjs = Patterns.find(
					{ 'name': { '$in': allPatterns } },
					{
						'sort': { 'createdAt': -1 },
						'fields': { 'nameSort': 1, 'createdAt': 1 },
					},
				).fetch();
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ITEMS_PER_PAGE);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PAGE);
			});
			it('should publish public and user\'s own patterns if user is logged in', async () => {
				createManyPatterns();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(publicOtherPatternNames).concat(privateMyPatternNames);

				const allPatternsObjs = Patterns.find(
					{ 'name': { '$in': allPatterns } },
					{
						'sort': { 'createdAt': -1 },
						'fields': { 'nameSort': 1, 'createdAt': 1 },
					},
				).fetch();
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ITEMS_PER_PAGE);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PAGE);
			});
			it('should respect skip', async () => {
				createManyPatterns();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatterns', { 'skip': ITEMS_PER_PAGE },
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(publicOtherPatternNames).concat(privateMyPatternNames);

				const allPatternsObjs = Patterns.find(
					{ 'name': { '$in': allPatterns } },
					{
						'sort': { 'createdAt': -1 },
						'fields': { 'nameSort': 1, 'createdAt': 1 },
					},
				).fetch();
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(ITEMS_PER_PAGE, ITEMS_PER_PAGE * 2);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PAGE);
			});
			it('should publish only public patterns if a different user is logged in', async () => {
				createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatterns', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(publicOtherPatternNames);

				const allPatternsObjs = Patterns.find(
					{ 'name': { '$in': allPatterns } },
					{
						'sort': { 'createdAt': -1 },
						'fields': { 'nameSort': 1, 'createdAt': 1 },
					},
				).fetch();
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ITEMS_PER_PAGE);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PAGE);
			});
		});
		// /////////////////////////
		describe('publish newPatternsPreview', () => {
			it('should publish only public patterns if user not logged in', async () => {
				createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatternsPreview', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(publicOtherPatternNames);

				const allPatternsObjs = Patterns.find(
					{ 'name': { '$in': allPatterns } },
					{
						'sort': { 'createdAt': -1 },
						'fields': { 'nameSort': 1, 'createdAt': 1 },
					},
				).fetch();
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ITEMS_PER_PREVIEW_LIST);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
			it('should publish public and user\'s own patterns if user is logged in', async () => {
				createManyPatterns();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatternsPreview', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(publicOtherPatternNames).concat(privateMyPatternNames);

				const allPatternsObjs = Patterns.find(
					{ 'name': { '$in': allPatterns } },
					{
						'sort': { 'createdAt': -1 },
						'fields': { 'nameSort': 1, 'createdAt': 1 },
					},
				).fetch();
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ITEMS_PER_PREVIEW_LIST);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
			it('should publish only public patterns if a different user is logged in', async () => {
				createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatternsPreview', {},
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(publicOtherPatternNames);

				const allPatternsObjs = Patterns.find(
					{ 'name': { '$in': allPatterns } },
					{
						'sort': { 'createdAt': -1 },
						'fields': { 'nameSort': 1, 'createdAt': 1 },
					},
				).fetch();
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ITEMS_PER_PREVIEW_LIST);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
		});
		// /////////////////////////
		describe('publish userPatterns', () => {
			it('should publish all the user\'s patterns if the user is logged in', async () => {
				createManyPatterns();

				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('userPatterns', { 'userId': Meteor.userId() },
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const allPatterns = publicMyPatternNames.concat(privateMyPatternNames);
				const expectedNames = allPatterns.sort().slice(0, ITEMS_PER_PREVIEW_LIST);
				const result = await testPromise;

				// these should be the first patterns alphabetically
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PAGE);
			});
			it('should publish only public patterns if the user is not logged in', async () => {
				createManyPatterns();
				const userId = Meteor.userId();

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('userPatterns', { userId },
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const expectedNames = publicMyPatternNames.sort().slice(0, ITEMS_PER_PREVIEW_LIST);
				const result = await testPromise;

				// these should be the first patterns alphabetically
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ITEMS_PER_PAGE);
			});
		});
		// /////////////////////////
		describe('publish color books', () => {
			it('should publish nothing if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('colorBooks',
						(collections) => {
							resolve(collections.colorBooks);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
			it('should publish the document if the user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('colorBooks',
						Meteor.user()._id,
						(collections) => {
							resolve(collections.colorBooks);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);

				// all fields should be published
				// TODO update this when color books can be made private / public
			});
			it('should publish 0 documents if a different user is logged in', async () => {
				// log in a different user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector({ 'userId': 'xxx' });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('colorBooks',
						(collections) => {
							resolve(collections.colorBooks.length);
						});
				});

				const result = await testPromise;

				assert.equal(result, 0);
			});
			it('should publish public documents if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				ColorBooks.update(
					{ '_id': this.colorBook._id },
					{ '$set': { 'isPublic': true } },
				);

				ColorBooks.findOne({ '_id': this.colorBook._id });

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('colorBooks',
						(collections) => {
							resolve(collections.colorBooks);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
			it('should publish public documents if a different user is logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubUser();

				ColorBooks.update(
					{ '_id': this.colorBook._id },
					{ '$set': { 'isPublic': true } },
				);

				ColorBooks.findOne({ '_id': this.colorBook._id });

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('colorBooks',
						(collections) => {
							resolve(collections.colorBooks);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
		});
		// /////////////////////////
		describe('publish pattern previews', () => {
			it('should publish nothing if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternPreviews', { 'patternIds': [this.pattern1._id] },
						(collections) => {
							resolve(collections.patternPreviews);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
			it('should publish preview for public pattern if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				Patterns.update(
					{ '_id': this.pattern1._id },
					{ '$set': { 'isPublic': true } },
				);

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternPreviews', { 'patternIds': [this.pattern1._id] },
						(collections) => {
							resolve(collections.patternPreviews);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
				assert.equal(result[0].patternId, this.pattern1._id);
			});
			it('should publish preview if user is logged in', async () => {
				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternPreviews', { 'patternIds': [this.pattern1._id, this.pattern2._id] },
						(collections) => {
							resolve(collections.patternPreviews);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 2);
			});
		});
		// /////////////////////////
		describe('publish users', () => {
			it('should publish nothing if user not logged in and no public patterns', async () => {
				const userId = Meteor.userId();

				// make sure publications know there is no user
				logOutButLeaveUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('users', [userId],
						(collections) => {
							resolve(collections.users);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
			it('should publish user if user not logged in and user has a public pattern', async () => {
				const userId = Meteor.userId();

				// make sure publications know there is no user
				logOutButLeaveUser();

				Meteor.users.update(
					{ '_id': userId },
					{ '$set': { 'publicPatternsCount': 1 } },
				);

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('users', [userId],
						(collections) => {
							resolve(collections.users);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
			it('should publish user if user not logged in and user has a public color book', async () => {
				const userId = Meteor.userId();

				// make sure publications know there is no user
				logOutButLeaveUser();

				Meteor.users.update(
					{ '_id': userId },
					{ '$set': { 'publicColorBooksCount': 1 } },
				);

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('users', [userId],
						(collections) => {
							resolve(collections.users);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
			it('should publish nothing if other user logged in and user has no public patterns', async () => {
				const userId = Meteor.userId();

				// log in other user
				stubOtherUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('users', [userId],
						(collections) => {
							resolve(collections.users);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
		});
		// /////////////////////////
		describe('publish allUsersPreview', () => {
			it('should publish users with public patterns if user not logged in', async () => {
				const {
					publicPatternUserIds,
					privatePatternUserIds,
					numberOfUsersWithPublicPatterns,
					numberOfUsersWithPrivatePatterns,
					publicPatternUsernames,
				} = createManyUsers();

				// make sure publications know there is no user
				logOutButLeaveUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('allUsersPreview',
						(collections) => {
							resolve(collections.users);
						});
				});
				const expectedUsernames = publicPatternUsernames.sort().slice(0, ITEMS_PER_PREVIEW_LIST);
				const result = await testPromise;

				// these should be the first usernames alphabetically
				result.forEach((user) => {
					assert.notEqual(expectedUsernames.indexOf(user.username), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
			it('should publish users with public patterns if user is logged in', async () => {
				const {
					publicPatternUserIds,
					privatePatternUserIds,
					numberOfUsersWithPublicPatterns,
					numberOfUsersWithPrivatePatterns,
					publicPatternUsernames,
				} = createManyUsers();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('allUsersPreview',
						(collections) => {
							resolve(collections.users);
						});
				});
				const expectedUsernames = publicPatternUsernames.sort().slice(0, ITEMS_PER_PREVIEW_LIST);
				const result = await testPromise;

				// these should be the first usernames alphabetically
				result.forEach((user) => {
					assert.notEqual(expectedUsernames.indexOf(user.username), -1);
				});

				assert.equal(result.length, ITEMS_PER_PREVIEW_LIST);
			});
		});
	});
}

// TODO
// allUsersPreview
// patternImages
// in methods, users for pagination