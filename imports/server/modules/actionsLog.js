import { ActionsLog } from '../../modules/collection';
import { NUMBER_OF_ACTIONS_LOGGED } from '../../modules/parameters';

const moment = require('moment');

// check whether the current logged in user is allowed to perform an action
// if they are, log the action
const updateActionsLog = function (action) {
	const userId = Meteor.userId();

	if (!userId) {
		throw new Meteor.Error('action-not-logged-in', 'The action cannot be completed because the user is not logged in');
	}

	// find the actions log for this user
	let actionsLogId;
	const actionsLog = ActionsLog.findOne({ 'userId': userId });

	if (!actionsLog) {
		actionsLogId = ActionsLog.insert({
			'userId': Meteor.userId(),
			'username': Meteor.user().username,
			'verificationEmailSent': [],
			'imageUploaded': [],
			'locked': false,
		});
	} else {
		actionsLogId = actionsLog._id;
		const { [action]: actionLog, locked } = actionsLog;

		// there are entries in the log, so check for excessive usage
		if (locked) {
			throw new Meteor.Error('account-locked', 'Your account has been locked, please contact an administrator');
		}

		// try to detect automated actions
		// A human shouldn't perform 10 actions in 2 seconds
		if (actionLog.length >= 10) {
			const timeSinceLastAction = moment().valueOf() - actionLog[0];

			if (timeSinceLastAction < 10000) { // if account has just been unlocked, we need to allow the user to start again after a break
				const timeForLast10Actions = actionLog[0] - actionLog[9];

				if (timeForLast10Actions < 20000) {
					ActionsLog.update(
						{ '_id': actionsLogId },
						{ '$set': { 'locked': true } },
					);
					throw new Meteor.Error('account-locked', 'Your account has been locked, please contact an administrator');
				}

				const timeForLast5Actions = actionLog[0] - actionLog[4];

				if (timeForLast5Actions < 2000) {
					// Don't allow another attempt for 5 minutes
					if (timeSinceLastAction < (60 * 1000 * 5)) {
						throw new Meteor.Error('too-many-requests', 'Please wait 5 mins before retrying');
					} else {
					// it's been at least 5 mins so consider allowing another image upload
						const timeForPrevious5Actions = actionLog[4] - actionLog[9];

						if (timeForPrevious5Actions < 2000)	{
							// if the 5 previous actions were in 2 seconds, wait 30 minutes
							// this looks like an automatic process that has tried continually
							if (timeSinceLastAction < (60 * 1000 * 30 + 4000)) {
								throw new Meteor.Error('too-many-requests', 'Please wait 30 mins before retrying"');
							}
						}
					}
				}
			}
		}
	}

	// record the action in the log
	ActionsLog.update(
		{ '_id': actionsLogId },
		{
			'$push': {
				[action]: {
					'$each': [moment().valueOf()],
					'$position': 0,
				},
			},
		},
	);
	// remove the oldest log entry if too many stored
	const updatedActionsLog = ActionsLog.findOne({ 'userId': userId })[action];

	if (updatedActionsLog.length > NUMBER_OF_ACTIONS_LOGGED) {
		ActionsLog.update(
			{ '_id': actionsLogId },
			{ '$pop': { [action]: 1 } },
			{ 'bypassCollection2': true }, // collection2 causes an error on pop operation
		);
	}

	return true;
};

export default updateActionsLog;
