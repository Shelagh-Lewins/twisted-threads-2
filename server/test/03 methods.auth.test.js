/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import '../../imports/server/modules/publications';
import '../methods/auth';
import { stubUser, unwrapUser } from './mockUser';
import {
	addPatternDataIndividual,
} from './testData';

if (Meteor.isServer) {
	describe('test auth methods', function () { // eslint-disable-line func-names
		this.timeout(15000);
		beforeEach(() => {
			resetDatabase();
		});
		describe('sendVerificationEmail method', () => {
			it('throws an error if the user is not logged in', () => {
				function expectedError() {
					Meteor.call('auth.sendVerificationEmail', 'abc');
				}
				expect(expectedError).to.throw(Meteor.Error(), 'send-verification-email-not-logged-in');
			});
			it('throws an error if the users email address is verified', () => {
				const currentUser = stubUser();

				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['verified']);

				function expectedError() {
					Meteor.call('auth.sendVerificationEmail', currentUser._id);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'no unverified email');

				unwrapUser();
			});
			it('sends the email if the user is logged in and unverified', (done) => {
				const currentUser = stubUser();

				Meteor.users.update({ '_id': currentUser._id }, { '$set': { 'emails.0.verified': false } });

				Roles.createRole('verified', { 'unlessExists': true });
				Roles.removeUsersFromRoles(currentUser._id, ['verified']);

				Meteor.call('auth.sendVerificationEmail', currentUser._id, (error, result) => {
					assert.equal(result.email, currentUser.emails[0].address);
					done();
				});

				unwrapUser();
			});
		});
		describe('setRecentPatterns method', () => {
			it('throws an error if the user is not logged in', () => {
				function expectedError() {
					Meteor.call('auth.setRecentPatterns', {
						'userId': 'xxx',
						'newRecentPatterns': [],
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'set-recent-patterns-not-logged-in');
			});
			it('adds the recent pattern if the user is logged in', (done) => {
				const currentUser = stubUser();
				const patternId = Meteor.call('pattern.add', addPatternDataIndividual);

				Meteor.call('auth.setRecentPatterns', {
					'userId': currentUser._id,
					'newRecentPatterns': [{
						'currentWeavingRow': 2,
						'patternId': patternId,
						'updatedAt': new Date(),
					}],
				}, (error, result) => {
					const updated = Meteor.users.findOne({ '_id': currentUser._id });
					assert.equal(updated.profile.recentPatterns.length, 1);
					assert.equal(updated.profile.recentPatterns[0].currentWeavingRow, 2);
					assert.equal(error, undefined);
					done();
				});
			});
			// could check that invalid number of rows is rejected
			// could check that max number of recents is respected
		});
	});
}

// set recent patterns

// create user - is registered but nothing else

// check can create color book

// check can add pattern image

// get user count

// get users for page

// edit text field

// add to role

// remove from role