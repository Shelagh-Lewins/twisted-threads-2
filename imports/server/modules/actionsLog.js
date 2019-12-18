import { ActionsLog } from '../../modules/collection';

const getActionsLogId = (userId) => {
	// return the id of the action log for the current user
	// and enter a blank log if it doesn't already exist
	if (!ActionsLog.findOne({ userId })) {
		return ActionsLog.insert({
			'userId': Meteor.userId(),
			'username': Meteor.user().username,
			'verificationEmailSent': [],
			'imageUploaded': [],
			'imageRemoved': [],
		});
	}

	return ActionsLog.findOne({ userId })._id;
};

export default getActionsLogId;
