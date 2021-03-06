import SimpleSchema from 'simpl-schema';

import { MAX_TEXT_INPUT_LENGTH, MAX_TEXT_AREA_LENGTH } from '../parameters';

const SetsSchema = new SimpleSchema({
	'createdAt': {
		'type': Date,
		'label': 'Created at date',
		'index': 1,
		'optional': true, // automatically created by hook but if required here, an error is thrown
	},
	'createdBy': {
		'type': String,
		'label': 'Created by',
		'max': 200,
		'index': 1,
	},
	'description': {
		'type': String,
		'label': 'Description',
		'max': MAX_TEXT_AREA_LENGTH,
		'optional': true,
	},
	'name': {
		'type': String,
		'label': 'Name',
		'max': MAX_TEXT_INPUT_LENGTH,
	},
	'nameSort': {
		'type': String,
		'label': 'Sortable name',
		'max': MAX_TEXT_INPUT_LENGTH,
		'index': 1,
	},
	// patterns that belong to this set
	'patterns': {
		'type': Array,
		'label': 'Patterns',
	},
	'patterns.$': {
		'type': String,
		'label': 'Pattern id',
	},
	// number of public patterns in the set
	'publicPatternsCount': {
		'type': SimpleSchema.Integer,
		'label': 'Pattern id',
		'min': 0,
		'index': 1,
	},
	'tags': {
		'type': Array,
		'label': 'Tags',
		'index': 1,
	},
	'tags.$': {
		'type': String,
		'label': 'Tag',
		'max': 100,
	},
});

export default SetsSchema;
