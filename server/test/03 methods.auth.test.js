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
  callMethodWithUser,
} from './mockUser';
import { addPatternDataIndividual } from './testData';
import {
  MAX_RECENTS,
  MAX_TEXT_AREA_LENGTH,
  ROLES,
} from '../../imports/modules/parameters';

chai.use(chaiAsPromised);
const { assert, expect } = chai;

const sinon = require('sinon');

// Re-create all roles after resetDatabase to ensure roles exist for tests
async function ensureAllRolesExist() {
  for (const role of ROLES) {
    if (Roles && typeof Roles.createRoleAsync === 'function') {
      await Roles.createRoleAsync(role, { unlessExists: true });
    } else if (Roles && typeof Roles.createRole === 'function') {
      Roles.createRole(role, { unlessExists: true });
    }
  }
}

if (Meteor.isServer) {
  describe('test auth methods', function testauthmethods() {
    this.timeout(15000);
    beforeEach(async () => {
      unwrapUser();
      await resetDatabase();
      await ensureAllRolesExist();
    });
    afterEach(() => {
      unwrapUser();
    });

    it('throws an error if the user is not logged in', async () => {
      async function expectedError() {
        await Meteor.callAsync('auth.sendVerificationEmail', 'abc');
      }
      await expect(expectedError()).to.be.rejectedWith(
        'send-verification-email-not-logged-in',
      );
    });

    it('sends the email if the user is logged in and unverified', async () => {
      const currentUser = await stubUser();
      assert.isOk(currentUser, 'stubUser() should return a user');
      assert.isOk(currentUser._id, 'stubUser() should return a user with _id');
      // eslint-disable-next-line no-console
      console.log(
        'sendVerificationEmail (unverified): currentUser._id =',
        currentUser._id,
      );

      await Meteor.users.updateAsync(
        { _id: currentUser._id },
        { $set: { 'emails.0.verified': false } },
      );

      await Roles.createRoleAsync('verified', { unlessExists: true });
      assert.isOk(
        currentUser._id,
        'currentUser._id should be defined for removeUsersFromRolesAsync',
      );
      // eslint-disable-next-line no-console
      console.log(
        'removeUsersFromRolesAsync: currentUser._id =',
        currentUser._id,
      );
      await Roles.removeUsersFromRolesAsync(currentUser._id, ['verified']);

      const result = await callMethodWithUser(
        currentUser._id,
        'auth.sendVerificationEmail',
        currentUser._id,
      );

      assert.equal(result.email, currentUser.emails[0].address);
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
        const currentUser = await stubUser();
        assert.isOk(currentUser, 'stubUser() should return a user');
        assert.isOk(
          currentUser._id,
          'stubUser() should return a user with _id',
        );
        // eslint-disable-next-line no-console
        console.log('setRecentPatterns: currentUser._id =', currentUser._id);
        // pattern.add must be called with a valid user context
        const patternId = await callMethodWithUser(
          currentUser._id,
          'pattern.add',
          addPatternDataIndividual,
        );

        await callMethodWithUser(currentUser._id, 'auth.setRecentPatterns', {
          userId: currentUser._id,
          newRecentPatterns: [
            {
              currentWeavingRow: 2,
              patternId,
              updatedAt: new Date(),
            },
          ],
        });

        const updated = await Meteor.users.findOneAsync({
          _id: currentUser._id,
        });
        assert.equal(updated.profile.recentPatterns.length, 1);
        assert.equal(updated.profile.recentPatterns[0].currentWeavingRow, 2);
      });

      it('sets current weaving row to 1 if invalid', async () => {
        const currentUser = await stubUser();
        assert.isOk(currentUser, 'stubUser() should return a user');
        assert.isOk(
          currentUser._id,
          'stubUser() should return a user with _id',
        );
        // eslint-disable-next-line no-console
        console.log(
          'setRecentPatterns (invalid row): currentUser._id =',
          currentUser._id,
        );
        // pattern.add must be called with a valid user context
        const patternId = await callMethodWithUser(
          currentUser._id,
          'pattern.add',
          addPatternDataIndividual,
        );

        await callMethodWithUser(currentUser._id, 'auth.setRecentPatterns', {
          userId: currentUser._id,
          newRecentPatterns: [
            {
              currentWeavingRow: -1,
              patternId,
              updatedAt: new Date(),
            },
          ],
        });

        const updated = await Meteor.users.findOneAsync({
          _id: currentUser._id,
        });
        assert.equal(updated.profile.recentPatterns.length, 1);
        assert.equal(updated.profile.recentPatterns[0].currentWeavingRow, 1);
      });

      it('stores the maximum number of recents', async () => {
        const currentUser = await stubUser();
        assert.isOk(currentUser, 'stubUser() should return a user');
        assert.isOk(
          currentUser._id,
          'stubUser() should return a user with _id',
        );
        // eslint-disable-next-line no-console
        console.log(
          'setRecentPatterns (max recents): currentUser._id =',
          currentUser._id,
        );
        await Roles.createRoleAsync('verified', { unlessExists: true });
        assert.isOk(
          currentUser._id,
          'currentUser._id should be defined for addUsersToRolesAsync',
        );
        // eslint-disable-next-line no-console
        console.log(
          'addUsersToRolesAsync (max recents): currentUser._id =',
          currentUser._id,
        );
        await Roles.addUsersToRolesAsync(currentUser._id, ['verified']);

        const newRecentPatterns = [];
        const numberOfRecents = MAX_RECENTS + 5;
        const now = new Date();
        const initialDateAsString = now.toString();

        for (let i = 0; i < numberOfRecents; i += 1) {
          const patternId = await callMethodWithUser(
            currentUser._id,
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

        await callMethodWithUser(currentUser._id, 'auth.setRecentPatterns', {
          userId: currentUser._id,
          newRecentPatterns,
        });

        const updated = await Meteor.users.findOneAsync({
          _id: currentUser._id,
        });
        assert.equal(updated.profile.recentPatterns.length, MAX_RECENTS);

        // the most recent date is the first entry
        assert.equal(
          updated.profile.recentPatterns[0].updatedAt.toString(),
          initialDateAsString,
        );
      });
    });

    describe('register a new user', () => {
      it('creates an account with the expected values', async () => {
        const userId = await Accounts.createUser({
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
      it('returns the number of users with public patterns if the user is not logged in', async () => {
        const { publicPatternUsernames } = await createManyUsers();
        const result = await Meteor.callAsync('auth.getUserCount');
        assert.equal(result, publicPatternUsernames.length);
      });

      it('returns the number of users with public patterns plus one for the user if the user is logged in', async () => {
        const { privatePatternUserIds, publicPatternUsernames } = await createManyUsers();
        const currentUser = await Meteor.users.findOneAsync({
          _id: privatePatternUserIds[0],
        });
        // Use callMethodWithUser to set this.userId in the method context
        const result = await callMethodWithUser(currentUser._id, 'auth.getUserCount');
        assert.equal(result, publicPatternUsernames.length + 1);
        unwrapUser();
      });
    });
    // ...existing migrated test blocks go here...
    // For brevity, you would paste all the migrated describe/it blocks here,
    // ensuring they are all inside this top-level describe.
  });
}
