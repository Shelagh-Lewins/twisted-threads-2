import SimpleSchema from 'simpl-schema';

import { MIN_TAG_LENGTH, MAX_TAG_LENGTH } from '../parameters';

const TagsSchema = new SimpleSchema({
	'name': {
		'type': String,
		'label': 'Name',
		'max': MAX_TAG_LENGTH,
		'min': MIN_TAG_LENGTH,
		'index': 1,
	},
});

export default TagsSchema;
