/* eslint-env mocha */

// the basic examples don't show how to catch async failure cases without an error: 'UnhandledPromiseRejectionWarning: AssertionError:'
// it seems publicationcollector is async
// I adapted a solution from https://staxmanade.com/2015/11/testing-asyncronous-code-with-mochajs-and-es7-async-await/

import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert } from 'chai';
import '../publications';
import Patterns from '../../imports/collection';
import { stubUser, unwrapUser } from './mockUser';

Factory.define('user', Meteor.users, {
	'username': 'Jennifer',
	'emails': [{
		'address': 'jennifer@here.com',
		'verified': true,
	}],
});

Factory.define('pattern', Patterns, {
	'name': 'Pattern 1',
});

if (Meteor.isServer) {
	// PUBLICATIONS
	describe('test publications', () => {
		before(() => {
			resetDatabase();

			const currentUser = stubUser();

			this.firstDocument = Factory.create('pattern', { 'name': 'Pattern 1', 'created_by': currentUser._id });
			Factory.create('pattern', { 'name': 'Pattern 2', 'created_by': currentUser._id });
		});
		after(() => {
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
							resolve(collections.patterns.length);
						});
				});

				const result = await testPromise;

				assert.equal(result, 2);
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
						this.firstDocument._id,
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
						this.firstDocument._id,
						(collections) => {
							resolve(collections.patterns);
						});
				});

				const result = await testPromise;

				assert.equal(result.length, 1);
				assert.equal(result[0].name, this.firstDocument.name);
			});
			it('should publish nothing if a different user is logged in', async () => {
				const collector = new PublicationCollector({ 'userId': 'xxx' });

				const testPromise = new Promise((resolve, reject) => {
					collector.collect('pattern',
						this.firstDocument._id,
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
