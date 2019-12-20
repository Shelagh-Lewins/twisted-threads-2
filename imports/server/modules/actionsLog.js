import { ActionsLog } from '../../modules/collection';
import { NUMBER_OF_ACTIONS_LOGGED } from '../../modules/parameters';

const moment = require('moment');

/* export const getActionsLogId = (userId) => {
	// return the id of the action log for the current user
	// and create a blank log if it doesn't already exist
	if (!ActionsLog.findOne({ userId })) {
		return ActionsLog.insert({
			'userId': Meteor.userId(),
			'username': Meteor.user().username,
			'verificationEmailSent': [],
			'imageUploaded': [],
			'imageRemoved': [],
			'locked': false,
		});
	}

	return ActionsLog.findOne({ userId })._id;
}; */

// check whether the current logged in user is allowed to perform an action
// if they are, log the action
const updateActionsLog = ({ action }) => {
	if (!this.userId) {
		throw new Meteor.Error('action-not-logged-in', 'The action cannot be completed because the user is not logged in');
	}

	// find the actions log for this user
	const actionsLog = ActionsLog.findOne({ 'userId': this.userId });
	const actionsLogId = actionsLog._id;

	if (!actionsLog) {
		ActionsLog.insert({
			'userId': Meteor.userId(),
			'username': Meteor.user().username,
			'verificationEmailSent': [],
			'imageUploaded': [],
			'imageRemoved': [],
			'locked': false,
		});

		return true;
	}

	const { [action]: actionLog, locked } = actionsLog;

	if (locked) {
		return false;
	}

	const timeSinceLastAction = moment().valueOf() - actionLog[0];

	// try to detect automated image uploads
	// A human shouldn't be able to upload 10 images in 2 seconds
	const timeForLast10Actions = actionsLog[0] - actionsLog[9];
	if (timeForLast10Actions < 2000) {
		ActionsLog.update({ '_id': actionsLogId }, { 'locked': true });
		throw new Meteor.Error('account-locked', 'Your account has been locked, please contact an administrator');
	}

	const timeForLast5Actions = actionsLog[0] - actionsLog[4];

	if (timeForLast5Actions < 2000) {
		// Don't allow another attempt for 5 minutes
		if (timeSinceLastAction < (60 * 1000 * 5)) {
			throw new Meteor.Error('too-many-requests', 'Please wait 5 mins before retrying');
		} else {
		// it's been at least 5 mins so consider allowing another image upload
			const timeForPrevious5Actions = actionsLog[4] - actionsLog[9];

			if (timeForPrevious5Actions < 2000)	{
				// if the 5 previous actions were in 2 seconds, wait 30 minutes
				// this looks like an automatic process that has tried continually
				if (timeSinceLastAction < (60 * 1000 * 30 + 4000)) {
					throw new Meteor.Error('too-many-requests', 'Please wait 30 mins before retrying"');
				}
			}
		}
	}

	// record the action in the log
	ActionsLog.update(
		{ '_id': actionsLogId },
		{
			'$push': {
				'imageUploaded': {
					'$each': [moment().valueOf()],
					'$position': 0,
				},
			},
		},
	);
	// remove the oldest log entry if too many stored
	if (actionLog.length > NUMBER_OF_ACTIONS_LOGGED) {
		const update = {};
		update.$pop = {
			[action]: 1,
		};

		ActionsLog.update({ '_id': actionsLogId },
			update);
	}

	return true;
};

export default updateActionsLog;
