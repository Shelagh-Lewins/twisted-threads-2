/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import '../../imports/server/modules/publications';
import '../methods/auth';
import { stubUser, unwrapUser } from './mockUser';
import {
	addPatternDataIndividual,
} from './testData';
import { MAX_RECENTS } from '../../imports/modules/parameters';

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

				unwrapUser();
			});
			it('sets current weaving row to 1 if invalid', (done) => {
				const currentUser = stubUser();
				const patternId = Meteor.call('pattern.add', addPatternDataIndividual);

				Meteor.call('auth.setRecentPatterns', {
					'userId': currentUser._id,
					'newRecentPatterns': [{
						'currentWeavingRow': -1,
						'patternId': patternId,
						'updatedAt': new Date(),
					}],
				}, (error, result) => {
					const updated = Meteor.users.findOne({ '_id': currentUser._id });
					assert.equal(updated.profile.recentPatterns.length, 1);
					assert.equal(updated.profile.recentPatterns[0].currentWeavingRow, 1);
					assert.equal(error, undefined);
					done();
				});

				unwrapUser();
			});
			it('stores the maximum number of recents', (done) => {
				const currentUser = stubUser();
				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['verified']);

				const newRecentPatterns = [];
				const numberOfRecents = MAX_RECENTS + 5;
				const now = new Date();
				const initialDateAsString = now.toString();

				for (let i = 0; i < numberOfRecents; i += 1) {
					const patternId = Meteor.call('pattern.add', addPatternDataIndividual);
					now.setSeconds(now.getSeconds() - (10 * i));
					newRecentPatterns.push({
						'currentWeavingRow': 3,
						'patternId': patternId,
						'updatedAt': new Date(now),
					});
				}

				Meteor.call('auth.setRecentPatterns', {
					'userId': currentUser._id,
					newRecentPatterns,
				}, (error, result) => {
					const updated = Meteor.users.findOne({ '_id': currentUser._id });
					assert.equal(updated.profile.recentPatterns.length, MAX_RECENTS);

					// the most recent date is the first entry
					assert.equal(
						updated.profile.recentPatterns[0].updatedAt.toString(),
						initialDateAsString,
					);
					assert.equal(error, undefined);
					done();
				});

				unwrapUser();
			});
		});
		describe('register a new user', () => {
			// the tests that rely on Accounts.onCreateUser don't work because Accounts.onCreateUser doesn't run in testing.
			// There is a bug reported but closed:
			// https://github.com/meteor/meteor/issues/7395
			// I've tested this manually and it worked
			it('creates an account with the expected values', () => {
				// Roles.createRole('registered', { 'unlessExists': true });

				const userId = Accounts.createUser({
					'email': 'me@there.com',
					'username': 'NewUser',
					'password': '12345678',
				});

				const { emails, username } = Meteor.users.findOne({ '_id': userId });
				// const { emails, nameSort, username } = Meteor.users.findOne({ '_id': userId });

				assert.equal(emails[0].address, 'me@there.com');
				assert.equal(username, 'NewUser');
				// assert.equal(nameSort, 'NewUser'.toLowerCase());

				// const roles = Roles.getRolesForUser(userId);
				// console.log('in test roles', roles);

				// assert.equal(roles.length, 1);
			});
		});
	});
}

// check can create color book
// edit color book

// check can add pattern image

// get user count

// get users for page

// edit text field

// add to role

// remove from role