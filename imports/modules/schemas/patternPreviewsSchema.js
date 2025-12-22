import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/static';

const PatternPreviewsSchema = new SimpleSchema({
  patternId: {
    type: String,
    label: 'Pattern id',
  },
  uri: {
    type: String,
    label: 'Uri',
    optional: true,
  },
  url: {
    type: String,
    label: 'URL',
    optional: true,
  },
  key: {
    type: String,
    label: 'Key',
    optional: true,
  },
}); // TODO remove Uri, make URL and Key required, after pattern preview migration

export default PatternPreviewsSchema;
