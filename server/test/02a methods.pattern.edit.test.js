/* eslint-env mocha */
// test for edit pattern method, which is a large beast
// we are testing permissions, which apply to all edit operations
// and checking that one edit operation succeeds
// ideally, all edit operations would be fully tested
// but that is currently out of scope

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import { assert, expect } from 'chai';
import { Patterns } from '../../imports/modules/collection';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import '../methods/patternEdit';
import {
  stubNoUser,
  stubOtherUser,
  stubUser,
  unwrapUser,
  callMethodWithUser,
} from './mockUser';
import { addPatternDataIndividual } from './testData';

if (Meteor.isServer) {
  describe('test edit method for patterns', function testEditMethod() {
    // eslint-disable-line func-names
    // We use callMethodWithUser to test methods that require a logged-in user
    // This helper directly invokes the method handler with proper context including userId
    // For testing "not logged in" scenarios, we use Meteor.callAsync with no user stub
    this.timeout(15000);
    beforeEach(async () => {
      unwrapUser(); // Clean up any existing stubs
      await resetDatabase();
      await ensureAllRolesExist();
      this.currentUser = await stubUser();
      this.patternId = await callMethodWithUser(
        this.currentUser._id,
        'pattern.add',
        addPatternDataIndividual,
      );
    });
    afterEach(() => {
      unwrapUser();
    });

    describe('pattern.edit method', () => {
      it('cannot edit pattern if not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        await expect(
          Meteor.callAsync('pattern.edit', {
            _id: this.patternId,
            data: {
              type: 'editThreadingCell',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 3,
            },
          }),
        ).to.be.rejectedWith('edit-pattern-not-logged-in');
      });

      it('cannot edit pattern if pattern not found', async () => {
        const otherUser = await stubOtherUser();

        await expect(
          callMethodWithUser(otherUser._id, 'pattern.edit', {
            _id: 'xxx',
            data: {
              type: 'editThreadingCell',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 3,
            },
          }),
        ).to.be.rejectedWith('edit-pattern-not-found');
      });

      it('cannot edit pattern if pattern owned by another user', async () => {
        const otherUser = await stubOtherUser();
        const { patternId } = this;

        await expect(
          callMethodWithUser(otherUser._id, 'pattern.edit', {
            _id: patternId,
            data: {
              type: 'editThreadingCell',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 3,
            },
          }),
        ).to.be.rejectedWith('edit-pattern-not-created-by-user');
      });

      it('cannot edit pattern if invalid values', async () => {
        const { patternId } = this;

        await expect(
          callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: patternId,
            data: {
              type: 'editThreadingCell',
              holesToSet: [-4],
              tablet: 0,
              colorIndex: 3,
            },
          }),
        ).to.be.rejectedWith('Match');
      });

      it('cannot edit pattern if unknown edit type', async () => {
        const { patternId } = this;

        await expect(
          callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: patternId,
            data: {
              type: 'abc',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 3,
            },
          }),
        ).to.be.rejectedWith('edit-pattern-unknown-type');
      });

      it('can edit pattern if all good', async () => {
        const { patternId } = this;

        await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
          _id: patternId,
          data: {
            type: 'editThreadingCell',
            holesToSet: [0, 1],
            tablet: 0,
            colorIndex: 3,
          },
        });

        const updated = await Patterns.findOneAsync({ _id: patternId });

        assert.equal(updated.threading[0][0], 3);
      });
    });
  });
}
