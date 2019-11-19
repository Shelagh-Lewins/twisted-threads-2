/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import { Patterns } from '../../imports/collection';
import '../publications';
import '../methods';
import { stubUser, unwrapUser } from './mockUser';
import { defaultPatternData } from './testData';

if (Meteor.isServer) {
	describe('test methods', () => {
		beforeEach(() => {
			resetDatabase();
		});
		describe('addPattern method', () => {
			it('cannot create pattern if not logged in', () => {
				function expectedError() {
					Meteor.call('addPattern', defaultPatternData);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-pattern-not-logged-in');
			});
			it('cannot create pattern if not verified', () => {
				function expectedError() {
					stubUser({
						'emails': [{
							'address': 'here@there.com',
							'verified': false,
						}],
					});

					Meteor.call('addPattern', defaultPatternData);
				}

				expect(expectedError).to.throw(Meteor.Error(), 'add-pattern-not-verified');
				unwrapUser();
			});
			it('can create pattern if verified', () => {
				assert.equal(Patterns.find().fetch().length, 0);

				stubUser({
					'emails': [{
						'address': 'here@there.com',
						'verified': true,
					}],
				});

				Meteor.call('addPattern', defaultPatternData);

				assert.equal(Patterns.find().fetch().length, 1);
				unwrapUser();
			});
		});
		describe('removePattern method', () => {
			it('cannot remove pattern if not logged in', () => {
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

				function expectedError() {
					Meteor.call('removePattern', pattern._id);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-pattern-not-logged-in');
			});
			it('cannot remove pattern if did not create the pattern', () => {
				function expectedError() {
					stubUser();

					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

					Meteor.call('removePattern', pattern._id);
				}

				expect(expectedError).to.throw(Meteor.Error(), 'remove-pattern-not-created-by-user');
				unwrapUser();
			});
			it('can remove pattern if user created the pattern', () => {
				const currentUser = stubUser();
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });

				assert.equal(Patterns.find().fetch().length, 1);
				Meteor.call('removePattern', pattern._id);
				assert.equal(Patterns.find().fetch().length, 0);
				unwrapUser();
			});
		});
		describe('getPatternCount method', () => {
			it('returns 2 when the user has 2 patterns in the database', () => {
				// getPatternCount should count the patterns the user can see, for pagination.

				// create patterns owned by other users
				Factory.create('pattern', { 'name': 'Other Pattern 1', 'createdBy': 'abc' });
				Factory.create('pattern', { 'name': 'Other Pattern 2', 'createdBy': 'def' });
				Factory.create('pattern', { 'name': 'Other Pattern 3', 'createdBy': 'ghic' });

				// create patterns owned by the current user
				const currentUser = stubUser();
				Factory.create('pattern', { 'name': 'My Pattern 1', 'createdBy': currentUser._id });
				Factory.create('pattern', { 'name': 'My Pattern 2', 'createdBy': currentUser._id });

				const result = Meteor.call('getPatternCount');
				assert.equal(result, 2);
				unwrapUser();
			});
		});
		describe('sendVerificationEmail method', () => {
			it('throws an error if the user is not logged in', () => {
				function expectedError() {
					Meteor.call('sendVerificationEmail', 'abc');
				}
				expect(expectedError).to.throw(Meteor.Error(), 'send-verification-email-not-logged-in');
			});
		});
	});
}
