/* eslint-env mocha */

import { resetDatabase } from './00_setup';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Roles } from 'meteor/roles';
import '../../imports/server/modules/publications';
import '../methods/auth';
import {
  createManyUsers,
  logOutButLeaveUser,
  stubOtherUser,
  stubUser,
  unwrapUser,
} from './mockUser';
import { addPatternDataIndividual } from './testData';
import {
  MAX_RECENTS,
  MAX_TEXT_AREA_LENGTH,
} from '../../imports/modules/parameters';

chai.use(chaiAsPromised);
const { assert, expect } = chai;

const sinon = require('sinon');

if (Meteor.isServer) {
  describe('test auth methods', function testauthmethods() {
    this.timeout(15000);
    beforeEach(() => {
      resetDatabase();
    });

    describe('sendVerificationEmail method', () => {
      it('throws an error if the user is not logged in', async () => {
        async function expectedError() {
          await Meteor.callAsync('auth.sendVerificationEmail', 'abc');
        }

        await expect(expectedError()).to.be.rejectedWith(
          'send-verification-email-not-logged-in',
        );
      });

      it('throws an error if the users email address is verified', async () => {
        const currentUser = stubUser();

        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['verified']);

        async function expectedError() {
          await Meteor.callAsync('auth.sendVerificationEmail', currentUser._id);
        }

        await expect(expectedError()).to.be.rejectedWith('no unverified email');

        unwrapUser();
      });

      it('sends the email if the user is logged in and unverified', async () => {
        const currentUser = stubUser();

        await Meteor.users.updateAsync(
          { _id: currentUser._id },
          { $set: { 'emails.0.verified': false } },
        );

        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.removeUsersFromRolesAsync(currentUser._id, ['verified']);

        const result = await Meteor.callAsync(
          'auth.sendVerificationEmail',
          currentUser._id,
        );

        assert.equal(result.email, currentUser.emails[0].address);

        unwrapUser();
      });
    });

    describe('setRecentPatterns method', () => {
      it('throws an error if the user is not logged in', async () => {
        async function expectedError() {
          await Meteor.callAsync('auth.setRecentPatterns', {
            userId: 'xxx',
            newRecentPatterns: [],
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'set-recent-patterns-not-logged-in',
        );
      });

      it('adds the recent pattern if the user is logged in', async () => {
        const currentUser = stubUser();
        const patternId = await Meteor.callAsync(
          'pattern.add',
          addPatternDataIndividual,
        );

        await Meteor.callAsync(
          'auth.setRecentPatterns',
          {
            userId: currentUser._id,
            newRecentPatterns: [
              {
                currentWeavingRow: 2,
                patternId,
                updatedAt: new Date(),
              },
            ],
          },
          async (error) => {
            const updated = await Meteor.users.findOneAsync({
              _id: currentUser._id,
            });
            assert.equal(updated.profile.recentPatterns.length, 1);
            assert.equal(
              updated.profile.recentPatterns[0].currentWeavingRow,
              2,
            );
            assert.equal(error, undefined);
          },
        );

        unwrapUser();
      });

      it('sets current weaving row to 1 if invalid', async () => {
        const currentUser = stubUser();
        const patternId = await Meteor.callAsync(
          'pattern.add',
          addPatternDataIndividual,
        );

        await Meteor.callAsync(
          'auth.setRecentPatterns',
          {
            userId: currentUser._id,
            newRecentPatterns: [
              {
                currentWeavingRow: -1,
                patternId,
                updatedAt: new Date(),
              },
            ],
          },
          async (error) => {
            const updated = await Meteor.users.findOneAsync({
              _id: currentUser._id,
            });
            assert.equal(updated.profile.recentPatterns.length, 1);
            assert.equal(
              updated.profile.recentPatterns[0].currentWeavingRow,
              1,
            );
            assert.equal(error, undefined);
          },
        );

        unwrapUser();
      });

      it('stores the maximum number of recents', async () => {
        const currentUser = stubUser();
        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['verified']);

        const newRecentPatterns = [];
        const numberOfRecents = MAX_RECENTS + 5;
        const now = new Date();
        const initialDateAsString = now.toString();

        for (let i = 0; i < numberOfRecents; i += 1) {
          const patternId = await Meteor.callAsync(
            'pattern.add',
            addPatternDataIndividual,
          );
          now.setSeconds(now.getSeconds() - 10 * i);
          newRecentPatterns.push({
            currentWeavingRow: 3,
            patternId,
            updatedAt: new Date(now),
          });
        }

        await Meteor.callAsync(
          'auth.setRecentPatterns',
          {
            userId: currentUser._id,
            newRecentPatterns,
          },
          (error) => {
            const updated = Meteor.users.findOneAsync({ _id: currentUser._id });
            assert.equal(updated.profile.recentPatterns.length, MAX_RECENTS);

            // the most recent date is the first entry
            assert.equal(
              updated.profile.recentPatterns[0].updatedAt.toString(),
              initialDateAsString,
            );
            assert.equal(error, undefined);
          },
        );

        unwrapUser();
      });
    });

    describe('register a new user', () => {
      // the tests that rely on Accounts.onCreateUser don't work because Accounts.onCreateUser doesn't run in testing.
      // There is a bug reported but closed:
      // https://github.com/meteor/meteor/issues/7395
      // I've tested this manually and it worked
      it('creates an account with the expected values', async () => {
        const userId = Accounts.createUser({
          email: 'me@there.com',
          username: 'NewUser',
          password: '12345678',
        });

        const { emails, username } = await Meteor.users.findOneAsync({
          _id: userId,
        });

        assert.equal(emails[0].address, 'me@there.com');
        assert.equal(username, 'NewUser');
      });
    });

    describe('get user count', () => {
      // counts all users with public patterns
      // plus the user themselves if logged in
      it('returns the number of users with public patterns if the user is not logged in', async () => {
        const { publicPatternUsernames } = createManyUsers();

        const result = await Meteor.callAsync('auth.getUserCount');

        assert.equal(result, publicPatternUsernames.length);
      });

      it('returns the number of users with public patterns plus one for the user if the user is logged in', async () => {
        const { privatePatternUserIds, publicPatternUsernames } =
          createManyUsers();

        const currentUser = await Meteor.users.findOneAsync({
          _id: privatePatternUserIds[0],
        });
        sinon.stub(Meteor, 'userAsync');
        Meteor.userAsync.returns(currentUser); // now Meteor.userAsync() will return the user we just created

        sinon.stub(Meteor, 'userId');
        Meteor.userId.returns(currentUser._id);

        const result = await Meteor.callAsync('auth.getUserCount');

        assert.equal(result, publicPatternUsernames.length + 1);
        unwrapUser();
      });
    });

    describe('get users for page', () => {
      // counts all users with public patterns
      // returns the number required for the page
      it('returns the users for the first page, user not logged in', async () => {
        const { publicPatternUsernames } = createManyUsers();

        const skip = 0;
        const limit = 10;

        const result = await Meteor.callAsync('auth.getUsersForPage', {
          skip,
          limit,
        });

        assert.equal(result.length, limit);

        const expectedUsernames = publicPatternUsernames.sort().slice(0, limit);

        expectedUsernames.forEach((username) => {
          assert.notEqual(expectedUsernames.indexOf(username), -1);
        });
      });

      it('returns the users for the second page, user not logged in', async () => {
        const { publicPatternUsernames } = createManyUsers();

        const skip = 10;
        const limit = 10;

        const result = await Meteor.callAsync('auth.getUsersForPage', {
          skip,
          limit,
        });

        assert.equal(result.length, limit);

        const expectedUsernames = publicPatternUsernames
          .sort()
          .slice(limit, limit * 2);

        expectedUsernames.forEach((username) => {
          assert.notEqual(expectedUsernames.indexOf(username), -1);
        });
      });
      it('returns the users for the first page, user is logged in', async () => {
        const { privatePatternUserIds, publicPatternUsernames } =
          createManyUsers();

        const currentUser = await Meteor.users.findOneAsync({
          _id: privatePatternUserIds[0],
        });
        sinon.stub(Meteor, 'userAsync');
        Meteor.userAsync.returns(currentUser); // now Meteor.userAsync() will return the user we just created

        sinon.stub(Meteor, 'userId');
        Meteor.userId.returns(currentUser._id);

        const skip = 0;
        const limit = 10;

        const result = await Meteor.callAsync('auth.getUsersForPage', {
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

      it('returns the users for the second page, user is logged in', async () => {
        const { privatePatternUserIds, publicPatternUsernames } =
          createManyUsers();

        const currentUser = await Meteor.users.findOneAsync({
          _id: privatePatternUserIds[0],
        });
        sinon.stub(Meteor, 'userAsync');
        Meteor.userAsync.returns(currentUser); // now Meteor.userAsync() will return the user we just created

        sinon.stub(Meteor, 'userId');
        Meteor.userId.returns(currentUser._id);

        const skip = 10;
        const limit = 10;

        const result = await Meteor.callAsync('auth.getUsersForPage', {
          skip,
          limit,
        });

        assert.equal(result.length, limit);

        publicPatternUsernames.push(currentUser.username);

        const expectedUsernames = publicPatternUsernames
          .sort()
          .slice(limit, limit * 2);

        expectedUsernames.forEach((username) => {
          assert.notEqual(expectedUsernames.indexOf(username), -1);
        });
        unwrapUser();
      });
    });
    describe('edit text field', () => {
      // the only  editable field for user is description
      it('cannot edit description if they are not logged in', async () => {
        async function expectedError() {
          await Meteor.callAsync('auth.editTextField', {
            _id: 'xxx',
            fieldName: 'description',
            fieldValue: 'someText',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-text-field-not-logged-in',
        );
      });

      it('cannot edit description of a different user', async () => {
        async function expectedError() {
          const currentUser = stubUser();
          stubOtherUser();

          await Meteor.callAsync('auth.editTextField', {
            _id: currentUser._id,
            fieldName: 'description',
            fieldValue: 'someText',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-text-field-not-logged-in',
        );

        unwrapUser();
      });
      it('cannot edit a different field if they are logged in', async () => {
        const currentUser = stubUser();

        async function expectedError() {
          await Meteor.callAsync('auth.editTextField', {
            _id: currentUser._id,
            fieldName: 'thingy',
            fieldValue: 'someText',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-text-field-not-allowed',
        );

        unwrapUser();
      });
      it('can edit description if they are logged in', async () => {
        const currentUser = stubUser();
        assert.equal(currentUser.description, undefined);
        const newDescription = 'Some text';

        await Meteor.callAsync('auth.editTextField', {
          _id: currentUser._id,
          fieldName: 'description',
          fieldValue: newDescription,
        });

        const updated = await Meteor.users.findOneAsync({
          _id: currentUser._id,
        });

        assert.equal(updated.description, newDescription);

        unwrapUser();
      });

      it('cannot set a value that is too long', async () => {
        const currentUser = stubUser();
        assert.equal(currentUser.description, undefined);
        let newDescription = '';

        for (let i = 0; i < MAX_TEXT_AREA_LENGTH; i += 1) {
          newDescription += 'a';
        }

        await Meteor.callAsync('auth.editTextField', {
          _id: currentUser._id,
          fieldName: 'description',
          fieldValue: newDescription,
        });

        const updated = await Meteor.users.findOneAsync({
          _id: currentUser._id,
        });

        assert.equal(updated.description, newDescription);

        newDescription += 'longer';

        async function expectedError() {
          await Meteor.callAsync('auth.editTextField', {
            _id: currentUser._id,
            fieldName: 'description',
            fieldValue: newDescription,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-text-field-too-long',
        );

        unwrapUser();
      });
    });
    describe('add user to role', () => {
      it('cannot add a user to a role if the user is not logged in', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed
        logOutButLeaveUser();

        async function expectedError() {
          await Meteor.callAsync('auth.addUserToRole', {
            _id: targetUser._id,
            role: 'premium',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-user-to-role-not-logged-in',
        );

        unwrapUser();
      });
      it('cannot add a user to a role if the user is not an administrator', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed
        stubOtherUser(); // the administrator

        async function expectedError() {
          await Meteor.callAsync('auth.addUserToRole', {
            _id: targetUser._id,
            role: 'premium',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-user-to-role-not-administrator',
        );

        unwrapUser();
      });
      it('cannot add a user to a role if the user does not exist', async () => {
        stubUser(); // only so stubOtherUser has something to unwrap
        const currentUser = stubOtherUser(); // the administrator

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['administrator']);

        async function expectedError() {
          await Meteor.callAsync('auth.addUserToRole', {
            _id: 'abc',
            role: 'premium',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-user-to-role-user-not-found',
        );

        unwrapUser();
      });

      it('cannot add a user to a role if the role does not exist', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed

        const currentUser = stubOtherUser(); // the administrator

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['administrator']);

        async function expectedError() {
          await Meteor.callAsync('auth.addUserToRole', {
            _id: targetUser._id,
            role: 'aardvark',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-user-to-role-role-not-found',
        );

        unwrapUser();
      });

      it('cannot add a user to a role if the user is already in the role', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed

        const currentUser = stubOtherUser(); // the administrator

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['administrator']);

        await Roles.createRoleAsync('premium', { unlessExists: true });
        await Roles.addUsersToRolesAsync(targetUser._id, ['premium']);

        async function expectedError() {
          await Meteor.callAsync('auth.addUserToRole', {
            _id: targetUser._id,
            role: 'premium',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-user-to-role-already-in-role',
        );

        unwrapUser();
      });

      it('cannot add a user to a role if the user is already in the role', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed

        const currentUser = stubOtherUser(); // the administrator

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['administrator']);

        await Roles.createRoleAsync('premium', { unlessExists: true });

        await Meteor.callAsync('auth.addUserToRole', {
          _id: targetUser._id,
          role: 'premium',
        });

        assert.equal(Roles.userIsInRole(targetUser._id, 'premium'), true);

        unwrapUser();
      });
    });

    describe('remove user from role', () => {
      it('cannot remove a user from a role if the user is not logged in', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed
        logOutButLeaveUser();

        async function expectedError() {
          await Meteor.callAsync('auth.removeUserFromRole', {
            _id: targetUser._id,
            role: 'premium',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-user-from-role-not-logged-in',
        );

        unwrapUser();
      });

      it('cannot remove user from a role if the user is not an administrator', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed
        stubOtherUser(); // the administrator

        async function expectedError() {
          await Meteor.callAsync('auth.removeUserFromRole', {
            _id: targetUser._id,
            role: 'premium',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-user-from-role-not-administrator',
        );

        unwrapUser();
      });

      it('cannot remove a user from a role if the user does not exist', async () => {
        stubUser(); // only so stubOtherUser has something to unwrap
        const currentUser = stubOtherUser(); // the administrator

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['administrator']);

        async function expectedError() {
          await Meteor.callAsync('auth.removeUserFromRole', {
            _id: 'abc',
            role: 'premium',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-user-from-role-user-not-found',
        );

        unwrapUser();
      });

      it('cannot remove a user from a role if the role does not exist', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed

        const currentUser = stubOtherUser(); // the administrator

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['administrator']);

        async function expectedError() {
          await Meteor.callAsync('auth.removeUserFromRole', {
            _id: targetUser._id,
            role: 'aardvark',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-user-from-role-role-not-found',
        );

        unwrapUser();
      });

      it('cannot remove a user from a role if the user is not in the role', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed

        const currentUser = stubOtherUser(); // the administrator

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['administrator']);

        await Roles.createRoleAsync('premium', { unlessExists: true });

        async function expectedError() {
          await Meteor.callAsync('auth.removeUserFromRole', {
            _id: targetUser._id,
            role: 'premium',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-user-from-role-not-in-role',
        );

        unwrapUser();
      });

      it('does not allow an administrator to remove themself', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(targetUser._id, ['administrator']);

        assert.equal(Roles.userIsInRole(targetUser._id, 'administrator'), true);

        async function expectedError() {
          await Meteor.callAsync('auth.removeUserFromRole', {
            _id: targetUser._id,
            role: 'administrator',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-user-from-role-administrator-not-remove-self',
        );

        assert.equal(Roles.userIsInRole(targetUser._id, 'administrator'), true);

        unwrapUser();
      });

      it('can remove a user from a role', async () => {
        const targetUser = stubUser(); // the user whose role is to be changed

        const currentUser = stubOtherUser(); // the administrator

        await Roles.createRoleAsync('administrator', { unlessExists: true });
        await Roles.addUsersToRolesAsync(currentUser._id, ['administrator']);

        await Roles.createRoleAsync('premium', { unlessExists: true });
        await Roles.addUsersToRolesAsync(targetUser._id, ['premium']);

        assert.equal(Roles.userIsInRole(targetUser._id, 'premium'), true);

        await Meteor.callAsync('auth.removeUserFromRole', {
          _id: targetUser._id,
          role: 'premium',
        });

        assert.equal(Roles.userIsInRole(targetUser._id, 'premium'), false);

        unwrapUser();
      });
    });

    describe('setWeavingBackwardsBackgroundColor method', () => {
      it('throws an error if the user is not logged in', async () => {
        async function expectedError() {
          await Meteor.callAsync(
            'auth.setWeavingBackwardsBackgroundColor',
            '#ff00ff',
          );
        }

        await expect(expectedError()).to.be.rejectedWith(
          'set-weaving-backwards-background-color-not-logged-in',
        );
      });

      it('throws an error if the colour value is not specified', async () => {
        stubUser();

        async function expectedError() {
          await Meteor.callAsync(
            'auth.setWeavingBackwardsBackgroundColor',
            undefined,
          );
        }

        await expect(expectedError()).to.be.rejectedWith('Match error');

        unwrapUser();
      });

      it('throws an error if the colour value is empty string', async () => {
        stubUser();

        async function expectedError() {
          await Meteor.callAsync('auth.setWeavingBackwardsBackgroundColor', '');
        }

        await expect(expectedError()).to.be.rejectedWith('Match error');

        unwrapUser();
      });
      it('throws an error if the colour value is too long', async () => {
        stubUser();

        async function expectedError() {
          await Meteor.callAsync(
            'auth.setWeavingBackwardsBackgroundColor',
            '#ff00ffg',
          );
        }

        await expect(expectedError()).to.be.rejectedWith('Match error');

        unwrapUser();
      });
    });
  });
}

// check can add pattern image
// No! It would affect AWS live storage
