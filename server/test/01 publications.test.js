/* eslint-env mocha */

// the basic examples don't show how to catch async failure cases without an error: 'UnhandledPromiseRejectionWarning: AssertionError:'
// it seems publicationcollector is async
// I adapted a solution from https://staxmanade.com/2015/11/testing-asyncronous-code-with-mochajs-and-es7-async-await/

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'chai';
import '../publications';
import { Patterns } from '../../imports/collection';
import { stubUser, unwrapUser } from './mockUser';
import { defaultPatternData } from './testData';

// fields that should be published for patterns list
const patternsFields = [
	'_id',
	'createdAt',
	'createdBy',
	'holes',
	'isPublic',
	'name',
	'nameSort',
	'patternType',
	'rows',
	'tablets',
];

// fields that should be published for individual pattern
const patternFields = patternsFields.concat([
	'orientations',
	'palette',
	'threading',
]);

// it seems not to matter where factories are defined, but keep an eye on this.
Factory.define('user', Meteor.users, {
	'username': 'Jennifer',
	'emails': [{
		'address': 'jennifer@here.com',
		'verified': true,
	}],
});

Factory.define('pattern', Patterns, defaultPatternData);

if (Meteor.isServer) {
	describe('test publications', () => {
		beforeEach(() => {
			resetDatabase();

			const currentUser = stubUser();

			this.pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });
			Factory.create('pattern', { 'name': 'Pattern 2', 'createdBy': currentUser._id });
		});
		afterEach(() => {
			unwrapUser();
		});
		describe('publish patterns', () => {
			it('should publish nothing if user not logged in', async () => {
				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patterns',
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result, undefined);
			});
			it('should publish 2 documents if the user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patterns',
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 2);

				// check the published pattern
				const testPattern = result[0];

				// the values are correct
				assert.equal(testPattern.holes, defaultPatternData.holes);
				assert.equal(testPattern.isPublic, defaultPatternData.isPublic);
				assert.equal(testPattern.name, defaultPatternData.name);
				assert.equal(testPattern.patternType, defaultPatternData.patternType);
				assert.equal(testPattern.rows, defaultPatternData.rows);
				assert.equal(testPattern.tablets, defaultPatternData.tablets);

				// the required fields are published
				patternsFields.forEach((fieldName) => {
					assert.notEqual(testPattern[fieldName], undefined);
				});

				// no extra fields are published
				Object.keys(testPattern).forEach((fieldName) => {
					assert.include(patternsFields, fieldName);
				});
			});
			it('should publish 0 documents if a different user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': 'xxx' });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('patterns',
						(collections) => {
							resolve(collections.patterns.length);
						});
				});

				const result = await testPromise;

				assert.equal(result, 0);
			});
		});
		describe('publish single pattern', () => {
			it('should publish nothing if user not logged in', async () => {
				const collector = new PublicationCollector();

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('pattern',
						this.pattern._id,
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result, undefined);
			});
			it('should publish the document if the user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': Meteor.user()._id });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('pattern',
						this.pattern._id,
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);

				// check the published pattern
				const testPattern = result[0];

				// the values are correct
				assert.equal(testPattern.holes, defaultPatternData.holes);
				assert.equal(testPattern.name, defaultPatternData.name);
				assert.equal(testPattern.patternType, defaultPatternData.patternType);
				assert.equal(testPattern.rows, defaultPatternData.rows);
				assert.equal(testPattern.tablets, defaultPatternData.tablets);

				// the required fields are published
				patternsFields.forEach((fieldName) => {
					assert.notEqual(testPattern[fieldName], undefined);
				});

				// no extra fields are published
				Object.keys(testPattern).forEach((fieldName) => {
					assert.include(patternFields, fieldName);
				});
			});
			it('should publish nothing if a different user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': 'xxx' });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('pattern',
						this.pattern._id,
						(collections) => {
							resolve(collections.patterns.length);
						});
				});

				const result = await testPromise;

				assert.equal(result, 0);
			});
		});
	});
}
