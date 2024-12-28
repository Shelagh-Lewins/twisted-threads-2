/* eslint-env mocha */
// test for sets methods

import { resetDatabase } from 'meteor/xolvio:cleaner';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

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

    beforeEach(() => {
      resetDatabase();
      stubUser();
      this.patternId = Meteor.call('pattern.add', addPatternDataIndividual);
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
        Roles.removeUsersFromRoles(Meteor.userId(), ['registered']);
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
        Roles.createRole('verified', { unlessExists: true });
        Roles.addUsersToRoles(Meteor.userId(), ['verified']);

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
          await Meteor.call('set.add', {
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
      it('can add the correct number of patterns to the set', () => {
        // give user premium role so they can create many patterns
        Roles.createRole('premium', { unlessExists: true });
        Roles.addUsersToRoles(Meteor.userId(), ['premium']);

        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        for (let i = 0; i < MAX_PATTERNS_IN_SET - 1; i += 1) {
          const newPatternId = Meteor.call(
            'pattern.add',
            addPatternDataIndividual,
          );

          Meteor.call('set.addPattern', {
            patternId: newPatternId,
            setId,
          });
        }

        const newPatternId2 = Meteor.call(
          'pattern.add',
          addPatternDataIndividual,
        );

        function expectedError() {
          Meteor.call('set.addPattern', {
            patternId: newPatternId2,
            setId,
          });
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
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
          await Meteor.callAsync('set.removePattern', {
            patternId: newPatternId,
            setId,
          });
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-from-set-not-logged-in',
        );
      });
      it('cannot remove pattern from set if the set not found', () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        function expectedError() {
          Meteor.call('set.removePattern', {
            patternId,
            setId: 'abc',
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-from-set-set-not-found',
        );
      });
      it('cannot remove pattern from set if the set was created by another user', () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        // log in a different user
        stubOtherUser();

        function expectedError() {
          Meteor.call('set.removePattern', {
            patternId,
            setId,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-from-set-not-created-by-user',
        );
      });
      it('cannot remove pattern from set if the pattern was not found', () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        function expectedError() {
          Meteor.call('set.removePattern', {
            patternId: 'abc',
            setId,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-from-set-pattern-not-found',
        );
      });
      it('cannot remove pattern from set if the pattern was not in the set', () => {
        // give user verified role so they can create many patterns
        Roles.createRole('verified', { unlessExists: true });
        Roles.addUsersToRoles(Meteor.userId(), ['verified']);

        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        const newPatternId = Meteor.call(
          'pattern.add',
          addPatternDataIndividual,
        );

        function expectedError() {
          Meteor.call('set.removePattern', {
            patternId: newPatternId,
            setId,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-from-set-not-in-set',
        );
      });
      it('can remove pattern from set', async () => {
        // give user verified role so they can create many patterns
        Roles.createRole('verified', { unlessExists: true });
        Roles.addUsersToRoles(Meteor.userId(), ['verified']);

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

        assert.equal(Sets.find({}).fetch().length, 0);
      });
    });

    describe('set.remove method', () => {
      it('cannot remove a set if not logged in', () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        function expectedError() {
          Meteor.call('set.remove', setId);
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-set-not-logged-in',
        );
      });
      it('cannot remove a set if set not found', () => {
        function expectedError() {
          Meteor.call('set.remove', 'abc');
        }
        expect(expectedError).to.throw(Meteor.Error(), 'remove-set-not-found');
      });
      it('cannot remove a set if set not created by the user', () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        stubOtherUser();

        function expectedError() {
          Meteor.call('set.remove', setId);
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-set-not-created-by-user',
        );
      });
      it('can remove a set', () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        assert.equal(Sets.find({}).fetch().length, 1);

        Meteor.call('set.remove', setId);

        assert.equal(Sets.find({}).fetch().length, 0);
      });
    });
    describe('set.edit method', () => {
      it('cannot edit a set if not logged in', () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();

        const fieldName = 'name';
        const fieldValue = 'My favourites';

        function expectedError() {
          Meteor.call('set.edit', {
            _id: setId,
            data: {
              fieldName,
              fieldValue,
              type: 'editTextField',
            },
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'edit-set-not-logged-in',
        );
      });
      it('cannot edit a set if the set was not found', () => {
        const fieldName = 'name';
        const fieldValue = 'My favourites';

        function expectedError() {
          Meteor.call('set.edit', {
            _id: 'abc',
            data: {
              fieldName,
              fieldValue,
              type: 'editTextField',
            },
          });
        }
        expect(expectedError).to.throw(Meteor.Error(), 'edit-set-not-found');
      });
      it('cannot edit a set if the set was not created by the current user', () => {
        // create a set by adding a pattern
        const { patternId } = this; // seems to be a scoping issue otherwise

        const setId = Meteor.call('set.add', {
          patternId,
          name: 'Favourites',
        });

        stubOtherUser();

        const fieldName = 'name';
        const fieldValue = 'My favourites';

        function expectedError() {
          Meteor.call('set.edit', {
            _id: setId,
            data: {
              fieldName,
              fieldValue,
              type: 'editTextField',
            },
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
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
