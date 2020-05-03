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
	PatternImages,
	Patterns,
	PatternPreviews,
	Sets,
} from '../../imports/modules/collection';
import { ALLOWED_ITEMS_PER_PAGE, ITEMS_PER_PREVIEW_LIST } from '../../imports/modules/parameters';
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
	defaultPatternImageData,
	defaultPatternPreviewData,
	defaultSetData,
} from './testData';
import createManyPatterns from './createManyPatterns';

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
	'nameSort': 'jennifer',
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

Factory.define('patternImage', PatternImages, defaultPatternImageData);

Factory.define('set', Sets, defaultSetData);

if (Meteor.isServer) {
	describe('test publications', function () { // eslint-disable-line func-names
		this.timeout(15000);
		beforeEach(() => {
			resetDatabase();

			const currentUser = stubUser();

			this.pattern1 = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });
			this.pattern2 = Factory.create('pattern', { 'name': 'Pattern 2', 'createdBy': currentUser._id });
			this.colorBook = Factory.create('colorBook', { 'name': 'My book', 'createdBy': currentUser._id });

			// pattern previews
			Factory.create('patternPreview', { 'patternId': this.pattern1._id });
			Factory.create('patternPreview', { 'patternId': this.pattern2._id });

			// pattern images
			Factory.create('patternImage', { 'patternId': this.pattern1._id });
			Factory.create('patternImage', { 'patternId': this.pattern2._id });

			// put two patterns in a set
			this.set1 = Factory.create('set', {
				'createdBy': currentUser._id,
				'patterns': [this.pattern1._id, this.pattern2._id],
			});

			// this would be done automatically if we used the method
			Patterns.update(
				{ '_id': { '$in': [this.pattern1._id, this.pattern2._id] } },
				{ '$set': { 'sets': [this.set1._id] } },
				{ 'multi': true },
			);
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
					collector.collect('patterns',
						{ 'limit': ALLOWED_ITEMS_PER_PAGE[0] },
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
						{ 'limit': ALLOWED_ITEMS_PER_PAGE[0] },
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
					collector.collect('patterns',
						{ 'limit': ALLOWED_ITEMS_PER_PAGE[0] },
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
					collector.collect('patterns',
						{ 'limit': ALLOWED_ITEMS_PER_PAGE[0] },
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
			it('should publish public document if user not logged in', async () => {
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
					collector.collect('patternsById',
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
				const {
					publicMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

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
				const {
					publicMyPatternNames,
					privateMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

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
				const {
					publicMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

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
				const {
					publicMyPatternNames,
					privateMyPatternNames,
				} = createManyPatterns();

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
				const {
					publicMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatterns',
						{ 'limit': ALLOWED_ITEMS_PER_PAGE[0] },
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
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ALLOWED_ITEMS_PER_PAGE[0]);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
			});
			it('should publish public and user\'s own patterns if user is logged in', async () => {
				const {
					publicMyPatternNames,
					privateMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatterns',
						{ 'limit': ALLOWED_ITEMS_PER_PAGE[0] },
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
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ALLOWED_ITEMS_PER_PAGE[0]);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
			});
			it('should respect skip', async () => {
				const {
					publicMyPatternNames,
					privateMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatterns', {
						'limit': ALLOWED_ITEMS_PER_PAGE[0],
						'skip': ALLOWED_ITEMS_PER_PAGE[0],
					},
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
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(ALLOWED_ITEMS_PER_PAGE[0], ALLOWED_ITEMS_PER_PAGE[0] * 2);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
			});
			it('should publish only public patterns if a different user is logged in', async () => {
				const {
					publicMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

				// make sure publications know there is no user
				unwrapUser();
				stubUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('newPatterns',
						{ 'limit': ALLOWED_ITEMS_PER_PAGE[0] },
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
				const expectedNames = allPatternsObjs.map((pattern) => pattern.nameSort).slice(0, ALLOWED_ITEMS_PER_PAGE[0]);

				const result = await testPromise;

				// these should be the first patterns by createdAt
				result.forEach((pattern) => {
					assert.notEqual(expectedNames.indexOf(pattern.nameSort), -1);
				});

				assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
			});
		});
		// /////////////////////////
		describe('publish newPatternsPreview', () => {
			it('should publish only public patterns if user not logged in', async () => {
				const {
					publicMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

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
			it('should publish only public patterns if user is logged in', async () => {
				// the user's private patterns are not shown to avoid duplication in Recents with the user's new work
				const {
					publicMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

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
			it('should publish only public patterns if a different user is logged in', async () => {
				const {
					publicMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

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
				const {
					publicMyPatternNames,
					privateMyPatternNames,
				} = createManyPatterns();

				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('userPatterns',
						{
							'limit': ALLOWED_ITEMS_PER_PAGE[0],
							'userId': Meteor.userId(),
						},
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

				assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
			});
			it('should publish only public patterns if the user is not logged in', async () => {
				const {
					publicMyPatternNames,
				} = createManyPatterns();
				const userId = Meteor.userId();

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('userPatterns',
						{
							'limit': ALLOWED_ITEMS_PER_PAGE[0],
							userId,
						},
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

				assert.equal(result.length, ALLOWED_ITEMS_PER_PAGE[0]);
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
		// /////////////////////////
		describe('publish pattern images', () => {
			it('should publish nothing if user not logged in', async () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternImages', this.pattern1._id,
						(collections) => {
							resolve(collections.patternImages);
						});
				});

				const result = await testPromise;

				assert.equal(result, undefined);
			});
			it('should publish the preview if user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patternImages', this.pattern1._id,
						(collections) => {
							resolve(collections.patternImages);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
		});
		// /////////////////////////
		describe('publish setsForUser', () => {
			it('should publish 0 sets if user not logged in and no public sets exist', async () => {
				// make sure publications know there is no user
				const userId = Meteor.userId();

				unwrapUser();
				stubNoUser();

				// if no public patterns in set, publish nothing
				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('setsForUser', userId,
						(collections) => {
							resolve(collections.sets);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
			});
			it('should publish 1 set if user not logged in and there is 1 public set', async () => {
				// make sure publications know there is no user
				const userId = Meteor.userId();

				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(userId, ['verified']);

				// set 1 pattern in set to public
				Meteor.call('pattern.edit', {
					'_id': this.pattern1._id,
					'data': {
						'type': 'editIsPublic',
						'isPublic': true,
					},
				});

				unwrapUser();
				stubNoUser();

				// if 1 public pattern in set, publish 1 set
				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('setsForUser', userId,
						(collections) => {
							resolve(collections.sets);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1); // 1 set published

				// two patterns are listed as belonging to the set
				const patternsInSet = result[0].patterns;
				assert.equal(patternsInSet.length, 2);

				// only the public pattern is published to the logged out user
				const collector2 = new PublicationCollector();

				const testPromise2 = new Promise((resolve, reject) => {
					collector2.collect('patterns', { 'skip': 0, 'limit': 10 },
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result2 = await testPromise2;

				assert.equal(result2.length, 1); // 1 pattern is published
				assert.equal(result2[0]._id, this.pattern1._id, 1); // it is the public pattern
			});
			it('should publish 1 set if another user is logged in and there is 1 public set', async () => {
				// make sure publications know there is no user
				const userId = Meteor.userId();

				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(userId, ['verified']);

				// set 1 pattern in set to public
				Meteor.call('pattern.edit', {
					'_id': this.pattern1._id,
					'data': {
						'type': 'editIsPublic',
						'isPublic': true,
					},
				});

				// log in other user
				stubOtherUser();

				// if 1 public pattern in set, publish 1 set
				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('setsForUser', userId,
						(collections) => {
							resolve(collections.sets);
						});
				});


				const result = await testPromise;

				assert.equal(result.length, 1); // 1 set published

				// two patterns are listed as belonging to the set
				const patternsInSet = result[0].patterns;
				assert.equal(patternsInSet.length, 2);

				// only the public pattern is published to the logged out user
				const collector2 = new PublicationCollector();

				const testPromise2 = new Promise((resolve, reject) => {
					collector2.collect('patterns', { 'skip': 0, 'limit': 10 },
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result2 = await testPromise2;

				assert.equal(result2.length, 1); // 1 pattern is published
				assert.equal(result2[0]._id, this.pattern1._id, 1); // it is the public pattern
			});
			it('should publish 1 set if user logged in and their set is private', async () => {
				const userId = Meteor.userId();

				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('setsForUser', userId,
						(collections) => {
							resolve(collections.sets);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
			});
		});
	});
}

// Set tests notes
// should tag publish be tested? All tags are public.
// check operations work with multiple sets, e.g. delete a pattern that is in 2 sets
