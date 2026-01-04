/* eslint-env mocha */

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import { expect } from 'chai';
import { PatternImages } from '../../imports/modules/collection';
import '../methods/patternImages';
import { createPattern, createPatternImage } from './testData';
import { stubUser, unwrapUser, callMethodWithUser } from './mockUser';
import sinon from 'sinon';

const AWS = require('aws-sdk');

if (Meteor.isServer) {
  describe('test methods for pattern images', () => {
    let headObjectStub;

    beforeEach(async () => {
      await resetDatabase();
      await ensureAllRolesExist();

      // Stub S3 methods used in patternImages methods
      headObjectStub = sinon.stub().returns({
        promise: sinon.stub().resolves({
          ContentLength: 1024 * 1024, // 1MB file
          ContentType: 'image/jpeg',
        }),
      });

      const deleteObjectStub = sinon.stub().callsFake((params, callback) => {
        // Simulate successful deletion
        if (callback) {
          callback(null, {});
        }
      });

      const createPresignedPostStub = sinon
        .stub()
        .callsFake((params, callback) => {
          // Return mock presigned POST data
          callback(null, {
            url: 'https://s3.eu-west-1.amazonaws.com/test-bucket',
            fields: {
              key: params.Fields.key,
              acl: 'public-read',
              'Content-Type': params.Fields['Content-Type'],
              policy: 'mock-policy',
              'x-amz-algorithm': 'AWS4-HMAC-SHA256',
              'x-amz-credential': 'mock-credential',
              'x-amz-date': '20260104T000000Z',
              'x-amz-signature': 'mock-signature',
            },
          });
        });

      sinon.stub(AWS, 'S3').returns({
        headObject: headObjectStub,
        deleteObject: deleteObjectStub,
        createPresignedPost: createPresignedPostStub,
      });
    });

    afterEach(async () => {
      if (unwrapUser) unwrapUser();
      sinon.restore();
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
        const testKey = `${user._id}/test-image-${Date.now()}.jpg`;
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

    describe('patternImages.getPresignedPost method', () => {
      it('cannot get presigned POST if not logged in', async () => {
        const owner = await stubUser({ roles: ['registered'] });
        const pattern = await createPattern({
          createdBy: owner._id,
        });
        unwrapUser(); // Simulate not logged in

        async function expectedError() {
          await Meteor.callAsync('patternImages.getPresignedPost', {
            patternId: pattern._id,
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-image-not-logged-in',
        );
      });

      it('cannot get presigned POST if user is not registered', async () => {
        const owner = await stubUser({ roles: [] }); // No 'registered' role
        const pattern = await createPattern({
          createdBy: owner._id,
        });

        async function expectedError() {
          await callMethodWithUser(
            owner._id,
            'patternImages.getPresignedPost',
            {
              patternId: pattern._id,
              fileName: 'test.jpg',
              fileType: 'image/jpeg',
            },
          );
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-image-not-logged-in',
        );
      });

      it('cannot get presigned POST if email not verified', async () => {
        const user = await stubUser({
          roles: ['registered'],
          emails: [{ address: 'test@example.com', verified: false }],
        });
        const pattern = await createPattern({
          createdBy: user._id,
        });

        async function expectedError() {
          await callMethodWithUser(user._id, 'patternImages.getPresignedPost', {
            patternId: pattern._id,
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'upload-file-not-verified',
        );
      });

      it('cannot get presigned POST if pattern not found', async () => {
        const user = await stubUser({ roles: ['registered'] });

        async function expectedError() {
          await callMethodWithUser(user._id, 'patternImages.getPresignedPost', {
            patternId: 'nonexistentPatternId',
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-image-not-found',
        );
      });

      it('cannot get presigned POST for pattern created by another user', async () => {
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
          await callMethodWithUser(
            otherUser._id,
            'patternImages.getPresignedPost',
            {
              patternId: pattern._id,
              fileName: 'test.jpg',
              fileType: 'image/jpeg',
            },
          );
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-pattern-image-not-created-by-user',
        );
      });

      it('cannot get presigned POST if user has reached image limit', async () => {
        const user = await stubUser({ roles: ['registered'] }); // Limit is 0 for registered
        const pattern = await createPattern({
          createdBy: user._id,
        });

        async function expectedError() {
          await callMethodWithUser(user._id, 'patternImages.getPresignedPost', {
            patternId: pattern._id,
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-image-too-many-images',
        );
      });

      it('cannot get presigned POST for invalid file type', async () => {
        const user = await stubUser({ roles: ['registered', 'verified'] });
        const pattern = await createPattern({
          createdBy: user._id,
        });

        async function expectedError() {
          await callMethodWithUser(user._id, 'patternImages.getPresignedPost', {
            patternId: pattern._id,
            fileName: 'test.pdf',
            fileType: 'application/pdf',
          });
        }
        await expect(expectedError()).to.be.rejectedWith('invalid-file-type');
      });

      it('can get presigned POST as verified user', async () => {
        const user = await stubUser({ roles: ['registered', 'verified'] });
        const pattern = await createPattern({
          createdBy: user._id,
        });

        const result = await callMethodWithUser(
          user._id,
          'patternImages.getPresignedPost',
          {
            patternId: pattern._id,
            fileName: 'test image.jpg',
            fileType: 'image/jpeg',
          },
        );

        expect(result).to.exist;
        expect(result.url).to.exist;
        expect(result.fields).to.exist;
        expect(result.key).to.exist;

        // Verify key format: userId/filename-timestamp.ext
        expect(result.key).to.match(
          new RegExp(`^${user._id}/test_image-\\d+\\.jpg$`),
        );
        expect(result.fields.key).to.equal(result.key);
        expect(result.fields.acl).to.equal('public-read');
      });

      it('generates unique keys for multiple uploads', async () => {
        const user = await stubUser({ roles: ['registered', 'verified'] });
        const pattern = await createPattern({
          createdBy: user._id,
        });

        const result1 = await callMethodWithUser(
          user._id,
          'patternImages.getPresignedPost',
          {
            patternId: pattern._id,
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
          },
        );

        // Small delay to ensure different timestamp
        await new Promise((resolve) => setTimeout(resolve, 10));

        const result2 = await callMethodWithUser(
          user._id,
          'patternImages.getPresignedPost',
          {
            patternId: pattern._id,
            fileName: 'test.jpg',
            fileType: 'image/jpeg',
          },
        );

        expect(result1.key).to.exist;
        expect(result2.key).to.exist;
        expect(result1.key).to.not.equal(result2.key);
      });
    });
  });
}
