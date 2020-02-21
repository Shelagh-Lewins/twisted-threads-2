// migrate pattern data from TWT1 to TWT2
import {
	PatternImages,
	Patterns,
	Tags,
} from '../../imports/modules/collection';
import {
	updatePublicPatternsCount,
} from '../../imports/server/modules/utils';

const migrateTags = () => {
	console.log('*** starting to migrate tags');
	// tags previously used Meteor package patrickleet:tags@1.2.0
	// which was last updated 5 years ago
	// it may be fine but I don't want to use a stale package

	// we are now using npm package "react-tag-autocomplete": "^6.0.0-beta.3",

	// tags in the old format are an array of names like
	/* "tags" : [
			"missed-hole",
			"warp-twined",
			"viking"
	], */
	// the tags array contains tag objects which must be keyed by name but have an id, and lots of other data like nRefs

	// in the new scheme the tags database is managed manually
	// each tag is defined by simply _id and name, which we trust the server to make sure is unique (name is indexed), and remove unused tags
	// the disadvantage is that tags in pattern data are not human readable
	// but we do avoid duplicate data
	// this could be rewritten but would make the React component more complex

	// first clear out the tags collection because it doesn't contain any information we need to keep
	Tags.remove({});

	// for each pattern, convert the tags to the new form
	Patterns.find().fetch().forEach((pattern) => {
		// old tags for pattern; ensure lower case and no duplicates
		const { tags } = pattern;

		if (tags) {
			const oldTags = new Set(tags.map((tag) => tag.toLowerCase()));
			const newTags = [];

			oldTags.forEach((tag) => {
				let tagId;
				const existingTag = Tags.findOne({ 'name': tag });

				if (existingTag) { // use an existing tag
					tagId = existingTag._id;
				} else { // create a new tag
					tagId = Tags.insert({
						'name': tag,
					});
				}

				newTags.push(tagId);

			});
			// assign the ids to the pattern
			Patterns.update(
				{ '_id': pattern._id },
				{ '$set': { 'tags': newTags }},
			);
		}
	});
	console.log('*** finished migrating tags');
};

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

			// fields no longer used
			update.$unset = {
				'created_at': '',
				'created_by': '',
				'created_by_username': '',
				'name_sort': '',
				'number_of_rows': '',
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

	migrateTags();
	migratePublicPatternsCount();
};

export default migratePatternsMetadata;
