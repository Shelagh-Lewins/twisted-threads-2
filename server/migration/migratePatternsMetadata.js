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

	const manualNoRows = [];
	const patternsToUpdate = [];

	// some patterns have corrupted / missing data and there's nothing that can be done to make them meaningful
	const patternsToRemove = [];
	const patternsUnresolved = [];
	const autoNoRows = [];

	console.log('number of patterns', allPatterns.length);
	allPatterns.map((pattern) => {
		const {
			_id,
			auto_turn_sequence,
			created_at,
			created_by,
			edit_mode,
			manual_weaving_turns,
			name_sort,
			number_of_rows, // this is rewritten later, but used as a check here
			pattern_edited_at,
			preview_rotation,
			simulation_mode,
			threading,
			threading_notes,
			weaving,
			weaving_notes,
		} = pattern;

		let isPublic = !pattern.private;

		if (process.env.ALL_PATTERNS_ARE_PUBLIC === 'migrations') {
			isPublic = true;
		}

		console.log('*** migrating metatdata for ', _id);
		console.log('created_at', created_at);
		console.log('createdAt', new Date(created_at));

		console.log('pattern_edited_at', pattern_edited_at);
		console.log('modifiedAt', new Date(pattern_edited_at));

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
						patternsToRemove.push(_id);
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
					patternsToRemove.push(_id);
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
				'previewOrientation': preview_rotation,
				'threadingNotes': threading_notes,
				'weavingNotes': weaving_notes,
			};

			if (pattern_edited_at) {
				update.$set.modifiedAt = new Date(pattern_edited_at);
			}

			// fields no longer used
			update.$unset = {
				'created_at': '',
				'created_by': '',
				'created_by_username': '',
				'name_sort': '',
				'number_of_rows': '',
				'pattern_edited_at': '',
				'preview_rotation': '',
				'private': '',
			};

			patternsToUpdate.push(_id);

			// fields to carry across unchanged:
			// description

			Patterns.update({ _id }, update);
		}
	});

	Patterns.remove({ '_id': { '$in': patternsToRemove } });

	console.log('*** finished migrating basic pattern metadata');
	console.log('patterns removed because of unsavable data: ', patternsToRemove);
	console.log('unresolved patterns', patternsUnresolved);
	console.log('number of patterns migrated: ', Patterns.find().fetch().length);

	migratePublicPatternsCount();
};

export default migratePatternsMetadata;
