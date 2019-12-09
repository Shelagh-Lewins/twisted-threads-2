import { check } from 'meteor/check';
import { PatternPreviews, Patterns } from '../../imports/modules/collection';
import { PREVIEW_HEIGHT, PREVIEW_SCALE, PREVIEW_WIDTH } from '../../imports/modules/parameters';

const Jimp = require('jimp');

const Future = Npm.require('fibers/future');

Meteor.methods({
	'patternPreview.save': function ({
		_id,
		uri,
	}) {
		check(_id, String);
		check(uri, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('save-preview-not-logged-in', 'Unable to save preview because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('save-preview-not-found', 'Unable to save preview because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('save-preview-not-created-by-user', 'Unable to save preview because pattern was not created by the current logged in user');
		}

		// the image should have been rotated and sized correctly by the client
		// but the server should still check the image is valid and suitable in size
		const base64Image = uri.split(';base64,').pop();
		const future1 = new Future();

		Jimp.read(Buffer.from(base64Image, 'base64'),
			(error, result) => {
				if (!error) {
					if (result.bitmap.width > 0
					&& result.bitmap.height > 0
					&& result.bitmap.width <= PREVIEW_WIDTH * PREVIEW_SCALE * 1.1
					&& result.bitmap.height <= PREVIEW_HEIGHT * PREVIEW_SCALE * 1.1) {
						// image is of acceptable size
						future1.return();
					} else {
						future1.throw('invalid image size');
					}
				} else {
					future1.throw('image error');
				}
			});

		// act on the result of the check process
		// note that calls to Mongo will not work inside the future, hence moving them to the 'try' block
		try {
			future1.wait();
			const patternPreview = PatternPreviews.findOne({ 'patternId': _id });

			if (!patternPreview) {
				// create new
				return PatternPreviews.insert({
					'patternId': _id,
					'uri': uri,
				});
			}

			// update existing
			return PatternPreviews.update({ '_id': patternPreview._id }, { '$set': { 'uri': uri } });
		} catch (err) {
			throw new Meteor.Error('save-preview-error', err);
		}
	},
});
