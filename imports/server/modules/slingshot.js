// slingshot image uploader
// puts files in an AWS (Amazon Web Services) bucket
import { ActionsLog, PatternImages, Patterns } from '../../modules/collection';
import { NUMBER_OF_ACTIONS_LOGGED, PATTERN_IMAGES_KEY, ROLE_LIMITS } from '../../modules/parameters';
import getActionsLogId from './actionsLog';

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
			if (count > ROLE_LIMITS.verified.numberOfImagesPerPattern) {
				throw new Meteor.Error('upload-file-limit-reachedr', 'Unable to upload file because the user has uploaded the maximum number of images allowed for this pattern');
			}

			// check for too many image uploads too fast
			const actionsLogId = getActionsLogId(this.userId);

			const actionsLog = ActionsLog.findOne({ '_id': actionsLogId });

			const { imageUploaded, locked } = actionsLog;

			if (locked) {
				throw new Meteor.Error('account-locked', 'Your account has been locked, please contact an administrator"');
			}

			const timeSinceLastAction = moment().valueOf() - actionsLog[0];

			// try to detect automated image uploads
			// A human shouldn't be able to upload 10 images in 2 seconds
			const timeForLast10Actions = actionsLog[0] - actionsLog[9];
			if (timeForLast10Actions < 2000) {
				ActionsLog.update({ '_id': actionsLogId }, { 'locked': true });
				throw new Meteor.Error('account-locked', 'Your account has been locked, please contact an administrator');
			}

			const timeForLast5Actions = actionsLog[0] - actionsLog[4];

			if (timeForLast5Actions < 2000) {
				// Don't allow another attempt for 5 minutes
				if (timeSinceLastAction < (60 * 1000 * 5)) {
					throw new Meteor.Error('too-many-requests', 'Please wait 5 mins before retrying');
				} else {
				// it's been at least 5 mins so consider allowing another image upload
					const timeForPrevious5Actions = actionsLog[4] - actionsLog[9];

					if (timeForPrevious5Actions < 2000)	{
						// if the 5 previous actions were in 2 seconds, wait 30 minutes
						// this looks like an automatic process that has tried continually
						if (timeSinceLastAction < (60 * 1000 * 30 + 4000)) {
							throw new Meteor.Error('too-many-requests', 'Please wait 30 mins before retrying"');
						}
					}
				}
			}

			// record the action in the log
			ActionsLog.update(
				{ '_id': actionsLogId },
				{
					'$push': {
						'imageUploaded': {
							'$each': [moment().valueOf()],
							'$position': 0,
						},
					},
				},
			);
			// remove the oldest log entry if too many stored
			if (imageUploaded.length > NUMBER_OF_ACTIONS_LOGGED) {
				ActionsLog.update({ '_id': actionsLogId },
					{ '$pop': { 'imageUploaded': 1 } });
			}

			return true;
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
