import { check } from 'meteor/check';
import { ColorBooks, Patterns } from '../imports/collection';
import {
	ALLOWED_HOLES,
	ALLOWED_PATTERN_TYPES,
	COLORS_IN_COLOR_BOOK,
	DEFAULT_COLOR_BOOK_COLOR,
	DEFAULT_PALETTE,
	MAX_ROWS,
	MAX_TABLETS,
} from '../imports/parameters';

const nonEmptyStringCheck = Match.Where((x) => {
	check(x, String);
	return x !== '';
});

Meteor.methods({
	addColorBook(name) {
		check(name, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-color-book-not-logged-in', 'Unable to create color book because the user is not logged in');
		}

		if (!Meteor.user().emails[0].verified) {
			throw new Meteor.Error('add-color-book-not-verified', 'Unable to create color book because the user\'s email address is not verified');
		}

		const colors = new Array(COLORS_IN_COLOR_BOOK).fill(DEFAULT_COLOR_BOOK_COLOR);

		return ColorBooks.insert({
			name,
			'nameSort': name.toLowerCase(),
			'createdAt': new Date(),
			'createdBy': Meteor.userId(),
			'colors': colors,
			'isPublic': false,
		});
	},
	editColorBookColor({
		_id,
		colorHexValue,
		colorIndex,
	}) {
		check(_id, nonEmptyStringCheck);
		check(colorHexValue, nonEmptyStringCheck);
		check(colorIndex, Match.Integer);

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-color-not-logged-in', 'Unable to edit color book color because the user is not logged in');
		}

		const colorBook = ColorBooks.findOne({ _id });

		if (!colorBook) {
			throw new Meteor.Error('edit-color-book-color-not-found', 'Unable to edit color book color because the color book was not found');
		}

		if (colorBook.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-color-not-owner', 'Unable to edit color book color because it was not created by the current logged in user');
		}

		// update the value in the nested arrays
		return ColorBooks.update({ _id }, { '$set': { [`colors.${colorIndex}`]: colorHexValue } });
	},
	editColorBookName({
		_id,
		name,
	}) {
		check(_id, nonEmptyStringCheck);
		check(name, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-name-not-logged-in', 'Unable to edit color book name because the user is not logged in');
		}

		const colorBook = ColorBooks.findOne({ _id });

		if (!colorBook) {
			throw new Meteor.Error('edit-color-book-name-not-found', 'Unable to edit color book name because the color book was not found');
		}

		if (colorBook.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-name-not-owner', 'Unable to edit color book name because the user did not create the color book');
		}

		return ColorBooks.update({ _id }, { '$set': { 'name': name, 'nameSort': name.toLowerCase() } });
	},
	removeColorBook(_id) {
		check(_id, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-color-book-not-logged-in', 'Unable to remove color book because the user is not logged in');
		}

		const colorBook = ColorBooks.findOne({ _id });

		if (!colorBook) {
			throw new Meteor.Error('remove-color-book-not-found', 'Unable to remove color book because the color book was not found');
		}

		if (colorBook.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('remove-color-book-not-owner', 'Unable to remove color book because the user did not create the color book');
		}

		check(_id, String);

		return ColorBooks.remove({ _id });
	},
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
		const threading = new Array(holes).fill(new Array(tablets).fill(3)); // default thread color is different from that selected in palette, so that users will see something happen if they click on the threading chart

		return Patterns.insert({
			name,
			'nameSort': name.toLowerCase(),
			'createdAt': new Date(),
			'createdBy': Meteor.userId(),
			holes,
			'isPublic': false,
			'palette': DEFAULT_PALETTE,
			'orientations': new Array(tablets).fill('/'),
			patternType,
			rows,
			tablets,
			threading,
		});
	},
	removePattern(_id) {
		check(_id, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-pattern-not-logged-in', 'Unable to remove pattern because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('remove-pattern-not-found', 'Unable to remove pattern because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
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
		const validHolesCheck = Match.Where((x) => {
			check(x, Match.Integer);

			return x >= 0;
		});

		const validTabletsCheck = Match.Where((x) => {
			check(x, Match.Integer);

			return x >= 0 && x <= MAX_TABLETS - 1;
		});

		check(_id, nonEmptyStringCheck);
		check(hole, validHolesCheck);
		check(tablet, validTabletsCheck);
		check(value, Match.Integer);

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-threading-not-logged-in', 'Unable to edit threading because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('edit-threading-not-found', 'Unable to edit threading because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-threading-not-created-by-user', 'Unable to edit threading because pattern was not created by the current logged in user');
		}

		// update the value in the nested arrays
		return Patterns.update({ _id }, { '$set': { [`threading.${hole}.${tablet}`]: value } });
	},
	editOrientation({
		_id,
		tablet,
	}) {
		// to do: check and test
		// user must own pattern
		// values must be valid
		// pattern must exist

		const pattern = Patterns.findOne({ _id });
		const newOrientation = pattern.orientations[tablet] === '\\' ? '/' : '\\';

		// update the value in the nested arrays
		return Patterns.update({ _id }, { '$set': { [`orientations.${tablet}`]: newOrientation } });
	},
	editPaletteColor({
		_id,
		colorHexValue,
		colorIndex,
	}) {
		// to do: check and test
		// user must own pattern
		// values must be valid
		// pattern must exist

		// update the value in the nested arrays
		return Patterns.update({ _id }, { '$set': { [`palette.${colorIndex}`]: colorHexValue } });
	},
	getPatternCount() {
		// this is required for pagination
		// it needs to return the same number of patterns as the patterns publication in publications.js
		return Patterns.find({ 'createdBy': Meteor.userId() }).count();
	},
	sendVerificationEmail(userId) {
		check(userId, String);

		if (userId !== Meteor.userId()) {
			throw new Meteor.Error('send-verification-email-not-logged-in', 'Unable to send verification email because the user is not logged in');
		}

		return Accounts.sendVerificationEmail(userId);
	},
});
