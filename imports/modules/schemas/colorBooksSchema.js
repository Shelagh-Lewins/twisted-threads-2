import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/static';

const ColorBooksSchema = new SimpleSchema({
  colors: {
    type: Array,
    label: 'Colours',
  },
  'colors.$': {
    type: String,
    label: 'Colour',
    max: 10,
  },
  createdAt: {
    type: Date,
    label: 'Date created',
  },
  createdBy: {
    type: String,
    label: 'Created by',
    max: 200,
  },
  isPublic: {
    type: Boolean,
    label: 'Is public',
    min: 1,
  },
  name: {
    type: String,
    label: 'Name',
    max: 256,
  },
  nameSort: {
    type: String,
    label: 'Sortable name',
    max: 256,
  },
});

export default ColorBooksSchema;
