import { check } from 'meteor/check';
import { nonEmptyStringCheck } from '../../imports/server/modules/utils';
import { PatternImages, Patterns } from '../../imports/modules/collection';

const AWS = require('aws-sdk');

const moment = require('moment');

Meteor.methods({
	'patternImages.add': function ({ _id, downloadUrl }) {
		// log the url of an uploaded pattern image to the database
		check(_id, nonEmptyStringCheck);
		check(downloadUrl, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-pattern-image-not-logged-in', 'Unable to add pattern image because the user is not logged in');
		}

		if (!Meteor.user().emails[0].verified) {
			throw new Meteor.Error('add-pattern-image-not-verified', 'Unable to add pattern image because the user\'s email address is not verified');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('add-pattern-image-not-found', 'Unable to add pattern image because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('add-pattern-image-not-created-by-user', 'Unable to add pattern image because the pattern was not created by the current logged in user');
		}

		// Find the key by stripping out the first part of the image url
		const bucket = process.env.AWS_BUCKET;
		const region = process.env.AWSRegion;
		const key = downloadUrl.replace(`https://${bucket}.s3-${region}.amazonaws.com/`, '');

		let imageId;

		if (!PatternImages.findOne({ 'key': key })) {
			// add the new object to the PatternImages collection
			imageId = PatternImages.insert({
				'url': downloadUrl,
				'key': key,
				'createdAt': moment().valueOf(), // current time
				'patternId': _id,
			});
			return imageId;
		}
		// uploading a new version of an existing file, just update "created_at"
		// this is just here in case we add an "update existing picture" function. The generated keys ought to be unique otherwise.
		imageId = PatternImages.findOne({ 'key': key }, { 'fields': { '_id': 1 } });
		PatternImages.update({ '_id': imageId },
			{
				'$set': {
					'createdAt': moment().valueOf(),
				},
			});

		return imageId;
	},
	'patternImages.remove': function ({ _id }) {
		// log the url of an uploaded pattern image to the database
		check(_id, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-pattern-image-not-logged-in', 'Unable to remove pattern image because the user is not logged in');
		}

		if (!Meteor.user().emails[0].verified) {
			throw new Meteor.Error('remove-pattern-image-not-verified', 'Unable to remove pattern image because the user\'s email address is not verified');
		}

		const patternImage = PatternImages.findOne({ _id });

		if (!patternImage) {
			throw new Meteor.Error('remove-pattern-image-not-found', 'Unable to remove pattern image because the pattern image was not found');
		}

		const pattern = Patterns.findOne({ '_id': patternImage.patternId });

		if (!pattern) {
			throw new Meteor.Error('remove-pattern-image-not-found', 'Unable to remove pattern image because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('remove-pattern-image-not-created-by-user', 'Unable to remove pattern image because the pattern was not created by the current logged in user');
		}

		const s3 = new AWS.S3({
			'accessKeyId': process.env.AWS_ACCESS_KEY_ID,
			'secretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
		});

		const params = {
			'Bucket': process.env.AWS_BUCKET, 
			'Key': patternImage.key,
		};

		s3.deleteObject(params, Meteor.bindEnvironment((error) => {
			if (!error) {
				PatternImages.remove({ _id });
			}
		}));
	},
});
