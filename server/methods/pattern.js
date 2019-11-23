import { check } from 'meteor/check';
import {
	nonEmptyStringCheck,
	validHolesCheck,
	validRowsCheck,
	validTabletsCheck,
	validPaletteIndexCheck,
	validPatternTypeCheck,
} from '../../imports/server/modules/utils';
import { Patterns } from '../../imports/modules/collection';
import {
	DEFAULT_COLOR,
	DEFAULT_PALETTE,
} from '../../imports/modules/parameters';

Meteor.methods({
	'pattern.add': function ({
		holes,
		name,
		rows,
		tablets,
		patternType,
	}) {
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
		const threading = new Array(holes).fill(new Array(tablets).fill(DEFAULT_COLOR));

		let patternDesign = {};
		const pick = {
			'direction': 'f',
			'numberOfTurns': 1,
		};
		const picks = [];

		switch (patternType) {
			case 'individual':
				for (let i = 0; i < tablets; i += 1) {
					picks.push(pick);
				}
				patternDesign = { picks };
				break;

			default:
				break;
		}

		// to do pattern design, based on patternType
		// will be used to calculated picks, then tabletPositions
		// for individual pattern, patternDesign will be simply picks

		return Patterns.insert({
			name,
			'nameSort': name.toLowerCase(),
			'createdAt': new Date(),
			'createdBy': Meteor.userId(),
			holes,
			'isPublic': false,
			'palette': DEFAULT_PALETTE,
			'orientations': new Array(tablets).fill('/'),
			patternDesign,
			patternType,
			tablets,
			threading,
		});
	},
	'pattern.remove': function (_id) {
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
	'pattern.editThreadingCell': function ({
		_id,
		hole,
		tablet,
		value,
	}) {
		check(_id, nonEmptyStringCheck);
		check(hole, Match.Integer);
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
	'pattern.editOrientation': function ({
		_id,
		tablet,
	}) {
		check(_id, nonEmptyStringCheck);
		check(tablet, validTabletsCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-orientation-not-logged-in', 'Unable to edit orientation because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('edit-orientation-not-found', 'Unable to edit orientation because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-orientation-not-created-by-user', 'Unable to edit orientation because pattern was not created by the current logged in user');
		}

		const newOrientation = pattern.orientations[tablet] === '\\' ? '/' : '\\';

		// update the value in the nested arrays
		return Patterns.update({ _id }, { '$set': { [`orientations.${tablet}`]: newOrientation } });
	},
	'pattern.editPaletteColor': function ({
		_id,
		colorHexValue,
		colorIndex,
	}) {
		check(_id, nonEmptyStringCheck);
		check(colorHexValue, String);
		check(colorIndex, validPaletteIndexCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-palette-color-not-logged-in', 'Unable to edit palette color because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('edit-palette-color-not-found', 'Unable to edit palette color because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-palette-color-not-created-by-user', 'Unable to edit palette color because pattern was not created by the current logged in user');
		}

		// update the value in the nested arrays
		return Patterns.update({ _id }, { '$set': { [`palette.${colorIndex}`]: colorHexValue } });
	},
	'pattern.getPatternCount': function () {
		// this is required for pagination
		// it needs to return the same number of patterns as the patterns publication in publications.js
		return Patterns.find({ 'createdBy': Meteor.userId() }).count();
	},
});
