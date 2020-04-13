import SimpleSchema from 'simpl-schema';

const FAQSchema = new SimpleSchema({
	'question': {
		'type': String,
		'label': 'Question',
		'index': 1,
	},
	'answer': {
		'type': String,
		'label': 'Answer',
	},
});

export default FAQSchema;
