import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/static';

import { MIN_TAG_LENGTH, MAX_TAG_LENGTH } from '../parameters';

const TagsSchema = new SimpleSchema({
  name: {
    type: String,
    label: 'Name',
    max: MAX_TAG_LENGTH,
    min: MIN_TAG_LENGTH,
  },
});

export default TagsSchema;
