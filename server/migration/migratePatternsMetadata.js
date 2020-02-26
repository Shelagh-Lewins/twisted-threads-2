// migrate pattern data from TWT1 to TWT2
import {
	Patterns,
} from '../../imports/modules/collection';
import {
	updatePublicPatternsCount,
} from '../../imports/server/modules/utils';

const migratePublicPatternsCount = () => {
	console.log('*** starting to migrate user public patterns count');
	const allUsers = Meteor.users.find().fetch();

	allUsers.forEach((user) => {
		updatePublicPatternsCount(user._id);
	});
	console.log('*** finished migrating user public patterns count');
};

const migratePatternsMetadata = () => {
	console.log('*** starting to migrate basic pattern metadata');
	// basic pattern metadata
	const allPatterns = Patterns.find().fetch();

	// some patterns have corrupted / missing data and there's nothing that can be done to make them meaningful
	const patternsMissingData = [];
	const patternsUnresolved = [];
	const autoNoRows = [];
	const manualNoRows = [];
	const patternsToUpdate = [];

	if (process.env.ALL_PATTERNS_ARE_PUBLIC === 'true') {
		console.log('!!! setting all patterns to public');
	} else {
		console.log('!!! leaving isPublic unchanged');
	}


	console.log('number of patterns', allPatterns.length);
	allPatterns.map((pattern) => {
		const {
			_id,
			auto_turn_sequence,
			created_at,
			created_by,
			edit_mode,
			hole_handedness,
			manual_weaving_turns,
			name_sort,
			number_of_rows, // this is rewritten later from data, but used as a check here
			number_of_tablets, // this is rewritten later from data, but allows unmigrated patterns to be seen in All Patterns etc (tablet filters)
			pattern_edited_at,
			preview_rotation,
			simulation_mode,
			threading,
			threading_notes,
			weaving,
			weaving_notes,
		} = pattern;

		let isPublic = !pattern.private;

		if (process.env.ALL_PATTERNS_ARE_PUBLIC === 'true') {
			isPublic = true;
		}

		let previewOrientation = 'up';

		// direction has changed
		if (preview_rotation === 'left') {
			previewOrientation = 'right';
		} else if (preview_rotation === 'right') {
			previewOrientation = 'left';
		}

		const update = {};

		if (number_of_rows === 0) {
			// 0 rows only happens if something has gone wrong
			if (edit_mode === 'simulation') {
				if (simulation_mode === 'manual') {
					manualNoRows.push(_id);
				} else if (simulation_mode === 'auto') {
					autoNoRows.push(_id);
				} else {
					// P2PHXKsb5PLENmh6k for example. 13 of these found with missing data, nothing after styles is present
					if (!threading || !threading.length) {
						patternsMissingData.push(_id);
					} else {
						patternsUnresolved.push(_id);
					}
					console.log('*** 0 rows unknown simulation', _id);
					console.log('threading', threading);
					console.log('weaving', weaving);
					console.log('auto_turn_sequence', auto_turn_sequence);
					console.log('manual_weaving_turns', manual_weaving_turns);
				}
			} else {
				// 1 found, QuwQ7boLv3mhEwjML
				// it is freehand with weaving []
				if (!weaving || JSON.parse(weaving).length === 0) {
					patternsMissingData.push(_id);
				} else {
					patternsUnresolved.push(_id);
				}

				console.log('*** 0 rows not simulation', _id);
				console.log('threading', threading);
				console.log('weaving', weaving);
				console.log('weaving length', weaving.length);
			}
		} else {
			// fields to migrate / add
			update.$set = {
				'createdAt': new Date(created_at),
				'createdBy': created_by,
				'holes': 4,
				isPublic,
				'nameSort': name_sort,
				'numberOfRows': number_of_rows,
				'numberOfTablets': number_of_tablets,
				previewOrientation,
				'threadingNotes': threading_notes,
				'weavingNotes': weaving_notes,
			};

			if (pattern_edited_at) {
				update.$set.modifiedAt = new Date(pattern_edited_at);
			}

			if (hole_handedness) {
				update.$set.holeHandedness = hole_handedness;
			}

			// fields no longer used
			update.$unset = {
				'created_at': '',
				'created_by': '',
				'created_by_username': '',
				'hole_handedness': '',
				'name_sort': '',
				'number_of_rows': '',
				'number_of_tablets': '',
				'pattern_edited_at': '',
				'preview_rotation': '',
				'private': '',
				'text_edited_at': '',
				'threading_notes': '',
				'weaving_notes': '',
			};

			patternsToUpdate.push(_id);

			// fields to carry across unchanged:
			// description

			Patterns.update({ _id }, update);
		}
	});

	Patterns.remove({ '_id': { '$in': manualNoRows } });
	Patterns.remove({ '_id': { '$in': autoNoRows } });
	Patterns.remove({ '_id': { '$in': patternsMissingData } });

	console.log('*** finished migrating basic pattern metadata');
	console.log('manual patterns removed because of 0 rows: ', manualNoRows);
	console.log('auto patterns removed because of 0 rows: ', autoNoRows);
	console.log('patterns removed because of missing data: ', patternsMissingData);
	console.log('unresolved patterns', patternsUnresolved);
	console.log('number of patterns migrated: ', patternsToUpdate.length);

	console.log('total patterns analysed', manualNoRows.length + autoNoRows.length + patternsMissingData.length + patternsUnresolved.length + patternsToUpdate.length);

	migratePublicPatternsCount();
};

export default migratePatternsMetadata;
