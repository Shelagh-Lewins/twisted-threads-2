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
		before(() => {
			resetDatabase();

			// this.firstDocument = Factory.create('pattern', { 'name': 'Pattern 1', 'created_by': currentUser._id });
			// Factory.create('pattern', { 'name': 'Pattern 2', 'created_by': currentUser._id });
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
	});
}
