import { check } from 'meteor/check';
import { PatternPreviews } from '../../imports/modules/collection';

// TO DO delete as part of delete pattern
Meteor.methods({
	'patternPreview.save': function ({
		_id,
		data,
	}) {
		check(_id, String);
		check(data, String);

		// TO DO should the data be sanitized on the way in, which may happen often? They are currently sanitized before being displayed.

		const patternPreview = PatternPreviews.findOne({ 'patternId': _id });

		if (!patternPreview) {
			// create new
			return PatternPreviews.insert({
				'patternId': _id,
				'data': data,
			});
		}

		// update existing
		return PatternPreviews.update({ '_id': patternPreview._id }, { '$set': { 'data': data } });
	},
});
