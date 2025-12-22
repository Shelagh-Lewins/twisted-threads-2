import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/static';

const PatternImagesSchema = new SimpleSchema({
  createdAt: {
    type: Date,
    label: 'Date created',
  },
  createdBy: {
    type: String,
    label: 'Created by user id',
  },
  caption: {
    type: String,
    label: 'Caption',
    max: 500,
    optional: true,
  },
  height: {
    type: Number,
    label: 'Height',
    optional: true,
  },
  key: {
    type: String,
    label: 'Key',
    max: 500,
  },
  patternId: {
    type: String,
    label: 'Pattern id',
  },
  url: {
    type: String,
    label: 'Uri',
  },
  width: {
    type: Number,
    label: 'Width',
    optional: true,
  },
});

export default PatternImagesSchema;
