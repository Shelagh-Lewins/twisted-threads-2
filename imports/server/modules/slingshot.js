// slingshot image uploader
// puts files in an AWS (Amazon Web Services) bucket
import { PatternImages, Patterns } from '../../modules/collection';
import { PATTERN_IMAGES_KEY, ROLE_LIMITS } from '../../modules/parameters';
import updateActionsLog from './actionsLog';

const moment = require('moment');

if (Meteor.isServer) {
	Slingshot.fileRestrictions('myImageUploads', {
		'allowedFileTypes': ['image/png', 'image/jpeg', 'image/gif'],
		'maxSize': 2 * 1024 * 1024,
	});

	Slingshot.createDirective('myImageUploads', Slingshot.S3Storage, {
		'AWSAccessKeyId': process.env.AWS_ACCESS_KEY_ID,
		'AWSSecretAccessKey': process.env.AWS_SECRET_ACCESS_KEY,
		'bucket': process.env.AWS_BUCKET,
		'acl': 'public-read',
		'region': process.env.AWSRegion,

		'authorize': function (file, { patternId }) {
			// User must be logged in
			if (!this.userId) {
				throw new Meteor.Error('upload-file-not-authorized', 'Unable to upload file because the user is not logged in');
			}

			// User must have verified their email address
			const user = Meteor.users.findOne({ '_id': this.userId }, { 'fields': { 'emails': 1 } });
			if (!user.emails[0].verified) {
				throw new Meteor.Error('upload-file-not-verified', 'Unable to upload file because the user is not verified');
			}

			// User must own the pattern
			const pattern = Patterns.findOne(
				{ '_id': patternId },
				{ 'fields': { 'createdBy': 1 } },
			);
			if (pattern.createdBy !== this.userId) {
				throw new Meteor.Error('upload-file-not-owner', 'Unable to upload file because the pattern was not created by the current logged in user');
			}

			// check user hasn't exceeded their image allocation
			const count = PatternImages.find({ patternId }).count();

			// TO DO check verified, premium users
			if (count >= ROLE_LIMITS.verified.numberOfImagesPerPattern) {
				throw new Meteor.Error('upload-file-limit-reached', 'Unable to upload file because the user has uploaded the maximum number of images allowed for this pattern');
			}

			return updateActionsLog('imageUploaded');
		},

		'key': function (file) {
			const parts = file.name.split('.'); // find the file extension
			const extension = parts.pop();
			let name = parts.join(''); // find the name

			name = name.replace(/\s/g, '_'); // replace spaces with underscore

			name = `${name.slice(0, 30)}-${moment().valueOf().toString()}.${extension}`; // use the first 30 chars of the name, plus timestamp, plus file extension, to make a meaningful name that is unique to this user

			return `${PATTERN_IMAGES_KEY}${Meteor.userId()}/${name}`;
		},
	});
}
