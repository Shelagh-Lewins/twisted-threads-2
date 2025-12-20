/* eslint-env mocha */
// test for edit pattern method, which is a large beast
// we are testing permissions, which apply to all edit operations
// and checking that one edit operation succeeds
// ideally, all edit operations would be fully tested
// but that is currently out of scope

import { resetDatabase } from './00_setup';
import { assert, expect } from 'chai';
import { Patterns } from '../../imports/modules/collection';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import '../methods/patternEdit';
import { stubNoUser, stubOtherUser, stubUser, unwrapUser } from './mockUser';
import { addPatternDataIndividual } from './testData';

if (Meteor.isServer) {
  describe('test edit method for patterns', function testEditMethod() {
    // eslint-disable-line func-names
    this.timeout(15000);
    beforeEach(async () => {
      resetDatabase();
      await stubUser();
      this.patternId = await Meteor.callAsync(
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
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('pattern.edit', {
            _id: patternId,
            data: {
              type: 'editThreadingCell',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 3,
            },
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-pattern-not-logged-in',
        );
      });

      it('cannot edit pattern if pattern not found', async () => {
        await stubOtherUser();

        async function expectedError() {
          await Meteor.callAsync('pattern.edit', {
            _id: 'xxx',
            data: {
              type: 'editThreadingCell',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 3,
            },
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-pattern-not-found',
        );
      });

      it('cannot edit pattern if pattern owned by another user', async () => {
        stubOtherUser();
        const { patternId } = this;

        async function expectedError() {
          await Meteor.callAsync('pattern.edit', {
            _id: patternId,
            data: {
              type: 'editThreadingCell',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 3,
            },
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-pattern-not-created-by-user',
        );
      });

      it('cannot edit pattern if invalid values', async () => {
        const { patternId } = this;

        async function expectedError() {
          await Meteor.callAsync('pattern.edit', {
            _id: patternId,
            data: {
              type: 'editThreadingCell',
              holesToSet: [-4],
              tablet: 0,
              colorIndex: 3,
            },
          });
        }

        await expect(expectedError()).to.be.rejectedWith('Match');
      });

      it('cannot edit pattern if unknown edit type', async () => {
        const { patternId } = this;

        async function expectedError() {
          await Meteor.callAsync('pattern.edit', {
            _id: patternId,
            data: {
              type: 'abc',
              holesToSet: [0],
              tablet: 0,
              colorIndex: 3,
            },
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-pattern-unknown-type',
        );
      });

      it('can edit pattern if all good', async () => {
        const { patternId } = this;

        await Meteor.callAsync('pattern.edit', {
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
