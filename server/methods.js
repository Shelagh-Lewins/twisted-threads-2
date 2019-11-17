import { check } from 'meteor/check';
import Patterns from '../imports/collection';
import {
	ALLOWED_HOLES,
	ALLOWED_PATTERN_TYPES,
	DEFAULT_PALETTE,
	MAX_ROWS,
	MAX_TABLETS,
} from '../imports/parameters';

Meteor.methods({
	addPattern({
		holes,
		name,
		rows,
		tablets,
		patternType,
	}) {
		const validHolesCheck = Match.Where((x) => {
			check(x, Match.Integer);

			return ALLOWED_HOLES.indexOf(x) !== -1;
		});

		const validRowsCheck = Match.Where((x) => {
			check(x, Match.Integer);

			return x >= 1 && x <= MAX_ROWS;
		});

		const validTabletsCheck = Match.Where((x) => {
			check(x, Match.Integer);

			return x >= 1 && x <= MAX_TABLETS;
		});

		const validPatternTypeCheck = Match.Where((x) => {
			check(x, String);
			const allowedType = ALLOWED_PATTERN_TYPES.find((type) => type.name === x);

			return typeof allowedType.name === 'string';
		});

		check(name, String);
		check(holes, validHolesCheck);
		check(rows, validRowsCheck);
		check(tablets, validTabletsCheck);
		check(patternType, validPatternTypeCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-pattern-not-logged-in', 'Unable to create pattern because the user is not logged in');
		}

		if (!Meteor.user().emails[0].verified) {
			throw new Meteor.Error('add-pattern-not-verified', 'Unable to create pattern because the user\'s email address is not verified');
		}

		// threading is an array of arrays
		// one row per hole
		// one column per tablet
		const threading = new Array(holes).fill(new Array(tablets).fill(0));

		return Patterns.insert({
			name,
			'name_sort': name.toLowerCase(),
			'created_at': new Date(),
			'created_by': Meteor.userId(),
			holes,
			'palette': DEFAULT_PALETTE,
			'orientations': new Array(tablets).fill('/'),
			patternType,
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
	editThreadingCell({
		_id,
		hole,
		tablet,
		value,
	}) {
		// to do: check and test
		// user must own pattern
		// values must be valid
		// pattern must exist

		/* console.log('_id', _id);
		console.log('hole', hole);
		console.log('tablet', tablet);
		console.log('value', value); */

		// update the value in the nested arrays
		Patterns.update({ _id }, { '$set': { [`threading.${hole}.${tablet}`]: value } });
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
