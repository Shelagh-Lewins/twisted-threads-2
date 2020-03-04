/* eslint-env mocha */

// the basic examples don't show how to catch async failure cases without an error: 'UnhandledPromiseRejectionWarning: AssertionError:'
// it seems publicationcollector is async
// I adapted a solution from https://staxmanade.com/2015/11/testing-asyncronous-code-with-mochajs-and-es7-async-await/

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'chai';
import '../../imports/server/modules/publications';
import { ColorBooks, Patterns } from '../../imports/modules/collection';
import { stubNoUser, stubUser, unwrapUser } from './mockUser';
import { defaultColorBookData, defaultPatternData } from './testData';

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
});

Factory.define('colorBook', ColorBooks, defaultColorBookData);

Factory.define('pattern', Patterns, defaultPatternData);

if (Meteor.isServer) {
	describe('test publications', () => {
		beforeEach(() => {
			resetDatabase();

			const currentUser = stubUser();

			this.pattern1 = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });
			this.pattern2 = Factory.create('pattern', { 'name': 'Pattern 2', 'createdBy': currentUser._id });
			this.colorBook = Factory.create('colorBook', { 'name': 'My book', 'createdBy': currentUser._id });
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
					collector.collect('patternsById', [this.pattern1._id, this.pattern2._id],
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 0);
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
	});
}

// TODO
// allPatternsPreview
// myPatterns
// myPatternsPreview
// newPatterns
// newPatternsPreview
// userPatterns
// patternPreviews
// users
// allUsersPreview
// patternImages
// in methods, users for pagination