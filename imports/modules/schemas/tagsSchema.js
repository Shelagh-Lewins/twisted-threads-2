import SimpleSchema from 'simpl-schema';

const TagsSchema = new SimpleSchema({
	'name': {
		'type': String,
		'label': 'Name',
		'index': 1,
	},
});

export default TagsSchema;
