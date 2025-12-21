// Reuse shared helper
import { createUserAndPattern } from './testHelpers';
/* eslint-env mocha */
// test for sets methods

import { resetDatabase } from './00_setup';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { Roles } from 'meteor/roles';

import '../../imports/server/modules/publications';
import { Sets } from '../../imports/modules/collection';

// import all the methods we'll need
import '../methods/set';

import {
  MAX_PATTERNS_IN_SET,
  MAX_SETS,
} from '../../imports/modules/parameters';
import {
  stubNoUser,
  stubOtherUser,
  stubUser,
  unwrapUser,
  callMethodWithUser,
} from './mockUser';
import { addPatternDataIndividual } from './testData';

chai.use(chaiAsPromised);
const { assert, expect } = chai;

if (Meteor.isServer) {
  // eslint-disable-next-line func-names
  describe('test methods for sets', function () {
    // eslint-disable-line func-names
    this.timeout(30000);

    beforeEach(async () => {
      unwrapUser();
      await resetDatabase();
      if (typeof ensureAllRolesExist === 'function') {
        await ensureAllRolesExist();
      }
    });

    afterEach(() => {
      unwrapUser();
    });

    describe('set.add method', () => {
      // create a set and assign a pattern to it
      it('cannot create set if not logged in', async () => {
        // No user stubbed, so Meteor.userId() will be undefined
        // Try to add a pattern (should fail)
        const patternData = {
          ...addPatternDataIndividual,
          createdBy: 'testUserId',
        };
        await expect(
          Meteor.callAsync('pattern.add', patternData),
        ).to.be.rejectedWith('add-pattern-not-logged-in');
      });

      it('cannot create set if not registered', async () => {
        // Create pattern as registered user
        const currentUser = await stubUser({
          _id: 'testUserId',
          username: 'testuser',
          roles: ['registered'],
        });
        const patternId = await createUserAndPattern('testUserId', [
          'registered',
        ]);
        // Remove 'registered' role before calling set.add
        await Roles.removeUsersFromRolesAsync(
          [currentUser._id],
          ['registered'],
        );
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'set.add', {
            patternId,
            name: 'Favourites',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-set-not-registered',
        );
      });

      it('can create the correct number of sets if registered', async () => {
        // Stub user and create a pattern
        const userId = 'testUserId';
        const patternId = await createUserAndPattern(userId, [
          'registered',
          'verified',
        ]);
        for (let i = 0; i < MAX_SETS; i += 1) {
          await callMethodWithUser(userId, 'set.add', {
            patternId,
            name: `Favourites ${i}`,
          });
        }
        // wait before rechecking the database
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const mySets = await Sets.find().fetchAsync();
        assert.equal(mySets.length, MAX_SETS);
        // check the user's public sets count
        let user = await Meteor.users.findOneAsync({});
        assert.equal(user.publicSetsCount, 0);
        // set 1 pattern to public
        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync([userId], ['verified']);
        await callMethodWithUser(userId, 'pattern.edit', {
          _id: patternId,
          data: {
            type: 'editIsPublic',
            isPublic: true,
          },
        });
        // since this pattern is in all sets, the user should now have all sets public
        user = await Meteor.users.findOneAsync({});
        assert.equal(user.publicSetsCount, MAX_SETS);
        async function expectedError() {
          await callMethodWithUser(userId, 'set.add', {
            patternId,
            name: 'Favourites',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-set-too-many-sets',
        );
      });

      it('cannot create set if pattern not found', async () => {
        const currentUser = await stubUser({
          _id: 'testUserId',
          username: 'testuser',
          roles: ['registered'],
        });
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'set.add', {
            patternId: 'abc',
            name: 'Favourites',
          });
        }
        await expect(expectedError()).to.be.rejectedWith('add-set-not-found');
      });
    });

    describe('set.addPattern method', () => {
      it('can add a public pattern created by another user to their own set', async () => {
        const userId = 'testUserId';
        const otherUserId = 'otherUserId';

        // 1. Create a pattern as otherUserId and make it public
        await stubUser({
          _id: otherUserId,
          username: otherUserId,
          roles: ['registered', 'verified', 'premium'],
        });
        const patternId = await createUserAndPattern(otherUserId, [
          'registered',
          'verified',
          'premium',
        ]);
        await callMethodWithUser(otherUserId, 'pattern.edit', {
          _id: patternId,
          data: {
            type: 'editIsPublic',
            isPublic: true,
          },
        });

        // 2. Create a different pattern as userId (so the set is created with a different pattern)
        await stubUser({
          _id: userId,
          username: userId,
          roles: ['registered', 'verified', 'premium'],
        });
        const myPatternId = await createUserAndPattern(userId, [
          'registered',
          'verified',
          'premium',
        ]);
        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId: myPatternId,
          name: 'My Set',
        });

        // 3. Add the public pattern (created by otherUserId) to userId's set (should succeed)
        await callMethodWithUser(userId, 'set.addPattern', {
          patternId,
          setId,
        });

        // 4. Confirm the pattern is now in the set
        const set = await Sets.findOneAsync({ _id: setId });
        assert.include(set.patterns, patternId);
      });
      // create a set and assign a pattern to it
      it('cannot add pattern to set if not logged in', async () => {
        console.log('*** about to log user in');
        // Create all patterns and sets as a registered user
        const user = await stubUser({
          _id: 'testUserId',
          username: 'testuser',
          roles: ['registered', 'verified'],
        });

        const patternId = await callMethodWithUser(user._id, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: 'testUserId',
        });

        const setId = await callMethodWithUser(user._id, 'set.add', {
          patternId,
          name: 'Favourites',
        });

        const newPatternId = await callMethodWithUser(user._id, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: 'testUserId',
        });

        // Log out before the main action
        unwrapUser();
        stubNoUser();
        // Now test the method while logged out
        async function expectedError() {
          await Meteor.callAsync('set.addPattern', {
            patternId: newPatternId,
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-not-logged-in',
        );
      });

      it('cannot add pattern to set if the set does not exist', async () => {
        const userId = 'testUserId';
        const patternId = await createUserAndPattern(userId, ['registered']);
        async function expectedError() {
          await callMethodWithUser(userId, 'set.addPattern', {
            patternId,
            setId: '123',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-set-not-found',
        );
      });

      it('cannot add pattern to set if another user created the set', async () => {
        const testUserId = 'testUserId';
        const otherUserId = 'otherUserId';

        // 1. Create a pattern as testUserId (to be added)
        await stubUser({
          _id: testUserId,
          username: testUserId,
          roles: ['registered', 'verified'],
        });
        const patternId = await createUserAndPattern(testUserId, [
          'registered',
          'verified',
          'premium',
        ]);
        await callMethodWithUser(testUserId, 'pattern.edit', {
          _id: patternId,
          data: {
            type: 'editIsPublic',
            isPublic: true,
          },
        });

        // 2. Create a set as otherUserId, referencing a different pattern
        await stubUser({
          _id: otherUserId,
          username: otherUserId,
          roles: ['registered', 'verified'],
        });
        const otherPatternId = await createUserAndPattern(otherUserId, [
          'registered',
          'verified',
          'premium',
        ]);
        const setId = await callMethodWithUser(otherUserId, 'set.add', {
          patternId: otherPatternId,
          name: 'Favourites',
        });

        // 3. Now try to add testUserId's pattern to otherUserId's set, as testUserId
        await stubUser({
          _id: testUserId,
          username: testUserId,
          roles: ['registered', 'verified', 'premium'],
        });
        async function expectedError() {
          await callMethodWithUser(testUserId, 'set.addPattern', {
            patternId,
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-not-created-by-user',
        );
      });
      it('cannot add pattern to set if pattern not found', async () => {
        const userId = 'testUserId';
        const patternId = await createUserAndPattern(userId, ['registered']);
        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        async function expectedError() {
          await callMethodWithUser(userId, 'set.addPattern', {
            patternId: 'abc',
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-pattern-not-found',
        );
      });

      it('cannot add pattern to set if the pattern is already in the set', async () => {
        const userId = 'testUserId';
        const patternId = await createUserAndPattern(userId, ['registered']);
        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        async function expectedError() {
          await callMethodWithUser(userId, 'set.addPattern', {
            patternId,
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-pattern-not-found',
        );
      });

      it('can add the correct number of patterns to the set', async () => {
        // give user premium role so they can create many patterns
        const userId = 'testUserId';
        // Stub user once at the start
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered', 'verified', 'premium'],
        });
        // Create the first pattern and set as the user
        const patternId = await callMethodWithUser(userId, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: userId,
        });

        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        // Add MAX_PATTERNS_IN_SET - 1 more patterns to the set
        for (let i = 0; i < MAX_PATTERNS_IN_SET - 1; i += 1) {
          const newPatternId = await callMethodWithUser(userId, 'pattern.add', {
            ...addPatternDataIndividual,
            createdBy: userId,
          });
          // Wait a tick to ensure DB consistency
          await new Promise((resolve) => setTimeout(resolve, 10));
          await callMethodWithUser(userId, 'set.addPattern', {
            patternId: newPatternId,
            setId,
          });
        }

        // Try to add one more pattern, should fail
        const newPatternId2 = await callMethodWithUser(userId, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: userId,
        });
        async function expectedError() {
          await callMethodWithUser(userId, 'set.addPattern', {
            patternId: newPatternId2,
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-set-too-many-patterns',
        );
      });
    });

    describe('set.removePattern method', () => {
      it('cannot remove pattern from set if not logged in', async () => {
        // Always create patterns and sets as a registered user
        const userId = 'testUserId';
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered', 'verified'],
        });
        const patternId = await callMethodWithUser(userId, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: userId,
        });
        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        const newPatternId = await callMethodWithUser(userId, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: userId,
        });
        // Log out before the main action
        unwrapUser();
        stubNoUser();
        async function expectedError() {
          await Meteor.callAsync('set.removePattern', {
            patternId: newPatternId,
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-from-set-not-logged-in',
        );
      });

      it('cannot remove pattern from set if the set not found', async () => {
        const patternId = await createUserAndPattern();
        await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });
        async function expectedError() {
          await Meteor.callAsync('set.removePattern', {
            patternId,
            setId: 'abc',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-from-set-set-not-found',
        );
      });

      it('cannot remove pattern from set if the set was created by another user', async () => {
        const userId = 'testUserId';
        const otherUserId = 'otherUserId';
        const patternId = await createUserAndPattern(userId, [
          'registered',
          'verified',
        ]);
        const setId = await callMethodWithUser(otherUserId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        // Log in as testUserId
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered', 'verified'],
        });
        async function expectedError() {
          await callMethodWithUser(userId, 'set.removePattern', {
            patternId,
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-from-set-not-created-by-user',
        );
      });

      it('cannot remove pattern from set if the pattern was not found', async () => {
        const patternId = await createUserAndPattern();
        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });
        async function expectedError() {
          await Meteor.callAsync('set.removePattern', {
            patternId: 'abc',
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-from-set-pattern-not-found',
        );
      });

      it('cannot remove pattern from set if the pattern was not in the set', async () => {
        const userId = 'testUserId';
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered', 'verified'],
        });
        const patternId = await createUserAndPattern(userId, [
          'registered',
          'verified',
        ]);
        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        const newPatternId = await callMethodWithUser(userId, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: userId,
        });
        async function expectedError() {
          await callMethodWithUser(userId, 'set.removePattern', {
            patternId: newPatternId,
            setId,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-from-set-not-in-set',
        );
      });

      it('can remove pattern from set', async () => {
        const userId = 'testUserId';
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered', 'verified'],
        });
        const patternId = await createUserAndPattern(userId, [
          'registered',
          'verified',
        ]);
        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        // add a second pattern to the set
        const newPatternId = await callMethodWithUser(userId, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: userId,
        });
        await callMethodWithUser(userId, 'set.addPattern', {
          patternId: newPatternId,
          setId,
        });
        const setInitial = await Sets.findOneAsync({});
        assert.equal(setInitial.patterns.length, 2);
        await callMethodWithUser(userId, 'set.removePattern', {
          patternId,
          setId,
        });
        const setUpdated = await Sets.findOneAsync({});
        assert.equal(setUpdated.patterns.length, 1);
        // check set is removed now it has no patterns
        await callMethodWithUser(userId, 'set.removePattern', {
          patternId: newPatternId,
          setId,
        });
        assert.equal(await Sets.find({}).countAsync(), 0);
      });
    });

    describe('set.remove method', () => {
      it('cannot remove a set if not logged in', async () => {
        // Always create patterns and sets as a registered user
        const userId = 'testUserId';
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered'],
        });
        const patternId = await callMethodWithUser(userId, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: userId,
        });
        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        // Log out before the main action
        unwrapUser();
        stubNoUser();
        async function expectedError() {
          await Meteor.callAsync('set.remove', setId);
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-set-not-logged-in',
        );
      });

      it('cannot remove a set if set not found', async () => {
        // User must be logged in and registered to call set.remove
        const userId = 'testUserId';
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered'],
        });
        async function expectedError() {
          await callMethodWithUser(userId, 'set.remove', 'abc');
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-set-not-found',
        );
      });

      it('cannot remove a set if set not created by the user', async () => {
        const userId = 'testUserId';
        const otherUserId = 'otherUserId';
        const patternId = await createUserAndPattern(userId, ['registered']);
        const setId = await callMethodWithUser(otherUserId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        // Log in as testUserId
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered'],
        });
        async function expectedError() {
          await callMethodWithUser(userId, 'set.remove', setId);
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-set-not-created-by-user',
        );
      });

      it('can remove a set', async () => {
        const patternId = await createUserAndPattern();
        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });
        assert.equal(await Sets.find({}).countAsync(), 1);
        await Meteor.callAsync('set.remove', setId);
        assert.equal(await Sets.find({}).countAsync(), 0);
      });
    });

    describe('set.edit method', () => {
      it('cannot edit a set if not logged in', async () => {
        // Always create patterns and sets as a registered user
        const userId = 'testUserId';
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered'],
        });
        const patternId = await callMethodWithUser(userId, 'pattern.add', {
          ...addPatternDataIndividual,
          createdBy: userId,
        });
        const setId = await callMethodWithUser(userId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        // Log out before the main action
        unwrapUser();
        stubNoUser();
        const fieldName = 'name';
        const fieldValue = 'My favourites';
        async function expectedError() {
          await Meteor.callAsync('set.edit', {
            _id: setId,
            data: {
              fieldName,
              fieldValue,
              type: 'editTextField',
            },
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'edit-set-not-logged-in',
        );
      });

      it('cannot edit a set if the set was not found', async () => {
        // User must be logged in and registered to call set.edit
        const userId = 'testUserId';
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered'],
        });
        const fieldName = 'name';
        const fieldValue = 'My favourites';
        async function expectedError() {
          await callMethodWithUser(userId, 'set.edit', {
            _id: 'abc',
            data: {
              fieldName,
              fieldValue,
              type: 'editTextField',
            },
          });
        }
        await expect(expectedError()).to.be.rejectedWith('edit-set-not-found');
      });

      it('cannot edit a set if the set was not created by the current user', async () => {
        const userId = 'testUserId';
        const otherUserId = 'otherUserId';
        const patternId = await createUserAndPattern(userId, ['registered']);
        const setId = await callMethodWithUser(otherUserId, 'set.add', {
          patternId,
          name: 'Favourites',
        });
        // Log in as testUserId
        await stubUser({
          _id: userId,
          username: 'testuser',
          roles: ['registered'],
        });
        const fieldName = 'name';
        const fieldValue = 'My favourites';
        async function expectedError() {
          await callMethodWithUser(userId, 'set.edit', {
            _id: setId,
            data: {
              fieldName,
              fieldValue,
              type: 'editTextField',
            },
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'edit-set-not-created-by-user',
        );
      });

      it('can edit a set', async () => {
        const patternId = await createUserAndPattern();
        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });
        const setInitial = await Sets.findOneAsync({});
        assert.equal(setInitial.name, 'Favourites');
        assert.equal(setInitial.description, undefined);
        let fieldName = 'name';
        let fieldValue = 'My favourites';
        await Meteor.callAsync('set.edit', {
          _id: setId,
          data: {
            fieldName,
            fieldValue,
            type: 'editTextField',
          },
        });
        const setUpdated = await Sets.findOneAsync({});
        assert.equal(setUpdated[fieldName], fieldValue);
        fieldName = 'description';
        fieldValue = 'This set contains patterns';
        await Meteor.callAsync('set.edit', {
          _id: setId,
          data: {
            fieldName,
            fieldValue,
            type: 'editTextField',
          },
        });
        const setUpdatedAgain = await Sets.findOneAsync({});
        assert.equal(setUpdatedAgain[fieldName], fieldValue);
      });
    });
  });
}
