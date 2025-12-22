import { check } from 'meteor/check';
import {
  checkUserCanAddPatternImage,
  nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import { PatternImages, Patterns } from '../../imports/modules/collection';

const Jimp = require('jimp');
const AWS = require('aws-sdk');
const moment = require('moment');

Meteor.methods({
  'patternImages.add': async function ({ _id, downloadUrl }) {
    // log the url of an uploaded pattern image to the database
    check(_id, nonEmptyStringCheck);
    check(downloadUrl, nonEmptyStringCheck);

    const { error } = checkUserCanAddPatternImage(_id);

    if (error) {
      throw error;
    }

    // Find the key by stripping out the first part of the image url
    const bucket = process.env.AWS_BUCKET;
    const region = process.env.AWSRegion;
    const key = downloadUrl.replace(
      `https://${bucket}.s3-${region}.amazonaws.com/`,
      '',
    );

    let imageId;

    const currentImage = await PatternImages.findOneAsync({ key });

    if (!currentImage) {
      // add the new object to the PatternImages collection
      imageId = await PatternImages.insertAsync({
        url: downloadUrl,
        key,
        caption: '',
        createdAt: moment().valueOf(), // current time
        createdBy: Meteor.userId(),
        patternId: _id,
      });
      // return imageId;
    } else {
      // uploading a new version of an existing file, just update "created_at"
      // this is just here in case we add an "update existing picture" function. The generated keys ought to be unique otherwise.
      imageId = await PatternImages.findOneAsync(
        { key },
        { fields: { _id: 1 } },
      );
      await PatternImages.updateAsync(
        { _id: imageId },
        {
          $set: {
            createdAt: moment().valueOf(),
          },
        },
      );
    }

    // find the image height and width
    // eslint-disable-next-line no-unused-vars
    const newImage = new Jimp(
      downloadUrl,
      Meteor.bindEnvironment(async (error1, image) => {
        if (!error1) {
          const { height, width } = image.bitmap;

          await PatternImages.updateAsync(
            { _id: imageId },
            {
              $set: {
                height,
                width,
              },
            },
          );
        }
      }),
    );

    return imageId;
  },
  'patternImages.remove': async function ({ _id }) {
    // remove an uploaded pattern image from AWS and the database
    check(_id, nonEmptyStringCheck);

    if (!Meteor.userId()) {
      throw new Meteor.Error(
        'remove-pattern-image-not-logged-in',
        'Unable to remove pattern image because the user is not logged in',
      );
    }

    const patternImage = await PatternImages.findOneAsync({ _id });

    if (!patternImage) {
      throw new Meteor.Error(
        'remove-pattern-image-not-found',
        'Unable to remove pattern image because the pattern image was not found',
      );
    }

    const pattern = await Patterns.findOneAsync({
      _id: patternImage.patternId,
    });

    if (!pattern) {
      throw new Meteor.Error(
        'remove-pattern-image-not-found',
        'Unable to remove pattern image because the pattern was not found',
      );
    }

    if (pattern.createdBy !== Meteor.userId()) {
      throw new Meteor.Error(
        'remove-pattern-image-not-created-by-user',
        'Unable to remove pattern image because the pattern was not created by the current logged in user',
      );
    }

    await PatternImages.removeAsync({ _id });

    const s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Bucket: process.env.AWS_BUCKET,
      Key: patternImage.key,
    };

    s3.deleteObject(
      params,
      Meteor.bindEnvironment((error) => {
        if (error) {
          console.log('error removing pattern image from AWS', error);
        } else {
          console.log(
            'successfully removed pattern image from AWS',
            process.env.AWS_BUCKET,
            patternImage.key,
          );
        }
      }),
    );
  },
  'patternImages.editCaption': async function ({ _id, fieldValue }) {
    check(_id, nonEmptyStringCheck);
    check(fieldValue, String);

    if (!Meteor.userId()) {
      throw new Meteor.Error(
        'edit-pattern-image-not-logged-in',
        'Unable to edit pattern image because the user is not logged in',
      );
    }

    const patternImage = await PatternImages.findOneAsync({ _id });

    if (!patternImage) {
      throw new Meteor.Error(
        'edit-pattern-image-not-found',
        'Unable to edit pattern image because the pattern image was not found',
      );
    }

    const pattern = await Patterns.findOneAsync({
      _id: patternImage.patternId,
    });

    if (!pattern) {
      throw new Meteor.Error(
        'edit-pattern-image-not-found',
        'Unable to edit pattern image because the pattern was not found',
      );
    }

    if (pattern.createdBy !== Meteor.userId()) {
      throw new Meteor.Error(
        'edit-pattern-image-not-created-by-user',
        'Unable to edit pattern image because the pattern was not created by the current logged in user',
      );
    }

    await PatternImages.updateAsync(
      { _id },
      {
        $set: {
          caption: fieldValue,
        },
      },
    );
  },
});
