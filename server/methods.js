import { check } from 'meteor/check';
import Patterns from '../imports/collection';

Meteor.methods({
	addPattern(name) {
		check(name, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-pattern-not-logged-in', 'Unable to create pattern because the user is not logged in');
		}

		if (!Meteor.user().emails[0].verified) {
			throw new Meteor.Error('add-pattern-not-logged-in', 'Unable to create pattern because the user\'s email address is not verified');
		}

		return Patterns.insert({
			name,
			'name_sort': name.toLowerCase(),
			'created_at': new Date(),
			'created_by': Meteor.userId(),
		});
	},
	removePattern(_id) {
		check(_id, String);

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-pattern-not-logged-in', 'Unable to remove pattern because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (pattern.created_by !== Meteor.userId()) {
			throw new Meteor.Error('remove-pattern-not-created-by-user', 'Unable to remove pattern because it was not created by the current logged in user');
		}

		return Patterns.remove({
			_id,
		});
	},
	getPatternCount() {
		// this is required for pagination
		// it needs to return the same number of patterns as the patterns publication in publications.js
		return Patterns.find({ 'created_by': Meteor.userId() }).count();
	},
	sendVerificationEmail(userId) {
		check(userId, String);

		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('send-verification-email-not-logged-in', 'Unable to send verification email because the user is not logged in');
		}

		return Accounts.sendVerificationEmail(userId);
	},
});
