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

		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('add-recent-pattern-not-logged-in', 'Unable to add pattern to recents because the user is not logged in');
		}

		const pattern = Patterns.findOne({ '_id': patternId });

		if (!pattern) {
			throw new Meteor.Error('add-recent-pattern-not-found', 'Unable to add pattern to recents because the pattern was not found');
		}

		// addToSet seems like the obvious way to add elements to an array without duplicates, however I don't think it covers an array of objects where we want to update object properties and ensure the updated object is at the end

		// ensure the recent patterns list exists
		if (!Meteor.user().recentPatterns) {
			Meteor.users.update(
				{ '_id': Meteor.userId() },
				{ '$set': { 'recentPatterns': [] } },
			);
		}

		Meteor.users.update({ '_id': Meteor.userId(), 'recentPatterns.patternId': patternId },
			{
				'$set': { 'recentPatterns.$.patternId': 'toBeRemoved' },
			});

		// if the pattern is already in recents, remove it
		Meteor.users.update({ '_id': Meteor.userId() },
			{
				'$pull': { 'recentPatterns': { 'patternId': 'toBeRemoved' } },
			});

		const entry = {
			patternId,
			'updatedAt': new Date(),
		};

		// if we've reached the limit of how many recents to store
		// remove the oldest recent to make space
		if (Meteor.user().recentPatterns.length >= MAX_RECENTS) {
			Meteor.users.update(
				{ '_id': Meteor.userId() },
				{ '$pop': { 'recentPatterns': -1 } },
			);
		}

		// push the pattern onto the array
		Meteor.users.update({ '_id': Meteor.userId() },
			{
				'$push': { 'recentPatterns': entry },
			});
	},
});
