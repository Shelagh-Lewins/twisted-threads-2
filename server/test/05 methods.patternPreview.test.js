/* eslint-env mocha */
// test for pattern preview methods
// we only check permissions because the image would come from the client

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { expect } from 'chai';
import { Roles } from 'meteor/roles';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import '../methods/patternPreview';
import { stubNoUser, stubOtherUser, stubUser, unwrapUser } from './mockUser';
import { addPatternDataIndividual } from './testData';

if (Meteor.isServer) {
  // eslint-disable-next-line func-names
  describe('test methods for pattern previews', function () {
    // eslint-disable-line func-names
    this.timeout(15000);
    beforeEach(async () => {
      resetDatabase();
      stubUser();
      this.patternId = await Meteor.callAsync('pattern.add', {
        ...{ createdBy: Meteor.userId() },
        ...addPatternDataIndividual,
      });
    });

    afterEach(() => {
      resetDatabase();
      unwrapUser();
    });

    describe('patternPreview.save method', () => {
      it('cannot save pattern preview if not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-not-logged-in',
        );
      });

      it('cannot save pattern preview if pattern not found', async () => {
        async function expectedError() {
          await Meteor.callAsync('patternPreview.save', {
            _id: 'abc',
            uri: 'a_uri',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-not-found',
        );
      });

      it('cannot save pattern preview if pattern created by another user', async () => {
        stubOtherUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-not-created-by-user',
        );
      });

      it('can save pattern preview if user has serviceUser role', async () => {
        stubOtherUser();

        // give user serviceUser role
        await Roles.createRoleAsync('serviceUser', { unlessExists: true });
        await Roles.addUsersToRolesAsync(Meteor.userId(), ['serviceUser']);

        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-error', // expect an error as we don't actually want to save to S3 in the test!
          's3.upload',
        );
      });

      it('cannot save pattern preview if image invalid', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-error',
          'image size',
        );
      });
    });

    describe('patternPreview.remove method', () => {
      it('cannot remove pattern preview if not logged in', async () => {
        // make sure publications know there is no user
        unwrapUser();
        stubNoUser();
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('patternPreview.remove', {
            _id: patternId,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-preview-not-logged-in',
        );
      });

      it('cannot remove pattern preview if pattern not found', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        async function expectedError() {
          await Meteor.callAsync('patternPreview.remove', {
            _id: patternId,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-preview-not-found',
        );
      });

      it('cannot remove pattern preview if pattern created by another user', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const patternPreview = Factory.create('patternPreview', {
          patternId,
          uri: 'something',
          createdBy: Meteor.userId(),
        });

        stubOtherUser();

        async function expectedError() {
          await Meteor.callAsync('patternPreview.remove', {
            _id: patternPreview._id,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-preview-not-created-by-user',
        );
      });

      it('cannot remove pattern preview if user has serviceUser role', async () => {
        const { patternId } = this; // seems to be a scoping issue otherwise

        const patternPreview = Factory.create('patternPreview', {
          patternId,
          uri: 'something',
          createdBy: Meteor.userId(),
        });

        stubOtherUser();

        // give user serviceUser role
        await Roles.createRoleAsync('serviceUser', { unlessExists: true });
        await Roles.addUsersToRolesAsync(Meteor.userId(), ['serviceUser']);

        async function expectedError() {
          await Meteor.callAsync('patternPreview.remove', {
            _id: patternPreview._id,
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-preview-not-created-by-user',
        );
      });
    });
  });
}
