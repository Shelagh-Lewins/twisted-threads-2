/* eslint-env mocha */
// general tests for pattern methods

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import {
  PatternImages,
  Patterns,
  PatternPreviews,
} from '../../imports/modules/collection';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import '../methods/pattern';
import '../methods/patternImages';
import '../methods/tags';
import { ROLE_LIMITS } from '../../imports/modules/parameters';
import { stubUser, unwrapUser } from './mockUser';
import { addPatternDataIndividual } from './testData';
import createManyPatterns from './createManyPatterns';

if (Meteor.isServer) {
  describe('test general methods for patterns', function testpatternmethods() {
    // eslint-disable-line func-names
    this.timeout(30000);
    beforeEach(() => {
      resetDatabase();
    });
    describe('pattern.add method', () => {
      it('cannot create pattern if not logged in', async () => {
        async function expectedError() {
          await Meteor.callAsync('pattern.add', addPatternDataIndividual);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-not-logged-in',
        );
      });

      it('cannot create pattern if not registered', async () => {
        stubUser();
        Roles.removeUsersFromRoles(Meteor.userId(), ['registered']);

        async function expectedError() {
          await Meteor.callAsync('pattern.add', addPatternDataIndividual);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-not-registered',
        );

        unwrapUser();
      });

      it('can create the correct number of patterns if not verified', async () => {
        stubUser();

        const patternLimit = ROLE_LIMITS.registered.maxPatternsPerUser;
        for (let i = 0; i < patternLimit; i += 1) {
          await Meteor.callAsync('pattern.add', addPatternDataIndividual);
        }

        const numberOfPatterns = await Patterns.find().countAsync();

        assert.equal(numberOfPatterns, patternLimit);

        async function expectedError() {
          await Meteor.callAsync('pattern.add', addPatternDataIndividual);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-too-many-patterns',
        );

        unwrapUser();
      });

      it('can create the correct number of patterns if verified', async () => {
        const currentUser = stubUser();

        Roles.createRole('verified', { unlessExists: true });
        Roles.addUsersToRoles(currentUser._id, ['verified']);

        const patternLimit = ROLE_LIMITS.verified.maxPatternsPerUser;
        for (let i = 0; i < patternLimit; i += 1) {
          await Meteor.callAsync('pattern.add', addPatternDataIndividual);
        }

        const numberOfPatterns = await Patterns.find().countAsync();

        assert.equal(numberOfPatterns, patternLimit);

        async function expectedError() {
          await Meteor.callAsync('pattern.add', addPatternDataIndividual);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-too-many-patterns',
        );

        unwrapUser();
      });

      it('can create the correct number of patterns if premium', async () => {
        const currentUser = stubUser();

        Roles.createRole('premium', { unlessExists: true });
        Roles.addUsersToRoles(currentUser._id, ['premium']);

        const patternLimit = ROLE_LIMITS.premium.maxPatternsPerUser;
        for (let i = 0; i < patternLimit; i += 1) {
          await Meteor.callAsync('pattern.add', addPatternDataIndividual);
        }

        const numberOfPatterns = await Patterns.find().countAsync();
        assert.equal(numberOfPatterns, patternLimit);

        async function expectedError() {
          await Meteor.callAsync('pattern.add', addPatternDataIndividual);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-too-many-patterns',
        );

        unwrapUser();
      });
    });

    describe('pattern.remove method', () => {
      it('cannot remove pattern if not logged in', async () => {
        const pattern = Factory.create('pattern', {
          name: 'Pattern 1',
          createdBy: 'abc',
        });

        async function expectedError() {
          await Meteor.callAsync('pattern.remove', pattern._id);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-not-logged-in',
        );
      });

      it('cannot remove pattern if did not create the pattern', async () => {
        async function expectedError() {
          stubUser();

          const pattern = Factory.create('pattern', {
            name: 'Pattern 1',
            createdBy: 'abc',
          });

          await Meteor.callAsync('pattern.remove', pattern._id);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-not-created-by-user',
        );

        unwrapUser();
      });

      it('can remove pattern if user created the pattern', async () => {
        // there will be errors in the log because we can't actually write to AWS in test; ignore them
        const currentUser = stubUser();
        const pattern = Factory.create('pattern', {
          name: 'Pattern 1',
          createdBy: currentUser._id,
        });
        Factory.create('patternPreview', {
          patternId: pattern._id,
          key: 'somekey',
        });
        Factory.create('patternImage', {
          patternId: pattern._id,
        });

        assert.equal(await Patterns.find().countAsync(), 1);
        assert.equal(await PatternPreviews.find().countAsync(), 1);
        assert.equal(await PatternImages.find().countAsync(), 1);
        await Meteor.callAsync('pattern.remove', pattern._id);
        assert.equal(await Patterns.find().countAsync(), 0);
        assert.equal(await PatternPreviews.find().countAsync(), 0);
        assert.equal(await PatternImages.find().countAsync(), 0);
        unwrapUser();
      });
    });

    describe('pattern.getPatternCount method', () => {
      // getPatternCount should count the patterns the user can see, for pagination.
      it('returns 0 when the user is not logged in', async () => {
        // create patterns owned by other users
        Factory.create('pattern', {
          name: 'Other Pattern 1',
          createdBy: 'abc',
        });
        Factory.create('pattern', {
          name: 'Other Pattern 2',
          createdBy: 'def',
        });
        Factory.create('pattern', {
          name: 'Other Pattern 3',
          createdBy: 'ghic',
        });

        const result = await Meteor.callAsync('pattern.getPatternCount', {});
        assert.equal(result, 0);
      });

      it('returns 2 when the user has 2 patterns in the database', async () => {
        // create patterns owned by other users
        Factory.create('pattern', {
          name: 'Other Pattern 1',
          createdBy: 'abc',
        });
        Factory.create('pattern', {
          name: 'Other Pattern 2',
          createdBy: 'def',
        });
        Factory.create('pattern', {
          name: 'Other Pattern 3',
          createdBy: 'ghic',
        });

        // create patterns owned by the current user
        const currentUser = stubUser();
        Factory.create('pattern', {
          name: 'My Pattern 1',
          createdBy: currentUser._id,
        });
        Factory.create('pattern', {
          name: 'My Pattern 2',
          createdBy: currentUser._id,
        });

        const result = await Meteor.callAsync('pattern.getPatternCount', {});
        assert.equal(result, 2);
        unwrapUser();
      });
      it("returns the user's own patterns plus public patterns", async () => {
        stubUser();
        const {
          publicMyPatternNames,
          privateMyPatternNames,
          publicOtherPatternNames,
        } = await createManyPatterns();

        const result = await Meteor.callAsync('pattern.getPatternCount', {});
        const expectedNumber =
          publicMyPatternNames.length +
          privateMyPatternNames.length +
          publicOtherPatternNames.length;
        assert.equal(result, expectedNumber);
        unwrapUser();
      });
    });
  });
}
