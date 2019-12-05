import { check } from 'meteor/check';
import { Patterns } from '../../imports/modules/collection';
import { MAX_RECENTS } from '../../imports/modules/parameters';

Meteor.methods({
	'auth.sendVerificationEmail': function (userId) {
		check(userId, String);

		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('send-verification-email-not-logged-in', 'Unable to send verification email because the user is not logged in');
		}

		return Accounts.sendVerificationEmail(userId);
	},
	'auth.setRecentPatterns': function ({
		userId,
		newRecentPatterns,
	}) {
		check(newRecentPatterns, Match.Where((recentPatterns) => {
			recentPatterns.forEach((entry) => {
				check(entry.patternId, String);
				check(entry.updatedAt, Match.Where((value) => {
					if (isNaN(new Date(value).getTime())) {
						return false;
					}
					return true;
				}));
				check(entry.currentWeavingRow, Match.Maybe(Number));
			});
			return true;
		}));
		check(userId, String);

		// the client provides an array of recent patterns with no duplicates and the most recent at the start
		// the server only checks that the total number of recents isn't exceeded

		// TO DO test

		// recentPatterns is stored in Profile so that it is published to the user
		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('add-recent-pattern-not-logged-in', 'Unable to add pattern to recents because the user is not logged in');
		}

		const recentPatterns = [...newRecentPatterns];

		while (recentPatterns.length > MAX_RECENTS) {
			newRecentPatterns.pop();
		}

		Meteor.users.update(
			{ '_id': Meteor.userId() },
			{ '$set': { 'profile.recentPatterns': recentPatterns } },
		);
	},
});
