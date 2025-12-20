import { check } from 'meteor/check';
import { nonEmptyStringCheck } from '../../imports/server/modules/utils';
import { PatternPreviews, Patterns } from '../../imports/modules/collection';
import {
  PREVIEW_HEIGHT,
  PREVIEW_SCALE,
  PREVIEW_WIDTH,
} from '../../imports/modules/parameters';

const Jimp = require('jimp');
const AWS = require('aws-sdk');
const getRandomValues = require('get-random-values');

Meteor.methods({
  'patternPreview.save': async function ({ _id, uri }) {
    check(_id, String);
    check(uri, String);
    this.unblock();

    const pattern = await Patterns.findOneAsync({ _id });

    if (!Meteor.userId()) {
      throw new Meteor.Error(
        'save-preview-not-logged-in',
        'Unable to save preview because the user is not logged in',
      );
    }

    if (!pattern) {
      throw new Meteor.Error(
        'save-preview-not-found',
        'Unable to save preview because the pattern was not found',
      );
    }

    const { createdBy } = pattern;

    const userRoles = await Roles.getRolesForUserAsync(Meteor.userId());
    if (createdBy !== Meteor.userId() && !userRoles.includes('serviceUser')) {
      throw new Meteor.Error(
        'save-preview-not-created-by-user',
        'Unable to save preview because pattern was not created by the current logged in user',
      );
    }

    // the image should have been rotated and sized correctly by the client
    // but the server should still check the image is valid and suitable in size
    const base64Image = uri.split(';base64,').pop();

    try {
      const imageData = await Jimp.read(Buffer.from(base64Image, 'base64'));

      const imageIsOK =
        imageData.bitmap.width > 0 &&
        imageData.bitmap.height > 0 &&
        imageData.bitmap.width <= PREVIEW_WIDTH * PREVIEW_SCALE * 1.1 &&
        imageData.bitmap.height <= PREVIEW_HEIGHT * PREVIEW_SCALE * 1.1;

      if (!imageIsOK) {
        throw new Meteor.Error(
          'image error',
          'Unable to save pattern preview because image size is invalid',
        );
      }
    } catch (error) {
      throw new Meteor.Error(
        'save-preview-error',
        'Unable to save pattern preview because Jimp.read threw an error',
        error,
      );
    }

    try {
      const patternPreview = await PatternPreviews.findOneAsync({
        patternId: _id,
      });

      // check if the patternPreview has already been saved to AWS
      // if so we are updating and do not create a new key
      let key = patternPreview?.key;
      const noExistingKey = !key;

      if (!key) {
        const urlObfuscator = getRandomValues(new Uint8Array(8)).join(''); // pattern previews are in AWS and cannot be restricted to the logged in user
        // adding a long string to the URL makes it hard for anybody to guess and view private pattern preview URLs
        key = `patternPreviews/${createdBy}/${_id}-${urlObfuscator}-preview.png`;
      }

      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      // namespacing pattern previews allows us to identify patterns with pattern images
      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: key,
        Body: Buffer.from(base64Image, 'base64'),
        ContentType: 'image/png',
        ACL: 'public-read',
        CacheControl: 'no-cache',
      };

      try {
        const uploadedImage = await s3.upload(params).promise();

        const { Key, Location } = uploadedImage;

        if (!patternPreview) {
          // create new
          return await PatternPreviews.insertAsync({
            patternId: _id,
            url: Location, // where the file was actually saved
            key, // relative path to file from bucket address
          });
        }

        if (noExistingKey) {
          // migrate from old format where image uri is stored in database
          // This should no longer be necessary but is still here just in case there is any pattern without an s3 key
          return PatternPreviews.updateAsync(
            { _id: patternPreview._id },
            { $set: { url: Location, key: Key }, $unset: { uri: '' } },
          );
        }

        // ensure the URL is correct
        // This is most useful when editing patterns in Test that were created on Live
        // i.e. Live database has been imported to Localhost or Test
        // and bucket name is different
        // but should also cover for any future change in AWS urls
        // key is fixed so image location within AWS is consistent
        // note you may need to refresh the page to see the new URL
        return PatternPreviews.updateAsync(
          { _id: patternPreview._id },
          { $set: { url: Location } },
        );
      } catch (error) {
        throw new Meteor.Error(
          'save-preview-error',
          'Unable to save pattern preview because s3.upload threw an error',
          error,
        );
      }
    } catch (err) {
      throw new Meteor.Error('save-preview-error', err);
    }
  },
  'patternPreview.remove': async function ({ _id }) {
    // remove an uploaded pattern preview from AWS and the database
    check(_id, nonEmptyStringCheck);

    if (!Meteor.userId()) {
      throw new Meteor.Error(
        'remove-pattern-preview-not-logged-in',
        'Unable to remove pattern preview because the user is not logged in',
      );
    }

    const patternPreview = await PatternPreviews.findOneAsync({ _id });

    if (!patternPreview) {
      throw new Meteor.Error(
        'remove-pattern-preview-not-found',
        'Unable to remove pattern preview because the pattern preview was not found',
      );
    }

    const { key } = patternPreview;

    const pattern = await Patterns.findOneAsync({
      _id: patternPreview.patternId,
    });

    if (!pattern) {
      throw new Meteor.Error(
        'remove-pattern-preview-not-found',
        'Unable to remove pattern preview because the pattern was not found',
      );
    }

    if (pattern.createdBy !== Meteor.userId()) {
      throw new Meteor.Error(
        'remove-pattern-preview-not-created-by-user',
        'Unable to remove pattern preview because the pattern was not created by the current logged in user',
      );
    }

    await PatternPreviews.removeAsync({ _id });

    if (key) {
      const s3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      });

      const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: patternPreview.key,
      };

      s3.deleteObject(
        params,
        Meteor.bindEnvironment((error) => {
          if (error) {
            console.log('error removing pattern preview from AWS', error);
          } else {
            console.log(
              'successfully removed pattern preview from AWS',
              process.env.AWS_BUCKET,
              patternPreview.key,
            );
          }
        }),
      );
    }
  },
});
