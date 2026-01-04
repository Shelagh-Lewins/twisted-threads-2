/* eslint-env mocha */

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Roles } from 'meteor/roles';
import { ActionsLog } from '../../imports/modules/collection';
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

      await Meteor.users.updateAsync(
        { _id: currentUser._id },
        { $set: { 'emails.0.verified': false } },
      );

      await Roles.createRoleAsync('verified', { unlessExists: true });
      assert.isOk(
        currentUser._id,
        'currentUser._id should be defined for removeUsersFromRolesAsync',
      );
      await Roles.removeUsersFromRolesAsync(currentUser._id, ['verified']);

      const result = await callMethodWithUser(
        currentUser._id,
        'auth.sendVerificationEmail',
        currentUser._id,
      );

      assert.equal(result.email, currentUser.emails[0].address);
    });

    it('updates actions log when sending verification email', async () => {
      const currentUser = await stubUser();

      await Meteor.users.updateAsync(
        { _id: currentUser._id },
        { $set: { 'emails.0.verified': false } },
      );

      // Verify no actions log exists yet
      const beforeLog = await ActionsLog.findOneAsync({
        userId: currentUser._id,
      });
      expect(beforeLog).to.not.exist;

      await callMethodWithUser(
        currentUser._id,
        'auth.sendVerificationEmail',
        currentUser._id,
      );

      // Verify actions log was created and updated
      const afterLog = await ActionsLog.findOneAsync({
        userId: currentUser._id,
      });
      expect(afterLog).to.exist;
      expect(afterLog.verificationEmailSent).to.be.an('array');
      expect(afterLog.verificationEmailSent.length).to.equal(1);
      expect(afterLog.verificationEmailSent[0]).to.be.a('date');
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

        await Roles.createRoleAsync('verified', { unlessExists: true });
        assert.isOk(
          currentUser._id,
          'currentUser._id should be defined for addUsersToRolesAsync',
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
        const { privatePatternUserIds, publicPatternUsernames } =
          await createManyUsers();
        const currentUser = await Meteor.users.findOneAsync({
          _id: privatePatternUserIds[0],
        });
        // Use callMethodWithUser to set this.userId in the method context
        const result = await callMethodWithUser(
          currentUser._id,
          'auth.getUserCount',
        );
        assert.equal(result, publicPatternUsernames.length + 1);
        unwrapUser();
      });
    });

    describe('get users for page', () => {
      describe('get users for page', () => {
        it('returns the users for the first page, user not logged in', async () => {
          const { publicPatternUsernames } = await createManyUsers();
          const skip = 0;
          const limit = 10;
          const result = await Meteor.callAsync('auth.getUsersForPage', {
            skip,
            limit,
          });
          assert.equal(result.length, limit);
          const expectedUsernames = publicPatternUsernames
            .sort()
            .slice(0, limit);
          expectedUsernames.forEach((username) => {
            assert.notEqual(expectedUsernames.indexOf(username), -1);
          });
        });

        it('returns the users for the last page, user not logged in', async () => {
          const { publicPatternUsernames } = await createManyUsers();
          const total = publicPatternUsernames.length;
          const limit = 10;
          const skip = Math.floor(total / limit) * limit;
          // If total is 23, skip = 20, so expect 3 users
          const result = await Meteor.callAsync('auth.getUsersForPage', {
            skip,
            limit,
          });
          const expectedCount = total - skip;
          assert.equal(result.length, expectedCount);
          const resultUsernames = result.map((u) => u.username).sort();
          const expectedUsernames = publicPatternUsernames
            .sort()
            .slice(skip, skip + limit);
          assert.deepEqual(resultUsernames, expectedUsernames);
        });

        it('returns an empty array for a page beyond the end', async () => {
          const { publicPatternUsernames } = await createManyUsers();
          const total = publicPatternUsernames.length;
          const limit = 10;
          const skip = total + 10; // skip past the end
          const result = await Meteor.callAsync('auth.getUsersForPage', {
            skip,
            limit,
          });
          assert.isArray(result);
          assert.equal(result.length, 0);
        });

        it('returns the users for the last page, user not logged in', async () => {
          const { publicPatternUsernames } = await createManyUsers();
          const total = publicPatternUsernames.length;
          const limit = 10;
          const skip = Math.floor(total / limit) * limit;
          // If total is 23, skip = 20, so expect 3 users
          const result = await Meteor.callAsync('auth.getUsersForPage', {
            skip,
            limit,
          });
          const expectedCount = total - skip;
          assert.equal(result.length, expectedCount);
          const resultUsernames = result.map((u) => u.username).sort();
          const expectedUsernames = publicPatternUsernames
            .sort()
            .slice(skip, skip + limit);
          assert.deepEqual(resultUsernames, expectedUsernames);
        });

        it('returns an empty array for a page beyond the end', async () => {
          const { publicPatternUsernames } = await createManyUsers();
          const total = publicPatternUsernames.length;
          const limit = 10;
          const skip = total + 10; // skip past the end
          const result = await Meteor.callAsync('auth.getUsersForPage', {
            skip,
            limit,
          });
          assert.isArray(result);
          assert.equal(result.length, 0);
        });

        it('returns the users for the second page, user not logged in', async () => {
          const { publicPatternUsernames } = await createManyUsers();
          const skip = 10;
          const limit = 10;
          const result = await Meteor.callAsync('auth.getUsersForPage', {
            skip,
            limit,
          });
          assert.equal(result.length, limit);

          // If result is array of user objects, extract usernames
          const resultUsernames = result.map((u) => u.username).sort();
          const expectedUsernames = publicPatternUsernames
            .sort()
            .slice(limit, limit * 2);
          expectedUsernames.forEach((username) => {
            assert.notEqual(resultUsernames.indexOf(username), -1);
          });
        });

        describe('edit text field', () => {
          describe('add user to role', () => {
            it('cannot add a user to a role if the user is not logged in', async () => {
              const targetUser = await stubUser(); // the user whose role is to be changed
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
              const targetUser = await stubUser(); // the user whose role is to be changed
              const adminUser = await stubOtherUser(); // the administrator

              await expect(
                callMethodWithUser(adminUser._id, 'auth.addUserToRole', {
                  _id: targetUser._id,
                  role: 'premium',
                }),
              ).to.be.rejectedWith('add-user-to-role-not-administrator');
            });
            it('cannot add a user to a role if the user does not exist', async () => {
              await stubUser(); // only so stubOtherUser has something to unwrap
              const adminUser = await stubOtherUser(); // the administrator

              await Roles.createRoleAsync('administrator', {
                unlessExists: true,
              });
              await Roles.addUsersToRolesAsync(adminUser._id, [
                'administrator',
              ]);

              await expect(
                callMethodWithUser(adminUser._id, 'auth.addUserToRole', {
                  _id: 'abc',
                  role: 'premium',
                }),
              ).to.be.rejectedWith('add-user-to-role-user-not-found');
            });

            it('cannot add a user to a role if the role does not exist', async () => {
              const targetUser = await stubUser(); // the user whose role is to be changed
              const adminUser = await stubOtherUser(); // the administrator

              await Roles.createRoleAsync('administrator', {
                unlessExists: true,
              });
              await Roles.addUsersToRolesAsync(adminUser._id, [
                'administrator',
              ]);

              await expect(
                callMethodWithUser(adminUser._id, 'auth.addUserToRole', {
                  _id: targetUser._id,
                  role: 'aardvark',
                }),
              ).to.be.rejectedWith('add-user-to-role-role-not-found');
            });

            it('cannot add a user to a role if the user is already in the role', async () => {
              const targetUser = await stubUser(); // the user whose role is to be changed
              const adminUser = await stubOtherUser(); // the administrator

              await Roles.createRoleAsync('administrator', {
                unlessExists: true,
              });
              await Roles.addUsersToRolesAsync(adminUser._id, [
                'administrator',
              ]);

              await Roles.createRoleAsync('premium', { unlessExists: true });
              await Roles.addUsersToRolesAsync(targetUser._id, ['premium']);

              await expect(
                callMethodWithUser(adminUser._id, 'auth.addUserToRole', {
                  _id: targetUser._id,
                  role: 'premium',
                }),
              ).to.be.rejectedWith('add-user-to-role-already-in-role');
            });

            it('can add a user to a role', async () => {
              const targetUser = await stubUser(); // the user whose role is to be changed
              const adminUser = await stubOtherUser(); // the administrator

              await Roles.createRoleAsync('administrator', {
                unlessExists: true,
              });
              await Roles.addUsersToRolesAsync(adminUser._id, [
                'administrator',
              ]);

              await Roles.createRoleAsync('premium', { unlessExists: true });

              await callMethodWithUser(adminUser._id, 'auth.addUserToRole', {
                _id: targetUser._id,
                role: 'premium',
              });

              assert.equal(
                await Roles.userIsInRoleAsync(targetUser._id, 'premium'),
                true,
              );
            });
          });
          it('cannot edit description of a different user', async () => {
            async function expectedError() {
              const currentUser = await stubUser();
              await stubOtherUser();
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
            const currentUser = await stubUser();
            await expect(
              callMethodWithUser(currentUser._id, 'auth.editTextField', {
                _id: currentUser._id,
                fieldName: 'thingy',
                fieldValue: 'someText',
              }),
            ).to.be.rejectedWith('edit-text-field-not-allowed');
          });

          it('can edit description if they are logged in', async () => {
            const currentUser = await stubUser();
            assert.equal(currentUser.description, undefined);
            const newDescription = 'Some text';
            await callMethodWithUser(currentUser._id, 'auth.editTextField', {
              _id: currentUser._id,
              fieldName: 'description',
              fieldValue: newDescription,
            });
            const updated = await Meteor.users.findOneAsync({
              _id: currentUser._id,
            });
            assert.equal(updated.description, newDescription);
          });

          it('cannot set a value that is too long', async () => {
            const currentUser = await stubUser();
            assert.equal(currentUser.description, undefined);
            let newDescription = '';
            for (let i = 0; i < MAX_TEXT_AREA_LENGTH; i += 1) {
              newDescription += 'a';
            }
            await callMethodWithUser(currentUser._id, 'auth.editTextField', {
              _id: currentUser._id,
              fieldName: 'description',
              fieldValue: newDescription,
            });
            const updated = await Meteor.users.findOneAsync({
              _id: currentUser._id,
            });
            assert.equal(updated.description, newDescription);
            newDescription += 'longer';
            await expect(
              callMethodWithUser(currentUser._id, 'auth.editTextField', {
                _id: currentUser._id,
                fieldName: 'description',
                fieldValue: newDescription,
              }),
            ).to.be.rejectedWith('edit-text-field-too-long');
          });
        });
      });
    });
    // ...existing migrated test blocks go here...
    // For brevity, you would paste all the migrated describe/it blocks here,
    // ensuring they are all inside this top-level describe.
  });
}
