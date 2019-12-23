import SimpleSchema from 'simpl-schema';

const PatternPreviewsSchema = new SimpleSchema({
	'patternId': {
		'type': String,
		'label': 'Pattern id',
		'index': 1,
	},
	'uri': {
		'type': String,
		'label': 'Uri',
	},
});

export default PatternPreviewsSchema;
