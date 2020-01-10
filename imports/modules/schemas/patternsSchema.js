import SimpleSchema from 'simpl-schema';

const PatternsSchema = new SimpleSchema({
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
	'description': {
		'type': String,
		'label': 'Description',
		'max': 5000,
		'optional': true,
	},
	'holes': {
		'type': SimpleSchema.Integer,
		'label': 'Number of holes',
		'min': 1,
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
	'numberOfRows': {
		'type': SimpleSchema.Integer,
		'label': 'Number of rows',
		'min': 1,
	},
	'numberOfTablets': {
		'type': SimpleSchema.Integer,
		'label': 'Number of tablets',
		'min': 1,
		'index': 1,
	},
	'orientations': {
		'type': Array,
		'label': 'Tablet orientations',
	},
	'orientations.$': {
		'type': String,
		'label': 'Tablet orientation',
		'max': 10,
	},
	'palette': {
		'type': Array,
		'label': 'Colour palette',
	},
	'palette.$': {
		'type': String,
		'label': 'Colour',
		'max': 10,
	},
	'patternDesign': {
		'type': Object,
		'label': 'Pattern design',
		'blackbox': true,
	},
	'patternType': {
		'type': String,
		'label': 'Pattern type',
		'max': 100,
	},
	'previewOrientation': {
		'type': String,
		'label': 'Preview orientation',
		'max': 100,
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
	'threading': {
		'type': Array,
		'label': 'Threading',
	},
	'threading.$': {
		'type': Array,
		'label': 'Threading row',
	},
	'threading.$.$': {
		'type': SimpleSchema.Integer,
		'label': 'Threading cell',
	},
	'threadingNotes': {
		'type': String,
		'label': 'Threading notes',
		'max': 5000,
		'optional': true,
	},
	'weavingNotes': {
		'type': String,
		'label': 'Weaving notes',
		'max': 5000,
		'optional': true,
	},
	'weftColor': {
		'type': SimpleSchema.Integer,
		'label': 'Weft colour',
		'min': 1,
	},
});

export default PatternsSchema;