import { check } from 'meteor/check';
import { MAX_RECENTS } from '../../imports/modules/parameters';
import { Patterns } from '../../imports/modules/collection';
import {
	checkCanCreateColorBook,
	checkUserCanAddPatternImage,
	nonEmptyStringCheck,
} from '../../imports/server/modules/utils';
import updateActionsLog from '../../imports/server/modules/actionsLog';

Meteor.methods({
	'auth.sendVerificationEmail': function (userId) {
		check(userId, nonEmptyStringCheck);

		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('send-verification-email-not-logged-in', 'Unable to send verification email because the user is not logged in');
		}

		updateActionsLog('verificationEmailSent');

		return Accounts.sendVerificationEmail(userId);
	},
	'auth.setRecentPatterns': function ({
		userId,
		newRecentPatterns,
	}) {
		check(userId, nonEmptyStringCheck);

		// recentPatterns is stored in Profile so that it is published to the user
		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('add-recent-pattern-not-logged-in', 'Unable to add pattern to recents because the user is not logged in');
		}

		const recentPatterns = [];

		newRecentPatterns.forEach((entry) => {
			const { currentWeavingRow, patternId, updatedAt } = entry;

			check(patternId, String);
			check(updatedAt, Match.Where((value) => {
				if (isNaN(new Date(value).getTime())) {
					return false;
				}
				return true;
			}));

			const pattern = Patterns.findOne({ '_id': patternId });

			if (!pattern) {
				return;
			}

			// check in case of invalid weaving row
			check(currentWeavingRow, Match.Maybe(Number));
			if (currentWeavingRow < 0 || currentWeavingRow > pattern.numberOfRows) {
				entry.currentWeavingRow = 1;
			}

			recentPatterns.push(entry);
		});

		// the client provides an array of recent patterns with no duplicates and the most recent at the start
		// the server only checks that the total number of recents isn't exceeded

		// TO DO test

		while (recentPatterns.length > MAX_RECENTS) {
			recentPatterns.pop();
		}

		Meteor.users.update(
			{ '_id': Meteor.userId() },
			{ '$set': { 'profile.recentPatterns': recentPatterns } },
		);
	},
	'auth.checkUserCanCreateColorBook': function () {
		return checkCanCreateColorBook();
	},
	'auth.checkUserCanAddPatternImage': function ({ patternId }) {
		check(patternId, nonEmptyStringCheck);

		return checkUserCanAddPatternImage(patternId);
	},
});
