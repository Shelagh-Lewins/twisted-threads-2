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
import { stubNoUser, stubOtherUser, stubUser, unwrapUser } from './mockUser';
import { addPatternDataIndividual } from './testData';

chai.use(chaiAsPromised);
const { assert, expect } = chai;

if (Meteor.isServer) {
  // eslint-disable-next-line func-names
  describe('test methods for sets', function () {
    // eslint-disable-line func-names
    this.timeout(30000);

    beforeEach(async () => {
      resetDatabase();
      stubUser();
      this.patternId = await Meteor.callAsync(
        'pattern.add',
        addPatternDataIndividual,
      );
    });

    afterEach(() => {
      unwrapUser();
    });

    describe('set.add method', () => {
      // create a set and assign a pattern to it
      it('cannot create set if not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('set.add', {
            patternId,
            name: 'Favourites',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-set-not-logged-in',
        );
      });

      it('cannot create set if not registered', async () => {
        await Roles.removeUsersFromRolesAsync([Meteor.userId()], ['registered']);
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('set.add', {
            patternId,
            name: 'Favourites',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-set-not-registered',
        );
      });

      it('can create the correct number of sets if registered', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        for (let i = 0; i < MAX_SETS; i += 1) {
          await Meteor.callAsync('set.add', {
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
        await Roles.addUsersToRolesAsync([Meteor.userId()], ['verified']);

        await Meteor.callAsync('pattern.edit', {
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
          await Meteor.callAsync('set.add', {
            patternId,
            name: 'Favourites',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-set-too-many-sets',
        );
      });

      it('cannot create set if pattern not found', async () => {
        async function expectedError() {
          await Meteor.callAsync('set.add', {
            patternId: 'abc',
            name: 'Favourites',
          });
        }

        await expect(expectedError()).to.be.rejectedWith('add-set-not-found');
      });
    });

    describe('set.addPattern method', () => {
      // create a set and assign a pattern to it
      it('cannot add pattern to set if not logged in', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        // create a second pattern
        Roles.createRole('verified', { unlessExists: true });
        Roles.addUsersToRoles(Meteor.userId(), ['verified']);
        const newPatternId = await Meteor.callAsync(
          'pattern.add',
          addPatternDataIndividual,
        );

        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

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
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('set.addPattern', {
            patternId,
            setId: '123',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-set-not-found',
        );
      });

      it('cannot add pattern to set if another user created the set', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        // create a second pattern
        Roles.createRole('verified', { unlessExists: true });
        Roles.addUsersToRoles(Meteor.userId(), ['verified']);
        const newPatternId = await Meteor.callAsync(
          'pattern.add',
          addPatternDataIndividual,
        );

        // log in a different user
        stubOtherUser();

        async function expectedError() {
          await Meteor.callAsync('set.addPattern', {
            patternId: newPatternId,
            setId,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-not-created-by-user',
        );
      });
      it('cannot add pattern to set if pattern not found', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        async function expectedError() {
          await Meteor.callAsync('set.addPattern', {
            patternId: 'abc',
            setId,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-pattern-not-found',
        );
      });

      it('cannot add pattern to set if the pattern is already in the set', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        async function expectedError() {
          await Meteor.callAsync('set.addPattern', {
            patternId,
            setId,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'add-to-set-already-in-set',
        );
      });

      it('can add the correct number of patterns to the set', async () => {
        // give user premium role so they can create many patterns
        await Roles.createRoleAsync('premium', { unlessExists: true });
        await Roles.addUsersToRolesAsync([Meteor.userId()], ['premium']);

        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        for (let i = 0; i < MAX_PATTERNS_IN_SET - 1; i += 1) {
          const newPatternId = await Meteor.callAsync(
            'pattern.add',
            addPatternDataIndividual,
          );

          await Meteor.callAsync('set.addPattern', {
            patternId: newPatternId,
            setId,
          });
        }

        const newPatternId2 = await Meteor.callAsync(
          'pattern.add',
          addPatternDataIndividual,
        );

        async function expectedError() {
          await Meteor.callAsync('set.addPattern', {
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
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        // create a second pattern
        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync([Meteor.userId()], ['verified']);

        const newPatternId = await Meteor.callAsync(
          'pattern.add',
          addPatternDataIndividual,
        );

        // make sure publications know there is no user
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
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

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
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        // log in a different user
        stubOtherUser();

        async function expectedError() {
          await Meteor.callAsync('set.removePattern', {
            patternId,
            setId,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-from-set-not-created-by-user',
        );
      });

      it('cannot remove pattern from set if the pattern was not found', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

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
        // give user verified role so they can create many patterns
        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync([Meteor.userId()], ['verified']);

        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        const newPatternId = await Meteor.callAsync(
          'pattern.add',
          addPatternDataIndividual,
        );

        async function expectedError() {
          await Meteor.callAsync('set.removePattern', {
            patternId: newPatternId,
            setId,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-from-set-not-in-set',
        );
      });

      it('can remove pattern from set', async () => {
        // give user verified role so they can create many patterns
        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync([Meteor.userId()], ['verified']);

        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        // add a second pattern to the set
        const newPatternId = await Meteor.callAsync(
          'pattern.add',
          addPatternDataIndividual,
        );

        await Meteor.callAsync('set.addPattern', {
          patternId: newPatternId,
          setId,
        });

        const setInitial = await Sets.findOneAsync({});

        assert.equal(setInitial.patterns.length, 2);

        await Meteor.callAsync('set.removePattern', {
          patternId,
          setId,
        });

        const setUpdated = await Sets.findOneAsync({});

        assert.equal(setUpdated.patterns.length, 1);

        // check set is removed now it has no patterns
        await Meteor.callAsync('set.removePattern', {
          patternId: newPatternId,
          setId,
        });

        assert.equal(await Sets.find({}).countAsync(), 0);
      });
    });

    describe('set.remove method', () => {
      it('cannot remove a set if not logged in', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        // make sure publications know there is no user
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
        async function expectedError() {
          await Meteor.callAsync('set.remove', 'abc');
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-set-not-found',
        );
      });

      it('cannot remove a set if set not created by the user', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        stubOtherUser();

        async function expectedError() {
          await Meteor.callAsync('set.remove', setId);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-set-not-created-by-user',
        );
      });

      it('can remove a set', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

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
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        // make sure publications know there is no user
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
        const fieldName = 'name';
        const fieldValue = 'My favourites';

        async function expectedError() {
          await Meteor.callAsync('set.edit', {
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
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = await Meteor.callAsync('set.add', {
          patternId,
          name: 'Favourites',
        });

        stubOtherUser();

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
          'edit-set-not-created-by-user',
        );
      });

      it('can edit a set', async () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

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
