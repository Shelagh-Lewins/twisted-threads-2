/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import Patterns from '../../imports/collection';
import '../publications';
import '../methods';
import { stubUser, unwrapUser } from './mockUser';

if (Meteor.isServer) {
	// METHODS
	describe('test methods', () => {
		beforeEach(() => {
			resetDatabase();
		});
		describe('addPattern method', () => {
			it('cannot create pattern if not logged in', () => {
				function expectedError() {
					Meteor.call('addPattern', 'my pattern');
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

					Meteor.call('addPattern', 'my pattern');
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

				Meteor.call('addPattern', 'my pattern');

				assert.equal(Patterns.find().fetch().length, 1);
				unwrapUser();
			});
		});
		describe('removePattern method', () => {
			it('cannot remove pattern if not logged in', () => {
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'created_by': 'abc' });

				function expectedError() {
					Meteor.call('removePattern', pattern._id);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-pattern-not-logged-in');
			});
			it('cannot remove pattern if did not create the pattern', () => {
				function expectedError() {
					stubUser();

					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'created_by': 'abc' });

					Meteor.call('removePattern', pattern._id);
				}

				expect(expectedError).to.throw(Meteor.Error(), 'remove-pattern-not-created-by-user');
				unwrapUser();
			});
			it('can remove pattern if user created the pattern', () => {
				const currentUser = stubUser();
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'created_by': currentUser._id });

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
				Factory.create('pattern', { 'name': 'Other Pattern 1', 'created_by': 'abc' });
				Factory.create('pattern', { 'name': 'Other Pattern 2', 'created_by': 'def' });
				Factory.create('pattern', { 'name': 'Other Pattern 3', 'created_by': 'ghic' });

				// create patterns owned by the current user
				const currentUser = stubUser();
				Factory.create('pattern', { 'name': 'My Pattern 1', 'created_by': currentUser._id });
				Factory.create('pattern', { 'name': 'My Pattern 2', 'created_by': currentUser._id });

				const result = Meteor.call('getPatternCount');
				assert.equal(result, 2);
				unwrapUser();
			});
		});
	});
}
