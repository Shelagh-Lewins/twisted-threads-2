import SimpleSchema from 'simpl-schema';

const PatternImagesSchema = new SimpleSchema({
	'createdAt': {
		'type': Date,
		'label': 'Date created',
		'index': 1,
	},
	'caption': {
		'type': String,
		'label': 'Caption',
		'max': 500,
		'optional': true,
	},
	'height': {
		'type': Number,
		'label': 'Height',
		'optional': true,
	},
	'key': {
		'type': String,
		'label': 'Key',
		'max': 500,
	},
	'patternId': {
		'type': String,
		'label': 'Pattern id',
		'index': 1,
	},
	'url': {
		'type': String,
		'label': 'Uri',
	},
	'width': {
		'type': Number,
		'label': 'Width',
		'optional': true,
	},
});

export default PatternImagesSchema;
