/* eslint-env mocha */

// the basic examples don't show how to catch async failure cases without an error: 'UnhandledPromiseRejectionWarning: AssertionError:'
// it seems publicationcollector is async
// I adapted a solution from https://staxmanade.com/2015/11/testing-asyncronous-code-with-mochajs-and-es7-async-await/

import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/dburles:factory';
import { PublicationCollector } from 'meteor/johanbrook:publication-collector';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { Random } from 'meteor/random';
import { assert } from 'chai';
import Patterns from '../imports/collection';

const sinon = require('sinon');


// import { addPattern } from './methods';
import './publications';

Factory.define('user', Meteor.users, {
	'name': 'Josephine',
});

Factory.define('pattern', Patterns, {
	'name': 'A pattern',
});

if (Meteor.isServer) {
	describe('patterns', () => {
		// PUBLICATIONS
		describe('publications', () => {
			before(() => {
				resetDatabase();

				const currentUser = Factory.create('user');
				sinon.stub(Meteor, 'user');
				Meteor.user.returns(currentUser); // now Meteor.user() will return the user we just created

				sinon.stub(Meteor, 'userId');
				Meteor.userId.returns(currentUser._id); // needed in methods

				Factory.create('pattern', { 'name': 'Pattern 1', 'created_by': currentUser._id });
				Factory.create('pattern', { 'name': 'Pattern 2', 'created_by': currentUser._id });
			});
			describe('publish patterns', () => {
				/* it('Using a Promise with async/await that resolves successfully with wrong expectation!', async () => {
					const testPromise = new Promise((resolve, reject) => {
						setTimeout(() => {
							resolve('Hello World!');
						}, 200);
					});

					const result = await testPromise;
					console.log('result', result);
					assert.equal(result, 'hello');
				}); */
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
				it('should publish 0 documents if a different is logged in', async () => {
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
		});
	});
}
