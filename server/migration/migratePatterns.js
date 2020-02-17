// migrate pattern data from TWT1 to TWT2
import {
	PatternImages,
	PatternPreviews,
	Patterns,
	Tags,
} from '../../imports/modules/collection';

const migratePatterns = () => {
	const allPatterns = Patterns.find().fetch();

	const patternsToRemove = [];
	const patternsToUpdate = [];
	const patternsProblem = [];
console.log('number of patterns', allPatterns.length);
	allPatterns.map((pattern) => {
		const {
			_id,
			created_at,
			created_by,
			edit_mode,
			name_sort,
			number_of_rows,
			number_of_tablets,
			private,
			simulation_mode,
		} = pattern;

		const update = {};

		if (number_of_rows === 0) {
			console.log('*** pattern has no rows', _id);
			console.log('number_of_rows', number_of_rows);
			//number_of_rows = 1;
			// 2QyKsCSQM2yFtW8MT has 0 rows due to some error
			// 0 rows can happen with simulation/manual pattern that has not been woven
			// may be best to delete these?
			if (edit_mode === 'simulation' && simulation_mode === 'manual') {
				// this is a manual pattern that was never woven
				// best thing is probably to delete it. The user may have set an auto (all together) sequence but odds are they would have left it on auto if so.
				console.log('remove simulation / manual pattern ', _id);
				patternsToRemove.push(_id);
			} else {
				console.log('pattern is not simulation / auto', _id);
				patternsProblem.push(_id);
			}
		} else {
			// fields to migrate / add
			const createdAt = new Date(created_at);
			//console.log('createdAt', createdAt);
			//TODO check for valid date
			update.$set = {
				'createdAt': new Date(created_at),
				'createdBy': created_by,
				'holes': 4,
				'isPublic': !private,
				'nameSort': name_sort,
				'numberOfRows': number_of_rows,
				'numberOfTablets': number_of_tablets,
			};

			// fields no longer used
			update.$unset = {
				'created_at': 1,
				'created_by': 1,
				'created_by_username': 1,
				'name_sort': 1,
				'number_of_rows': 1,
				'number_of_tablets': 1,
				'private': 1,
			};

			patternsToUpdate.push(_id);

			// fields we just carry across
			// description
			//console.log('update pattern', _id);
			//console.log('update', update);
			Patterns.update({ _id }, update);
		}

		
	});

	console.log('patternsToUpdate', patternsToUpdate);
	console.log('patternsToRemove', patternsToRemove);
	console.log('patternsProblem', patternsProblem);

	console.log('patternsToUpdate length', patternsToUpdate.length);
	console.log('patternsToRemove length', patternsToRemove.length);
	console.log('patternsProblem length', patternsProblem.length);
};

export default migratePatterns;
