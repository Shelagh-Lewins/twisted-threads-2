import { check } from 'meteor/check';
import {
  checkUserCanAddPatternImage,
  nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import { PatternImages, Patterns } from '../../imports/modules/collection';
import updateActionsLog from '../../imports/server/modules/actionsLog';

const Jimp = require('jimp');
const AWS = require('aws-sdk');
const moment = require('moment');

// Helper function to get configured S3 client
const getS3Client = () => {
  return new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWSRegion,
    signatureVersion: 'v4',
  });
};

Meteor.methods({
  'patternImages.getPresignedPost': async function ({
    patternId,
    fileName,
    fileType,
  }) {
    // Generate a presigned POST URL for direct S3 upload
    check(patternId, nonEmptyStringCheck);
    check(fileName, nonEmptyStringCheck);
    check(fileType, nonEmptyStringCheck);

    // Check user is logged in
    if (!this.userId) {
      throw new Meteor.Error(
        'add-pattern-image-not-logged-in',
        'Unable to upload file because the user is not logged in',
      );
    }

    // Check email verification before other authorization checks
    const user = await Meteor.users.findOneAsync(
      { _id: this.userId },
      { fields: { emails: 1 } },
    );
    if (!user || !user.emails || !user.emails[0] || !user.emails[0].verified) {
      throw new Meteor.Error(
        'upload-file-not-verified',
        'Unable to upload file because the user email is not verified',
      );
    }

    // Check full authorization (pattern ownership, image limits, etc.)
    const { error } = await checkUserCanAddPatternImage(patternId, this.userId);

    if (error) {
      throw error;
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!allowedTypes.includes(fileType)) {
      throw new Meteor.Error(
        'invalid-file-type',
        'Only PNG, JPEG, and GIF images are allowed',
      );
    }

    // Generate unique key (same logic as slingshot)
    const parts = fileName.split('.');
    const extension = parts.pop();
    let name = parts.join('');
    name = name.replace(/\s/g, '_'); // replace spaces with underscore
    const key = `${this.userId}/${name.slice(0, 30)}-${moment().valueOf().toString()}.${extension}`;

    // Create presigned POST
    const s3 = getS3Client();
    const bucket = process.env.AWS_BUCKET;
    const region = process.env.AWSRegion;

    const params = {
      Bucket: bucket,
      Fields: {
        key,
        acl: 'public-read',
        'Content-Type': fileType,
      },
      Conditions: [
        ['content-length-range', 0, 2 * 1024 * 1024], // 2MB max
        { acl: 'public-read' },
        { 'Content-Type': fileType },
      ],
      Expires: 60, // URL expires in 60 seconds
    };

    return new Promise((resolve, reject) => {
      s3.createPresignedPost(params, (err, data) => {
        if (err) {
          console.error('Error creating presigned POST:', err);
          reject(
            new Meteor.Error(
              'presigned-post-error',
              'Failed to generate upload URL',
            ),
          );
        } else {
          // Construct the final download URL (use the same format as the POST url)
          const downloadUrl = `${data.url}/${key}`;

          // Return URL, fields, key, and downloadUrl for client to use
          resolve({
            url: data.url,
            fields: data.fields,
            key,
            downloadUrl,
          });
        }
      });
    });
  },
  'patternImages.add': async function ({ _id, downloadUrl }) {
    // log the url of an uploaded pattern image to the database
    check(_id, nonEmptyStringCheck);
    check(downloadUrl, nonEmptyStringCheck);

    const { error } = await checkUserCanAddPatternImage(_id, this.userId);

    if (error) {
      throw error;
    }

    // Log successful upload action for rate limiting
    await updateActionsLog('imageUploaded');

    // Parse and validate the download URL to extract the key
    const bucket = process.env.AWS_BUCKET;
    const region = process.env.AWSRegion;

    let urlObj;
    try {
      urlObj = new URL(downloadUrl);
    } catch (e) {
      throw new Meteor.Error(
        'invalid-download-url',
        'Download URL is not a valid URL',
      );
    }

    // Validate hostname matches expected S3 patterns
    const expectedHosts = [
      `${bucket}.s3-${region}.amazonaws.com`,
      `s3.${region}.amazonaws.com`,
      `s3-${region}.amazonaws.com`,
      `${bucket}.s3.${region}.amazonaws.com`,
    ];

    if (!expectedHosts.includes(urlObj.hostname)) {
      throw new Meteor.Error(
        'invalid-download-url',
        'Download URL does not match expected S3 bucket hostname',
      );
    }

    // Extract key from pathname
    let key = urlObj.pathname.startsWith('/')
      ? urlObj.pathname.slice(1)
      : urlObj.pathname;

    // For path-style URLs, remove bucket prefix
    if (key.startsWith(`${bucket}/`)) {
      key = key.slice(bucket.length + 1);
    }

    // Validate key belongs to current user
    if (!key.startsWith(`${this.userId}/`)) {
      throw new Meteor.Error(
        'invalid-key-format',
        'Image key does not belong to current user',
      );
    }

    // Verify file exists on S3 and check its size
    const s3 = getS3Client();
    let fileSize;
    try {
      const headData = await s3
        .headObject({
          Bucket: bucket,
          Key: key,
        })
        .promise();

      fileSize = headData.ContentLength;

      if (fileSize > 2 * 1024 * 1024) {
        throw new Meteor.Error(
          'file-too-large',
          'Uploaded file exceeds 2MB limit',
        );
      }
    } catch (error) {
      if (error.code === 'NotFound' || error.statusCode === 404) {
        throw new Meteor.Error('file-not-found', 'File was not found on S3');
      }
      // Re-throw Meteor errors (like file-too-large)
      if (error.error) {
        throw error;
      }
      // Log and throw other S3 errors
      console.error('S3 headObject error:', error);
      throw new Meteor.Error(
        's3-verification-error',
        'Failed to verify uploaded file',
      );
    }

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
        if (error1) {
          console.error('Jimp error processing image:', error1);
          // Mark image as having processing error
          await PatternImages.updateAsync(
            { _id: imageId },
            {
              $set: {
                processingError: true,
              },
            },
          );
        } else {
          const { height, width } = image.bitmap;

          await PatternImages.updateAsync(
            { _id: imageId },
            {
              $set: {
                height,
                width,
                processingError: false,
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

    const s3 = getS3Client();

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
