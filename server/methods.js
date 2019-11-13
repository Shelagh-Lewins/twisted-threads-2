import { check } from 'meteor/check';
import Patterns from '../imports/collection';

Meteor.methods({
	addPattern({
		holes,
		name,
		rows,
		tablets,
		patternType,
	}) {
		const validPatternTypeCheck = Match.Where((x) => {
			const validPatternTypes = [
				'individual', // simulation pattern, woven by turning each tablet individually
				'allTogether', // simulation pattern, woven by turning all tablets together

				// TODO build and add freehand, allTogether, packs, 3-1-broken-twill
			];
			return validPatternTypes.indexOf(x) !== -1;
		});

		check(name, String);
		check(holes, Number);
		check(rows, Number);
		check(tablets, Number);
		check(patternType, validPatternTypeCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-pattern-not-logged-in', 'Unable to create pattern because the user is not logged in');
		}

		if (!Meteor.user().emails[0].verified) {
			throw new Meteor.Error('add-pattern-not-verified', 'Unable to create pattern because the user\'s email address is not verified');
		}

		// threading is an array of arrays
		const threading = new Array(rows).fill(new Array(tablets).fill(0));

		return Patterns.insert({
			name,
			'name_sort': name.toLowerCase(),
			'created_at': new Date(),
			'created_by': Meteor.userId(),
			holes,
			rows,
			tablets,
			threading,
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
