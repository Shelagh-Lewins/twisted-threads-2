// migrate pattern data from TWT1 to TWT2
import {
	PatternImages,
	PatternPreviews,
	Patterns,
	Tags,
} from '../../imports/modules/collection';

const migratePatterns = () => {
	const allPatterns = Patterns.find().fetch();

	allPatterns.map((pattern) => {
		const {
			_id,
			created_by,
			private,
		} = pattern;

		const update = {};

		// fields to migrate
		update.$set = {
			'createdBy': created_by,
			'isPublic': !private,
		};

		// fields no longer used
		update.$unset = {
			'created_by': 1,
			'created_by_username': 1,
			'private': 1,
		};

		// fields we just carry across
		// description
		console.log('update pattern', _id);
		console.log('update', update);
		Patterns.update({ _id }, update);
	});
};

export default migratePatterns;
