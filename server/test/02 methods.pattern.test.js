/* eslint-env mocha */
// general tests for pattern methods

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import { assert, expect } from 'chai';
import { Roles } from 'meteor/roles';
import {
  PatternImages,
  Patterns,
  PatternPreviews,
} from '../../imports/modules/collection';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import '../methods/pattern';
import '../methods/patternImages';
import '../methods/patternPreview';
import '../methods/tags';
import { ROLE_LIMITS } from '../../imports/modules/parameters';
import { stubUser, unwrapUser, callMethodWithUser } from './mockUser';
import {
  addPatternDataIndividual,
  createPattern,
  createPatternPreview,
  createPatternImage,
  TEST_USER_ABC,
  TEST_USER_OTHER,
  importPatternDataSimple,
  importPatternDataFull,
} from './testData';
import createManyPatterns from './createManyPatterns';
import {
  createOtherUsersPatterns,
  createUserAndPattern,
} from './testHelpers';

// Helper function to test pattern creation limits for a role
async function testPatternLimit(userId, expectedLimit) {
  // Create patterns up to the limit
  for (let i = 0; i < expectedLimit; i += 1) {
    await callMethodWithUser(userId, 'pattern.add', addPatternDataIndividual);
  }

  const numberOfPatterns = await Patterns.find().countAsync();
  assert.equal(numberOfPatterns, expectedLimit);

  // Attempting to exceed the limit should fail
  await expect(
    callMethodWithUser(userId, 'pattern.add', addPatternDataIndividual),
  ).to.be.rejectedWith('add-pattern-too-many-patterns');
}

if (Meteor.isServer) {
  describe('test general methods for patterns', function testpatternmethods() {
    this.timeout(15000);
    beforeEach(async () => {
      unwrapUser();
      await resetDatabase();
      await ensureAllRolesExist();
    });

    afterEach(() => {
      unwrapUser(); // Clean up stubs after each test
    });
    describe('pattern.add method', () => {
      it('cannot create pattern if not logged in', async () => {
        // NOT logged in: use Meteor.callAsync() - this.userId will be undefined
        await expect(
          Meteor.callAsync('pattern.add', addPatternDataIndividual),
        ).to.be.rejectedWith('add-pattern-not-logged-in');
      });

      it('cannot create pattern if not registered', async () => {
        // Logged in: use callMethodWithUser() to set this.userId properly
        const currentUser = await stubUser();
        await Roles.removeUsersFromRolesAsync(
          [currentUser._id],
          ['registered'],
        );

        await expect(
          callMethodWithUser(
            currentUser._id,
            'pattern.add',
            addPatternDataIndividual,
          ),
        ).to.be.rejectedWith('add-pattern-not-registered');
      });

      it('can create the correct number of patterns if not verified', async () => {
        const currentUser = await stubUser();
        const patternLimit = ROLE_LIMITS.registered.maxPatternsPerUser;

        await testPatternLimit(currentUser._id, patternLimit);
      });

      it('can create the correct number of patterns if verified', async () => {
        await ensureAllRolesExist();
        const currentUser = await stubUser();
        await Roles.addUsersToRolesAsync([currentUser._id], ['verified']);
        const patternLimit = ROLE_LIMITS.verified.maxPatternsPerUser;
        await testPatternLimit(currentUser._id, patternLimit);
      });

      it('can create the correct number of patterns if premium', async () => {
        await ensureAllRolesExist();
        const currentUser = await stubUser();
        await Roles.addUsersToRolesAsync([currentUser._id], ['premium']);
        const patternLimit = ROLE_LIMITS.premium.maxPatternsPerUser;
        await testPatternLimit(currentUser._id, patternLimit);
      });
    });

    describe('pattern.remove method', () => {
      it('cannot remove pattern if not logged in', async () => {
        const pattern = await createPattern({
          name: 'Pattern 1',
          createdBy: TEST_USER_ABC,
        });

        await expect(
          Meteor.callAsync('pattern.remove', pattern._id),
        ).to.be.rejectedWith('remove-pattern-not-logged-in');
      });

      it('cannot remove pattern if did not create the pattern', async () => {
        const currentUser = await stubUser();

        const pattern = await createPattern({
          name: 'Pattern 1',
          createdBy: TEST_USER_ABC,
        });

        await expect(
          callMethodWithUser(currentUser._id, 'pattern.remove', pattern._id),
        ).to.be.rejectedWith('remove-pattern-not-created-by-user');
      });

      it('can remove pattern if user created the pattern', async () => {
        // there will be errors in the log because we can't actually write to AWS in test; ignore them
        const currentUser = await stubUser();
        const pattern = await createPattern({
          name: 'Pattern 1',
          createdBy: currentUser._id,
        });
        await createPatternPreview({
          patternId: pattern._id,
          key: 'somekey',
        });
        await createPatternImage({
          patternId: pattern._id,
        });

        assert.equal(await Patterns.find().countAsync(), 1);
        assert.equal(await PatternPreviews.find().countAsync(), 1);
        assert.equal(await PatternImages.find().countAsync(), 1);
        await callMethodWithUser(
          currentUser._id,
          'pattern.remove',
          pattern._id,
        );
        assert.equal(await Patterns.find().countAsync(), 0);
        assert.equal(await PatternPreviews.find().countAsync(), 0);
        assert.equal(await PatternImages.find().countAsync(), 0);
      });
    });

    describe('pattern.getPatternCount method', () => {
      it('returns private patterns for the owner, and only public patterns for others or logged-out users (regression test for userId permission bug)', async () => {
        // Create two users
        const userA = await stubUser();
        const userB = await stubUser();

        // As userA, create a private pattern
        const privatePatternId = await createUserAndPattern(
          userA._id,
          ['registered', 'verified'],
          { name: 'Private Pattern' },
        );

        // As userB, create a pattern, then set it public
        const publicPatternId = await createUserAndPattern(
          userB._id,
          ['registered', 'verified'],
          { name: 'Public Pattern' },
        );
        await callMethodWithUser(userB._id, 'pattern.edit', {
          _id: publicPatternId,
          data: {
            type: 'editIsPublic',
            isPublic: true,
          },
        });

        // As userA, should see both their own private and userB's public pattern
        const countA = await callMethodWithUser(
          userA._id,
          'pattern.getPatternCount',
          {},
        );
        assert.equal(
          countA,
          2,
          'userA should see their own private and userB public pattern',
        );

        // As userB, should see only their own public pattern
        const countB = await callMethodWithUser(
          userB._id,
          'pattern.getPatternCount',
          {},
        );
        assert.equal(
          countB,
          1,
          'userB should see only their own public pattern',
        );

        // As logged-out user, should see only the public pattern
        unwrapUser();
        const countLoggedOut = await Meteor.callAsync(
          'pattern.getPatternCount',
          {},
        );
        assert.equal(
          countLoggedOut,
          1,
          'logged-out user should see only the public pattern',
        );
      });
      // Tests counting patterns visible to user (used for pagination)
      // Users can see their own patterns (public + private) plus other users' public patterns
      it('returns 0 when the user is not logged in', async () => {
        // Create patterns owned by other users
        await createOtherUsersPatterns(3);

        const result = await Meteor.callAsync('pattern.getPatternCount', {});
        assert.equal(result, 0);
      });

      it('returns 2 when the user has 2 patterns in the database', async () => {
        // Create patterns owned by other users (not visible to current user)
        await createOtherUsersPatterns(3);

        // Create patterns owned by the current user
        const currentUser = await stubUser();
        await createPattern({
          name: 'My Pattern 1',
          createdBy: currentUser._id,
        });
        await createPattern({
          name: 'My Pattern 2',
          createdBy: currentUser._id,
        });

        const result = await callMethodWithUser(
          currentUser._id,
          'pattern.getPatternCount',
          {},
        );
        assert.equal(result, 2);
      });
      it("returns the user's own patterns plus public patterns", async () => {
        const currentUser = await stubUser();
        const {
          publicMyPatternNames,
          privateMyPatternNames,
          publicOtherPatternNames,
        } = await createManyPatterns();

        const result = await callMethodWithUser(
          currentUser._id,
          'pattern.getPatternCount',
          {},
        );
        const expectedNumber =
          publicMyPatternNames.length +
          privateMyPatternNames.length +
          publicOtherPatternNames.length;
        assert.equal(result, expectedNumber);
      });
    });

    describe('pattern.copy method', () => {
      it('cannot copy pattern if not logged in', async () => {
        const pattern = await createPattern({
          name: 'Pattern 1',
          createdBy: TEST_USER_ABC,
          isPublic: true,
        });

        await expect(
          Meteor.callAsync('pattern.copy', pattern._id),
        ).to.be.rejectedWith('add-pattern-not-logged-in');
      });

      it('cannot copy pattern that does not exist', async () => {
        const currentUser = await stubUser();

        await expect(
          callMethodWithUser(currentUser._id, 'pattern.copy', 'nonexistent_id'),
        ).to.be.rejectedWith('copy-pattern-not-found');
      });

      it("cannot copy another user's private pattern", async () => {
        const otherPattern = await createPattern({
          name: 'Private Pattern',
          createdBy: TEST_USER_OTHER,
          isPublic: false,
        });

        const currentUser = await stubUser();

        await expect(
          callMethodWithUser(currentUser._id, 'pattern.copy', otherPattern._id),
        ).to.be.rejectedWith('copy-pattern-not-created-by-user');
      });

      it("can copy another user's public pattern", async () => {
        // Create a fresh user for this test to avoid pattern limit issues
        const currentUser = await stubUser();

        const publicPattern = await createPattern({
          name: 'Public Pattern',
          createdBy: TEST_USER_OTHER,
          isPublic: true,
        });

        const newPatternId = await callMethodWithUser(
          currentUser._id,
          'pattern.copy',
          publicPattern._id,
        );

        assert.isString(newPatternId);
        assert.notEqual(newPatternId, publicPattern._id);

        const newPattern = await Patterns.findOneAsync({ _id: newPatternId });
        assert.equal(newPattern.createdBy, currentUser._id);
        assert.include(newPattern.name, publicPattern.name);
        assert.include(newPattern.name, '(copy)');
      });

      it('can copy own pattern', async () => {
        // Create a fresh user with verified role for higher pattern limit
        await ensureAllRolesExist();
        const currentUser = await stubUser();
        await Roles.addUsersToRolesAsync([currentUser._id], ['verified']);

        const myPattern = await createPattern({
          name: 'My Pattern',
          createdBy: currentUser._id,
          isPublic: false,
        });

        const newPatternId = await callMethodWithUser(
          currentUser._id,
          'pattern.copy',
          myPattern._id,
        );

        assert.isString(newPatternId);
        assert.notEqual(newPatternId, myPattern._id);

        // Should have 2 patterns now (original + copy)
        const count = await Patterns.find({
          createdBy: currentUser._id,
        }).countAsync();
        assert.equal(count, 2);
      });
    });

    describe('pattern.newPatternFromData method', () => {
      it('cannot import pattern if not logged in', async () => {
        await expect(
          Meteor.callAsync('pattern.newPatternFromData', {
            patternObj: importPatternDataSimple,
          }),
        ).to.be.rejectedWith('add-pattern-not-logged-in');
      });

      it('cannot import pattern if not registered', async () => {
        const currentUser = await stubUser();
        await Roles.removeUsersFromRolesAsync(
          [currentUser._id],
          ['registered'],
        );

        await expect(
          callMethodWithUser(currentUser._id, 'pattern.newPatternFromData', {
            patternObj: importPatternDataSimple,
          }),
        ).to.be.rejectedWith('add-pattern-not-registered');
      });

      it('can import valid pattern data', async () => {
        const currentUser = await stubUser();

        const newPatternId = await callMethodWithUser(
          currentUser._id,
          'pattern.newPatternFromData',
          { patternObj: importPatternDataFull },
        );

        assert.isString(newPatternId);
        const newPattern = await Patterns.findOneAsync({ _id: newPatternId });
        assert.equal(newPattern.createdBy, currentUser._id);
        assert.equal(newPattern.description, 'Imported pattern description');
        assert.equal(newPattern.numberOfRows, 10);
        assert.equal(newPattern.numberOfTablets, 8);
      });
    });
  });
}
