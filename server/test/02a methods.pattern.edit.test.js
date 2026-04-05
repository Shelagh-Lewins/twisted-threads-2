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
import { addPatternDataIndividual, createPattern } from './testData';

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

      describe('border operations', () => {
        beforeEach(async () => {
          const pattern = await createPattern({
            createdBy: this.currentUser._id,
            patternType: 'brokenTwill',
          });
          this.brokenTwillPatternId = pattern._id;
        });

        it('can add a new left border', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 2,
              insertTabletsAt: 0,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(updated.leftBorder.numberOfTablets, 2);
          // 4 holes, each with 2 tablets filled with colorIndex 0
          assert.equal(updated.leftBorder.threading.length, 4);
          assert.deepEqual(updated.leftBorder.threading[0], [0, 0]);
          assert.equal(updated.leftBorder.orientations.length, 2);
        });

        it('can extend an existing left border', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 2,
              insertTabletsAt: 0,
            },
          });

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 1,
              insertNTablets: 1,
              insertTabletsAt: 0,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(updated.leftBorder.numberOfTablets, 3);
          assert.equal(updated.leftBorder.threading[0].length, 3);
        });

        it('cannot add border tablets to an individual pattern', async () => {
          const { patternId } = this;

          await expect(
            callMethodWithUser(this.currentUser._id, 'pattern.edit', {
              _id: patternId,
              data: {
                type: 'addLeftBorderTablets',
                colorIndex: 0,
                insertNTablets: 1,
                insertTabletsAt: 0,
              },
            }),
          ).to.be.rejectedWith('add-border-tablets-invalid-pattern-type');
        });

        it('can remove the only border tablet, clearing the border', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 1,
              insertTabletsAt: 0,
            },
          });

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'removeLeftBorderTablet',
              tablet: 0,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.isUndefined(updated.leftBorder);
        });

        it('can remove one of two border tablets, reducing count to 1', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 2,
              insertTabletsAt: 0,
            },
          });

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'removeLeftBorderTablet',
              tablet: 0,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(updated.leftBorder.numberOfTablets, 1);
          assert.equal(updated.leftBorder.threading[0].length, 1);
        });

        it('can edit a border threading cell', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 2,
              insertTabletsAt: 0,
            },
          });

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'editBorderThreadingCell',
              side: 'left',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 2,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(updated.leftBorder.threading[0][0], 2);
        });

        it('can edit a border orientation', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 1,
              insertTabletsAt: 0,
            },
          });

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'editBorderOrientation',
              side: 'left',
              tablet: 0,
              tabletOrientation: '\\',
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(updated.leftBorder.orientations[0], '\\');
        });

        it('can edit a border weaving cell direction', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 1,
              insertTabletsAt: 0,
            },
          });

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'editBorderWeavingCell',
              side: 'left',
              row: 0,
              tablet: 0,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          // toggling direction from default 'F' should give 'B' for row 0 onwards
          assert.equal(
            updated.leftBorder.weavingInstructions[0][0].direction,
            'B',
          );
        });

        it('can edit a border weaving cell number of turns', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 1,
              insertTabletsAt: 0,
            },
          });

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'editBorderWeavingCellTurns',
              side: 'left',
              row: 0,
              tablet: 0,
              numberOfTurns: 3,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(
            updated.leftBorder.weavingInstructions[0][0].numberOfTurns,
            3,
          );
        });

        it('can edit border includeInTwist', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addLeftBorderTablets',
              colorIndex: 0,
              insertNTablets: 1,
              insertTabletsAt: 0,
            },
          });

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'editBorderIncludeInTwist',
              side: 'left',
              tablet: 0,
              tabletIncludeInTwist: false,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(updated.leftBorder.includeInTwist[0], false);
        });

        it('can add a new right border', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'addRightBorderTablets',
              colorIndex: 0,
              insertNTablets: 2,
              insertTabletsAt: 0,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(updated.rightBorder.numberOfTablets, 2);
          assert.equal(updated.rightBorder.threading.length, 4);
          assert.deepEqual(updated.rightBorder.threading[0], [0, 0]);
        });

        it('cannot add border tablets that would exceed MAX_TABLETS', async () => {
          const { brokenTwillPatternId } = this;

          // Pattern has 8 main tablets; adding 93 would give 101 > MAX_TABLETS (100)
          await expect(
            callMethodWithUser(this.currentUser._id, 'pattern.edit', {
              _id: brokenTwillPatternId,
              data: {
                type: 'addLeftBorderTablets',
                colorIndex: 0,
                insertNTablets: 93,
                insertTabletsAt: 0,
              },
            }),
          ).to.be.rejectedWith('add-border-tablets-too-many');
        });

        it('can set a tablet guide for a main-pattern tablet', async () => {
          const { brokenTwillPatternId } = this;

          await callMethodWithUser(this.currentUser._id, 'pattern.edit', {
            _id: brokenTwillPatternId,
            data: {
              type: 'tabletGuides',
              tablet: 0,
              tabletGuide: true,
            },
          });

          const updated = await Patterns.findOneAsync({
            _id: brokenTwillPatternId,
          });

          assert.equal(updated.tabletGuides[0], true);
        });
      });
    });
  });
}
