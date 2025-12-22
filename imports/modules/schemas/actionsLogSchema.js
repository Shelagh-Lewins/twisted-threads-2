import SimpleSchema from 'simpl-schema';
import 'meteor/aldeed:collection2/static';

const ActionsLogSchema = new SimpleSchema({
  imageUploaded: {
    type: Array,
    label: 'Image uploaded',
  },
  'imageUploaded.$': {
    type: Date,
    label: 'Image uploaded timestamp',
  },
  locked: {
    type: Boolean,
    label: 'Locked',
  },
  username: {
    type: String,
    label: 'Uri',
  },
  userId: {
    type: String,
    label: 'User id',
  },
  verificationEmailSent: {
    type: Array,
    label: 'Verification email sent',
  },
  'verificationEmailSent.$': {
    type: Date,
    label: 'Verification email sent timestamp',
  },
});

export default ActionsLogSchema;
