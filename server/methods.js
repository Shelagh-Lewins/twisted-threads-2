import { check } from 'meteor/check';
import Patterns from '../imports/collection';

Meteor.methods({
	addPattern(name) {
		check(name, String);

		const patterns = Patterns.insert({
			name,
		});
		return patterns;
	},
	removePattern(_id) {
		check(_id, String);

		const patterns = Patterns.remove({
			_id,
		});
		return patterns;
	},
	getPatternCount() {
		return Patterns.find().count();
	},
	sendVerificationEmail(userId) {
		check(userId, String);

		if (userId === Meteor.userId()) {
			return Accounts.sendVerificationEmail(userId);
		}

		throw new Meteor.Error('send-verification-email-not-logged-in', 'Unable to send verification email because the user is not logged in');
	},
});
