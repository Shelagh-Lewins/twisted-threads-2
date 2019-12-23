import SimpleSchema from 'simpl-schema';

const ColorBooksSchema = new SimpleSchema({
	'colors': {
		'type': Array,
		'label': 'Colours',
	},
	'colors.$': {
		'type': String,
		'label': 'Colour',
		'max': 10,
	},
	'createdAt': {
		'type': Date,
		'label': 'Date created',
		'index': 1,
	},
	'createdBy': {
		'type': String,
		'label': 'Created by',
		'max': 200,
		'index': 1,
	},
	'isPublic': {
		'type': Boolean,
		'label': 'Is public',
		'min': 1,
		'index': 1,
	},
	'name': {
		'type': String,
		'label': 'Name',
		'max': 256,
	},
	'nameSort': {
		'type': String,
		'label': 'Sortable name',
		'max': 256,
		'index': 1,
	},
});

export default ColorBooksSchema;
