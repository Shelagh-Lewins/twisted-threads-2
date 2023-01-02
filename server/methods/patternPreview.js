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

const Future = Npm.require('fibers/future');

Meteor.methods({
	'patternPreview.save': function ({ _id, uri }) {
		check(_id, String);
		check(uri, String);
		this.unblock();

		const pattern = Patterns.findOne({ _id });

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

		if (
			createdBy !== Meteor.userId() &&
			!Roles.getRolesForUser(Meteor.userId()).includes('serviceUser')
		) {
			throw new Meteor.Error(
				'save-preview-not-created-by-user',
				'Unable to save preview because pattern was not created by the current logged in user',
			);
		}

		// the image should have been rotated and sized correctly by the client
		// but the server should still check the image is valid and suitable in size
		const base64Image = uri.split(';base64,').pop();
		const future1 = new Future();

		Jimp.read(Buffer.from(base64Image, 'base64'), (error, result) => {
			if (!error) {
				if (
					result.bitmap.width > 0 &&
					result.bitmap.height > 0 &&
					result.bitmap.width <= PREVIEW_WIDTH * PREVIEW_SCALE * 1.1 &&
					result.bitmap.height <= PREVIEW_HEIGHT * PREVIEW_SCALE * 1.1
				) {
					// image is of acceptable size
					future1.return();
				} else {
					future1.throw('invalid image size');
				}
			} else {
				future1.throw('image error');
			}
		});

		try {
			future1.wait();

			const s3 = new AWS.S3({
				accessKeyId: process.env.AWS_ACCESS_KEY_ID,
				secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
			});

			const params = {
				Bucket: process.env.AWS_BUCKET,
				Key: `${createdBy}/${_id}-preview.png`,
				Body: Buffer.from(base64Image, 'base64'),
				ContentType: 'image/png',
			};

			try {
				const future2 = new Future();

				s3.upload(params, (err, data) => {
					if (err) {
						future2.throw('upload error');
					} else {
						future2.return(data);
					}
				});

				const uploadedImage = future2.wait();
				const patternPreview = PatternPreviews.findOne({ patternId: _id });
				const { Key, Location } = uploadedImage;

				// calls to Mongo will not work inside the future, hence moving them to the 'try' block
				if (!patternPreview) {
					// create new
					return PatternPreviews.insert({
						patternId: _id,
						url: Location, // where the file was actually saved
						key: Key, // relative path to file from bucket address
					});
				}

				if (!patternPreview.key) {
					// migrate from old format where image uri is stored in database // TODO remove after full migration of all patternPreviews
					return PatternPreviews.update(
						{ _id: patternPreview._id },
						{ $set: { url: Location, key: Key }, $unset: { uri: '' } },
					);
				}
			} catch (err) {
				throw new Meteor.Error('upload-preview-error', err);
			}
		} catch (err) {
			throw new Meteor.Error('save-preview-error', err);
		}
	},
	'patternPreview.remove': function ({ _id }) {
		// remove an uploaded pattern preview from AWS and the database
		check(_id, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error(
				'remove-pattern-preview-not-logged-in',
				'Unable to remove pattern preview because the user is not logged in',
			);
		}

		const patternPreview = PatternPreviews.findOne({ _id });

		if (!patternPreview) {
			throw new Meteor.Error(
				'remove-pattern-preview-not-found',
				'Unable to remove pattern preview because the pattern preview was not found',
			);
		}

		const pattern = Patterns.findOne({ _id: patternPreview.patternId });

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

		PatternPreviews.remove({ _id });

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
	},
});
