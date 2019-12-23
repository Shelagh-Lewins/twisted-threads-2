import SimpleSchema from 'simpl-schema';

const ActionsLogSchema = new SimpleSchema({
	'imageUploaded': {
		'type': Array,
		'label': 'Image uploaded',
	},
	'imageUploaded.$': {
		'type': Date,
		'label': 'Image uploaded timestamp',
	},
	'locked': {
		'type': Boolean,
		'label': 'Locked',
	},
	'username': {
		'type': String,
		'label': 'Uri',
	},
	'userId': {
		'type': String,
		'label': 'User id',
		'index': 1,
	},
	'verificationEmail': {
		'type': Array,
		'label': 'Verification email',
	},
	'verificationEmail.$': {
		'type': Date,
		'label': 'Verification email timestamp',
	},
});

export default ActionsLogSchema;
