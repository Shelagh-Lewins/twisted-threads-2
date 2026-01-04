/* eslint-env mocha */

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import { expect } from 'chai';
import { PatternImages } from '../../imports/modules/collection';
import '../methods/patternImages';
import { createPattern, createPatternImage } from './testData';
import { stubUser, unwrapUser, callMethodWithUser } from './mockUser';

if (Meteor.isServer) {
  describe('test methods for pattern images', () => {
    beforeEach(async () => {
      await resetDatabase();
      await ensureAllRolesExist();
    });

    afterEach(async () => {
      if (unwrapUser) unwrapUser();
    });

    describe('patternImages.add method', () => {
      it('cannot add image if not logged in', async () => {
        const owner = await stubUser({ roles: ['registered'] });
        const pattern = await createPattern({
          createdBy: owner._id,
        });
        unwrapUser(); // Simulate not logged in

        async function expectedError() {
          await Meteor.callAsync('patternImages.add', {
            _id: pattern._id,
            downloadUrl: 'https://example.com/test.jpg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-image-not-logged-in',
        );
      });

      it('cannot add image if user is not registered', async () => {
        const owner = await stubUser({ roles: [] }); // No 'registered' role
        const pattern = await createPattern({
          createdBy: owner._id,
        });

        async function expectedError() {
          await callMethodWithUser(owner._id, 'patternImages.add', {
            _id: pattern._id,
            downloadUrl: 'https://example.com/test.jpg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-image-not-logged-in',
        );
      });

      it('cannot add image if pattern not found', async () => {
        const user = await stubUser({ roles: ['registered'] });

        async function expectedError() {
          await callMethodWithUser(user._id, 'patternImages.add', {
            _id: 'nonexistentPatternId',
            downloadUrl: 'https://example.com/test.jpg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-image-not-found',
        );
      });

      it('cannot add image to pattern created by another user', async () => {
        const owner = await stubUser({
          roles: ['registered'],
          username: 'Owner',
        });
        const pattern = await createPattern({
          createdBy: owner._id,
        });

        const otherUser = await stubUser({
          roles: ['registered'],
          username: 'OtherUser',
          emails: [{ address: 'other@here.com', verified: true }],
          removeExistingUsers: false,
        });

        async function expectedError() {
          await callMethodWithUser(otherUser._id, 'patternImages.add', {
            _id: pattern._id,
            downloadUrl: 'https://example.com/test.jpg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-image-not-created-by-user',
        );
      });

      it('cannot add image if user has reached image limit', async () => {
        const user = await stubUser({ roles: ['registered'] }); // Limit is 0 for registered
        const pattern = await createPattern({
          createdBy: user._id,
        });

        async function expectedError() {
          await callMethodWithUser(user._id, 'patternImages.add', {
            _id: pattern._id,
            downloadUrl: 'https://example.com/test.jpg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-image-too-many-images',
        );
      });

      it('can add image as verified user', async () => {
        const user = await stubUser({ roles: ['registered', 'verified'] });
        const pattern = await createPattern({
          createdBy: user._id,
        });

        const bucket = process.env.AWS_BUCKET || 'test-bucket';
        const region = process.env.AWSRegion || 'us-east-1';
        const testKey = 'test-key-new';
        const downloadUrl = `https://${bucket}.s3-${region}.amazonaws.com/${testKey}`;

        const imageId = await callMethodWithUser(
          user._id,
          'patternImages.add',
          {
            _id: pattern._id,
            downloadUrl,
          },
        );

        expect(imageId).to.exist;
        const newImage = await PatternImages.findOneAsync({ _id: imageId });
        expect(newImage).to.exist;
        expect(newImage.patternId).to.equal(pattern._id);
        expect(newImage.key).to.equal(testKey);
        expect(newImage.url).to.equal(downloadUrl);
        expect(newImage.createdBy).to.exist;
      });
    });

    describe('patternImages.remove method', () => {
      it('cannot remove image if not logged in', async () => {
        const owner = await stubUser({ roles: ['registered'] });
        const pattern = await createPattern({
          createdBy: owner._id,
        });
        const image = await createPatternImage({
          patternId: pattern._id,
          createdBy: owner._id,
        });
        unwrapUser(); // Simulate not logged in

        async function expectedError() {
          await Meteor.callAsync('patternImages.remove', { _id: image._id });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-image-not-logged-in',
        );
      });

      it('cannot remove image if image not found', async () => {
        const user = await stubUser({ roles: ['registered'] });

        async function expectedError() {
          await callMethodWithUser(user._id, 'patternImages.remove', {
            _id: 'nonexistentImageId',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-image-not-found',
        );
      });

      it('cannot remove image from pattern created by another user', async () => {
        const owner = await stubUser({
          roles: ['registered'],
          username: 'Owner',
        });
        const pattern = await createPattern({
          createdBy: owner._id,
        });
        const image = await createPatternImage({
          patternId: pattern._id,
          createdBy: owner._id,
        });

        const otherUser = await stubUser({
          roles: ['registered'],
          username: 'OtherUser',
          emails: [{ address: 'other@here.com', verified: true }],
          removeExistingUsers: false,
        });

        async function expectedError() {
          await callMethodWithUser(otherUser._id, 'patternImages.remove', {
            _id: image._id,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-pattern-image-not-created-by-user',
        );
      });

      it('can remove own image', async () => {
        const user = await stubUser({ roles: ['registered'] });
        const pattern = await createPattern({
          createdBy: user._id,
        });
        const image = await createPatternImage({
          patternId: pattern._id,
          createdBy: user._id,
        });

        await callMethodWithUser(user._id, 'patternImages.remove', {
          _id: image._id,
        });

        const removedImage = await PatternImages.findOneAsync({
          _id: image._id,
        });
        expect(removedImage).to.not.exist;
      });
    });

    describe('patternImages.editCaption method', () => {
      it('cannot edit caption if not logged in', async () => {
        const owner = await stubUser({ roles: ['registered'] });
        const pattern = await createPattern({
          createdBy: owner._id,
        });
        const image = await createPatternImage({
          patternId: pattern._id,
          createdBy: owner._id,
        });
        unwrapUser(); // Simulate not logged in

        async function expectedError() {
          await Meteor.callAsync('patternImages.editCaption', {
            _id: image._id,
            fieldValue: 'New caption',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'edit-pattern-image-not-logged-in',
        );
      });

      it('cannot edit caption if image not found', async () => {
        const user = await stubUser({ roles: ['registered'] });

        async function expectedError() {
          await callMethodWithUser(user._id, 'patternImages.editCaption', {
            _id: 'nonexistentImageId',
            fieldValue: 'New caption',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'edit-pattern-image-not-found',
        );
      });

      it('can edit caption for own image', async () => {
        const user = await stubUser({ roles: ['registered'] });
        const pattern = await createPattern({
          createdBy: user._id,
        });
        const image = await createPatternImage({
          patternId: pattern._id,
          createdBy: user._id,
          caption: 'Original caption',
        });

        await callMethodWithUser(user._id, 'patternImages.editCaption', {
          _id: image._id,
          fieldValue: 'Updated caption',
        });

        const updatedImage = await PatternImages.findOneAsync({
          _id: image._id,
        });
        expect(updatedImage.caption).to.equal('Updated caption');
      });
    });
  });
}
