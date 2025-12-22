/* eslint-env mocha */
// test for pattern preview methods
// we only check permissions because the image would come from the client

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import { expect } from 'chai';
import { Roles } from 'meteor/roles';
import '../../imports/server/modules/publications';
import '../methods/patternPreview';
import {
  stubNoUser,
  stubOtherUser,
  stubUser,
  unwrapUser,
  callMethodWithUser,
} from './mockUser';
import { addPatternDataIndividual, createPatternPreview } from './testData';

if (Meteor.isServer) {
  // eslint-disable-next-line func-names
  describe('test methods for pattern previews', function () {
    // eslint-disable-line func-names
    this.timeout(15000);

    beforeEach(async function () {
      await unwrapUser();
      await resetDatabase();
      await ensureAllRolesExist();
      this.currentUser = await stubUser();
      this.patternId = await callMethodWithUser(
        this.currentUser._id,
        'pattern.add',
        {
          ...{ createdBy: this.currentUser._id },
          ...addPatternDataIndividual,
        },
      );
    });

    afterEach(async function () {
      await resetDatabase();
      await unwrapUser();
    });

    describe('patternPreview.save method', () => {
      it('cannot save pattern preview if not logged in', async function () {
        // Create a pattern as a valid user, then log out
        const user = await stubUser();
        const patternId = await callMethodWithUser(user._id, 'pattern.add', {
          ...{ createdBy: user._id },
          ...addPatternDataIndividual,
        });
        await unwrapUser();
        await stubNoUser();
        const expectedError = async () => {
          await Meteor.callAsync('patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-not-logged-in',
        );
      });

      it('cannot save pattern preview if pattern not found', async function () {
        // Use a valid user, but a non-existent pattern ID
        const user = await stubUser();
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'patternPreview.save', {
            _id: 'nonexistentpatternid',
            uri: 'a_uri',
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-not-found',
        );
      });

      it('cannot save pattern preview if pattern created by another user', async function () {
        // Create a pattern as one user
        const owner = await stubUser();
        const patternId = await callMethodWithUser(owner._id, 'pattern.add', {
          ...{ createdBy: owner._id },
          ...addPatternDataIndividual,
        });
        // Try to save as a different user
        const otherUser = await stubOtherUser();
        const expectedError = async () => {
          await callMethodWithUser(otherUser._id, 'patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-not-created-by-user',
        );
      });

      it('can save pattern preview if user has serviceUser role', async function () {
        // Create a pattern as one user
        const owner = await stubUser();
        const patternId = await callMethodWithUser(owner._id, 'pattern.add', {
          ...{ createdBy: owner._id },
          ...addPatternDataIndividual,
        });
        // Try to save as a different user with serviceUser role
        const otherUser = await stubOtherUser();
        await Roles.createRoleAsync('serviceUser', { unlessExists: true });
        await Roles.addUsersToRolesAsync([otherUser._id], ['serviceUser']);
        const expectedError = async () => {
          await callMethodWithUser(otherUser._id, 'patternPreview.save', {
            _id: patternId,
            uri: 'a_uri',
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-error',
          's3.upload',
        );
      });

      it('cannot save pattern preview if image invalid', async function () {
        // Use a valid user and pattern, but pass an invalid image/uri
        const user = await stubUser();
        const patternId = await callMethodWithUser(user._id, 'pattern.add', {
          ...{ createdBy: user._id },
          ...addPatternDataIndividual,
        });
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'patternPreview.save', {
            _id: patternId,
            uri: '', // Simulate invalid image/uri
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'save-preview-error',
          'image size',
        );
      });
    });

    describe('patternPreview.remove method', () => {
      it('cannot remove pattern preview if not logged in', async function () {
        // Create a pattern and preview as a logged-in user, then log out
        const user = await stubUser();
        const patternId = await callMethodWithUser(user._id, 'pattern.add', {
          ...{ createdBy: user._id },
          ...addPatternDataIndividual,
        });
        const previewId = await createPatternPreview({
          patternId,
          uri: 'something',
          createdBy: user._id,
        });
        await unwrapUser();
        await stubNoUser();
        const expectedError = async () => {
          await Meteor.callAsync('patternPreview.remove', {
            _id: previewId._id,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-preview-not-logged-in',
        );
      });

      it('cannot remove pattern preview if pattern not found', async function () {
        // Use a valid user and a non-existent preview ID
        const user = await stubUser();
        const expectedError = async () => {
          await callMethodWithUser(user._id, 'patternPreview.remove', {
            _id: 'nonexistentpreviewid',
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-preview-not-found',
        );
      });

      it('cannot remove pattern preview if pattern created by another user', async function () {
        // Create a pattern and preview as one user
        const owner = await stubUser();
        const patternId = await callMethodWithUser(owner._id, 'pattern.add', {
          ...{ createdBy: owner._id },
          ...addPatternDataIndividual,
        });
        const previewId = await createPatternPreview({
          patternId,
          uri: 'something',
          createdBy: owner._id,
        });
        // Try to remove as a different user
        const otherUser = await stubOtherUser();
        const expectedError = async () => {
          await callMethodWithUser(otherUser._id, 'patternPreview.remove', {
            _id: previewId._id,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-preview-not-created-by-user',
        );
      });

      it('cannot remove pattern preview if user has serviceUser role', async function () {
        // Create a pattern and preview as one user
        const owner = await stubUser();
        const patternId = await callMethodWithUser(owner._id, 'pattern.add', {
          ...{ createdBy: owner._id },
          ...addPatternDataIndividual,
        });
        const previewId = await createPatternPreview({
          patternId,
          uri: 'something',
          createdBy: owner._id,
        });
        // Try to remove as a different user with serviceUser role
        const otherUser = await stubOtherUser();
        await Roles.createRoleAsync('serviceUser', { unlessExists: true });
        await Roles.addUsersToRolesAsync([otherUser._id], ['serviceUser']);
        const expectedError = async () => {
          await callMethodWithUser(otherUser._id, 'patternPreview.remove', {
            _id: previewId._id,
          });
        };
        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-preview-not-created-by-user',
        );
      });
    });
  });
}
