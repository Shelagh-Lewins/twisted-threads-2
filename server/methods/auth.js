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
	'auth.addRecentPattern': function ({
		userId,
		patternId,
		currentWeavingRow,
	}) {
		check(currentWeavingRow, Match.Maybe(Match.Integer));
		check(patternId, String);
		check(userId, String);

		// TO DO test

		// recentPatterns is stored in Profile so that it is published to the user
		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('add-recent-pattern-not-logged-in', 'Unable to add pattern to recents because the user is not logged in');
		}

		const pattern = Patterns.findOne({ '_id': patternId });

		if (!pattern) {
			throw new Meteor.Error('add-recent-pattern-not-found', 'Unable to add pattern to recents because the pattern was not found');
		}

		const entry = {
			patternId,
			'updatedAt': new Date(),
		};

		// ensure the recent patterns list exists
		if (!Meteor.user().profile.recentPatterns) {
			Meteor.users.update(
				{ '_id': Meteor.userId() },
				{ '$set': { 'profile.recentPatterns': [] } },
			);
		}

		const { recentPatterns } = Meteor.user().profile;

		// find existing entry, if any
		const thisRecentPattern = recentPatterns.find((recentPattern) => recentPattern.patternId === patternId);

		if (typeof currentWeavingRow !== 'undefined') { // the user is on the Interactive Weaving Chart
			entry.currentWeavingRow = currentWeavingRow;
		} else if (thisRecentPattern && typeof thisRecentPattern.currentWeavingRow !== 'undefined') { // preserve a previous value, the user may be on the Pattern page
			entry.currentWeavingRow = thisRecentPattern.currentWeavingRow;
		}

		// addToSet seems like the obvious way to add elements to an array without duplicates, however I don't think it covers an array of objects where we want to update object properties and ensure the updated object is at the end of the array

		const numberOfRecents = recentPatterns.length;

		// meteor does not support deleting multiple objects from an array
		// so loop over them, just in case of duplicates
		// this shouldn't occur but has done in testing
		for (let i = 0; i < numberOfRecents; i += 1) {
			const recent = recentPatterns[i];

			if (recent.patternId === patternId) {
				const update = {};
				const identifier = `profile.recentPatterns.${i}.patternId`;
				update[identifier] = 'toBeRemoved';

				Meteor.users.update({ '_id': Meteor.userId() },
					{
						'$set': update,
					});
			}
		}

		// if the pattern is already in recents, remove all instances
		Meteor.users.update({ '_id': Meteor.userId() },
			{
				'$pull': { 'profile.recentPatterns': { 'patternId': 'toBeRemoved' } },
			});

		// if we've reached the limit of how many recents to store
		// remove the oldest recent to make space
		if (Meteor.user().profile.recentPatterns.length >= MAX_RECENTS) {
			Meteor.users.update(
				{ '_id': Meteor.userId() },
				{ '$pop': { 'profile.recentPatterns': -1 } },
			);
		}

		// push the pattern onto the array
		Meteor.users.update({ '_id': Meteor.userId() },
			{
				'$push': { 'profile.recentPatterns': entry },
			});
	},
});
