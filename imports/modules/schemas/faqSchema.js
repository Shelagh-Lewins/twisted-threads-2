import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/static';

const FAQSchema = new SimpleSchema({
  question: {
    type: String,
    label: 'Question',
  },
  answer: {
    type: String,
    label: 'Answer',
  },
});

export default FAQSchema;
