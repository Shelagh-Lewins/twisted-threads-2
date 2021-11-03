/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import '../../imports/server/modules/publications';
import '../methods/auth';
import {
	createManyUsers,
	logOutButLeaveUser,
	stubOtherUser,
	stubUser,
	unwrapUser,
} from './mockUser';
import {
	addPatternDataIndividual,
} from './testData';
import { MAX_RECENTS, MAX_TEXT_AREA_LENGTH } from '../../imports/modules/parameters';

const sinon = require('sinon');

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
		describe('get user count', () => {
			// counts all users with public patterns
			// plus the user themselves if logged in
			it('returns the number of users with public patterns if the user is not logged in', () => {
				const {
					publicPatternUsernames,
				} = createManyUsers();

				const result = Meteor.call('auth.getUserCount');

				assert.equal(result, publicPatternUsernames.length);
			});
			it('returns the number of users with public patterns plus one for the user if the user is logged in', () => {
				const {
					privatePatternUserIds,
					publicPatternUsernames,
				} = createManyUsers();

				const currentUser = Meteor.users.findOne({ '_id': privatePatternUserIds[0] });
				sinon.stub(Meteor, 'user');
				Meteor.user.returns(currentUser); // now Meteor.user() will return the user we just created

				sinon.stub(Meteor, 'userId');
				Meteor.userId.returns(currentUser._id);

				const result = Meteor.call('auth.getUserCount');

				assert.equal(result, publicPatternUsernames.length + 1);
				unwrapUser();
			});
		});
		describe('get users for page', () => {
			// counts all users with public patterns
			// returns the number required for the page
			it('returns the users for the first page, user not logged in', () => {
				const {
					publicPatternUsernames,
				} = createManyUsers();

				const skip = 0;
				const limit = 10;

				const result = Meteor.call('auth.getUsersForPage', {
					skip,
					limit,
				});

				assert.equal(result.length, limit);

				const expectedUsernames = publicPatternUsernames.sort().slice(0, limit);

				expectedUsernames.forEach((username) => {
					assert.notEqual(expectedUsernames.indexOf(username), -1);
				});
			});
			it('returns the users for the second page, user not logged in', () => {
				const {
					publicPatternUsernames,
				} = createManyUsers();

				const skip = 10;
				const limit = 10;

				const result = Meteor.call('auth.getUsersForPage', {
					skip,
					limit,
				});

				assert.equal(result.length, limit);

				const expectedUsernames = publicPatternUsernames.sort().slice(limit, limit * 2);

				expectedUsernames.forEach((username) => {
					assert.notEqual(expectedUsernames.indexOf(username), -1);
				});
			});
			it('returns the users for the first page, user is logged in', () => {
				const {
					privatePatternUserIds,
					publicPatternUsernames,
				} = createManyUsers();

				const currentUser = Meteor.users.findOne({ '_id': privatePatternUserIds[0] });
				sinon.stub(Meteor, 'user');
				Meteor.user.returns(currentUser); // now Meteor.user() will return the user we just created

				sinon.stub(Meteor, 'userId');
				Meteor.userId.returns(currentUser._id);

				const skip = 0;
				const limit = 10;

				const result = Meteor.call('auth.getUsersForPage', {
					skip,
					limit,
				});

				assert.equal(result.length, limit);

				publicPatternUsernames.push(currentUser.username);

				const expectedUsernames = publicPatternUsernames.sort().slice(0, limit);

				expectedUsernames.forEach((username) => {
					assert.notEqual(expectedUsernames.indexOf(username), -1);
				});
				unwrapUser();
			});
			it('returns the users for the second page, user is logged in', () => {
				const {
					privatePatternUserIds,
					publicPatternUsernames,
				} = createManyUsers();

				const currentUser = Meteor.users.findOne({ '_id': privatePatternUserIds[0] });
				sinon.stub(Meteor, 'user');
				Meteor.user.returns(currentUser); // now Meteor.user() will return the user we just created

				sinon.stub(Meteor, 'userId');
				Meteor.userId.returns(currentUser._id);

				const skip = 10;
				const limit = 10;

				const result = Meteor.call('auth.getUsersForPage', {
					skip,
					limit,
				});

				assert.equal(result.length, limit);

				publicPatternUsernames.push(currentUser.username);

				const expectedUsernames = publicPatternUsernames.sort().slice(limit, limit * 2);

				expectedUsernames.forEach((username) => {
					assert.notEqual(expectedUsernames.indexOf(username), -1);
				});
				unwrapUser();
			});
		});
		describe('edit text field', () => {
			// the only  editable field for user is description
			it('cannot edit description if they are not logged in', () => {
				function expectedError() {
					Meteor.call('auth.editTextField', {
						'_id': 'xxx',
						'fieldName': 'description',
						'fieldValue': 'someText',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-text-field-not-logged-in');
			});
			it('cannot edit description of a different user', () => {
				function expectedError() {
					const currentUser = stubUser();
					stubOtherUser();

					Meteor.call('auth.editTextField', {
						'_id': currentUser._id,
						'fieldName': 'description',
						'fieldValue': 'someText',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-text-field-not-logged-in');
				unwrapUser();
			});
			it('cannot edit a different field if they are logged in', () => {
				const currentUser = stubUser();

				function expectedError() {
					Meteor.call('auth.editTextField', {
						'_id': currentUser._id,
						'fieldName': 'thingy',
						'fieldValue': 'someText',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-text-field-not-allowed');
				unwrapUser();
			});
			it('can edit description if they are logged in', () => {
				const currentUser = stubUser();
				assert.equal(currentUser.description, undefined);
				const newDescription = 'Some text';

				Meteor.call('auth.editTextField', {
					'_id': currentUser._id,
					'fieldName': 'description',
					'fieldValue': newDescription,
				});

				const updated = Meteor.users.findOne({ '_id': currentUser._id });

				assert.equal(updated.description, newDescription);

				unwrapUser();
			});
			it('cannot set a value that is too long', () => {
				const currentUser = stubUser();
				assert.equal(currentUser.description, undefined);
				let newDescription = '';

				for (let i = 0; i < MAX_TEXT_AREA_LENGTH; i += 1) {
					newDescription += 'a';
				}

				Meteor.call('auth.editTextField', {
					'_id': currentUser._id,
					'fieldName': 'description',
					'fieldValue': newDescription,
				});

				const updated = Meteor.users.findOne({ '_id': currentUser._id });

				assert.equal(updated.description, newDescription);

				newDescription += 'longer';

				function expectedError() {
					Meteor.call('auth.editTextField', {
						'_id': currentUser._id,
						'fieldName': 'description',
						'fieldValue': newDescription,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-text-field-too-long');

				unwrapUser();
			});
		});
		describe('add user to role', () => {
			it('cannot add a user to a role if the user is not logged in', () => {
				const targetUser = stubUser(); // the user whose role is to be changed
				logOutButLeaveUser();

				function expectedError() {
					Meteor.call('auth.addUserToRole', {
						'_id': targetUser._id,
						'role': 'premium',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-user-to-role-not-logged-in');
				unwrapUser();
			});
			it('cannot add a user to a role if the user is not an administrator', () => {
				const targetUser = stubUser(); // the user whose role is to be changed
				stubOtherUser(); // the administrator

				function expectedError() {
					Meteor.call('auth.addUserToRole', {
						'_id': targetUser._id,
						'role': 'premium',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-user-to-role-not-administrator');
				unwrapUser();
			});
			it('cannot add a user to a role if the user does not exist', () => {
				stubUser(); // only so stubOtherUser has something to unwrap
				const currentUser = stubOtherUser(); // the administrator

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['administrator']);

				function expectedError() {
					Meteor.call('auth.addUserToRole', {
						'_id': 'abc',
						'role': 'premium',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-user-to-role-user-not-found');
				unwrapUser();
			});
			it('cannot add a user to a role if the role does not exist', () => {
				const targetUser = stubUser(); // the user whose role is to be changed

				const currentUser = stubOtherUser(); // the administrator

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['administrator']);

				function expectedError() {
					Meteor.call('auth.addUserToRole', {
						'_id': targetUser._id,
						'role': 'aardvark',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-user-to-role-role-not-found');
				unwrapUser();
			});
			it('cannot add a user to a role if the user is already in the role', () => {
				const targetUser = stubUser(); // the user whose role is to be changed

				const currentUser = stubOtherUser(); // the administrator

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['administrator']);

				Roles.createRole('premium', { 'unlessExists': true });
				Roles.addUsersToRoles(targetUser._id, ['premium']);

				function expectedError() {
					Meteor.call('auth.addUserToRole', {
						'_id': targetUser._id,
						'role': 'premium',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-user-to-role-already-in-role');
				unwrapUser();
			});
			it('cannot add a user to a role if the user is already in the role', () => {
				const targetUser = stubUser(); // the user whose role is to be changed

				const currentUser = stubOtherUser(); // the administrator

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['administrator']);

				Roles.createRole('premium', { 'unlessExists': true });

				Meteor.call('auth.addUserToRole', {
					'_id': targetUser._id,
					'role': 'premium',
				});

				assert.equal(Roles.userIsInRole(targetUser._id, 'premium'), true);

				unwrapUser();
			});
		});
		describe('remove user from role', () => {
			it('cannot remove a user from a role if the user is not logged in', () => {
				const targetUser = stubUser(); // the user whose role is to be changed
				logOutButLeaveUser();

				function expectedError() {
					Meteor.call('auth.removeUserFromRole', {
						'_id': targetUser._id,
						'role': 'premium',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-user-from-role-not-logged-in');
				unwrapUser();
			});
			it('cannot remove user from a role if the user is not an administrator', () => {
				const targetUser = stubUser(); // the user whose role is to be changed
				stubOtherUser(); // the administrator

				function expectedError() {
					Meteor.call('auth.removeUserFromRole', {
						'_id': targetUser._id,
						'role': 'premium',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-user-from-role-not-administrator');
				unwrapUser();
			});
			it('cannot remove a user from a role if the user does not exist', () => {
				stubUser(); // only so stubOtherUser has something to unwrap
				const currentUser = stubOtherUser(); // the administrator

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['administrator']);

				function expectedError() {
					Meteor.call('auth.removeUserFromRole', {
						'_id': 'abc',
						'role': 'premium',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-user-from-role-user-not-found');
				unwrapUser();
			});
			it('cannot remove a user from a role if the role does not exist', () => {
				const targetUser = stubUser(); // the user whose role is to be changed

				const currentUser = stubOtherUser(); // the administrator

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['administrator']);

				function expectedError() {
					Meteor.call('auth.removeUserFromRole', {
						'_id': targetUser._id,
						'role': 'aardvark',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-user-from-role-role-not-found');
				unwrapUser();
			});
			it('cannot remove a user from a role if the user is not in the role', () => {
				const targetUser = stubUser(); // the user whose role is to be changed

				const currentUser = stubOtherUser(); // the administrator

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['administrator']);

				Roles.createRole('premium', { 'unlessExists': true });

				function expectedError() {
					Meteor.call('auth.removeUserFromRole', {
						'_id': targetUser._id,
						'role': 'premium',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-user-from-role-not-in-role');
				unwrapUser();
			});
			it('does not allow an administrator to remove themself', () => {
				const targetUser = stubUser(); // the user whose role is to be changed

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(targetUser._id, ['administrator']);

				assert.equal(Roles.userIsInRole(targetUser._id, 'administrator'), true);

				function expectedError() {
					Meteor.call('auth.removeUserFromRole', {
						'_id': targetUser._id,
						'role': 'administrator',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-user-from-role-administrator-not-remove-self');

				assert.equal(Roles.userIsInRole(targetUser._id, 'administrator'), true);

				unwrapUser();
			});
			it('can remove a user from a role', () => {
				const targetUser = stubUser(); // the user whose role is to be changed

				const currentUser = stubOtherUser(); // the administrator

				Roles.createRole('administrator', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['administrator']);

				Roles.createRole('premium', { 'unlessExists': true });
				Roles.addUsersToRoles(targetUser._id, ['premium']);

				assert.equal(Roles.userIsInRole(targetUser._id, 'premium'), true);

				Meteor.call('auth.removeUserFromRole', {
					'_id': targetUser._id,
					'role': 'premium',
				});

				assert.equal(Roles.userIsInRole(targetUser._id, 'premium'), false);

				unwrapUser();
			});
		});
		describe('setWeavingBackwardsBackgroundColor method', () => {
			it('throws an error if the user is not logged in', () => {
				function expectedError() {
					Meteor.call('auth.setWeavingBackwardsBackgroundColor', '#ff00ff');
				}

				expect(expectedError).to.throw(Meteor.Error(), 'set-weaving-backwards-background-color-not-logged-in');
			});
			it('throws an error if the colour value is not specified', () => {
				stubUser();

				function expectedError() {
					Meteor.call('auth.setWeavingBackwardsBackgroundColor', undefined);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'Match error');

				unwrapUser();
			});
			it('throws an error if the colour value is empty string', () => {
				stubUser();

				function expectedError() {
					Meteor.call('auth.setWeavingBackwardsBackgroundColor', '');
				}
				expect(expectedError).to.throw(Meteor.Error(), 'Match error');

				unwrapUser();
			});
			it('throws an error if the colour value is too long', () => {
				stubUser();

				function expectedError() {
					Meteor.call('auth.setWeavingBackwardsBackgroundColor', '#ff00ffg');
				}
				expect(expectedError).to.throw(Meteor.Error(), 'Match error');

				unwrapUser();
			});
		});
	});
}

// check can add pattern image
// No! It would affect AWS live storage
