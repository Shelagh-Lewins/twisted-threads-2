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
	DEFAULT_DIRECTION,
	DEFAULT_NUMBER_OF_TURNS,
	DEFAULT_ORIENTATION,
	DEFAULT_PALETTE,
	MAX_ROWS,
	MAX_TABLETS,
	MAX_ROWS_TO_ADD,
	MAX_TABLETS_TO_ADD,
} from '../../imports/modules/parameters';

Meteor.methods({
	// overall pattern
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
		// note that if you use fill to create new Arrays per tablet, it's really just one array! We need to make sure each array is a new entity.
		const threading = new Array(holes);
		for (let i = 0; i < holes; i += 1) {
			threading[i] = new Array(tablets).fill(DEFAULT_COLOR);
		}

		// pattern design is based on patternType
		// and will be used to calculated picks, from which the weaving chart and preview will be drawn
		// 'for individual' pattern, patternDesign is simply picks
		let patternDesign = {};

		const weavingInstructions = new Array(rows); // construct an empty array to hold the picks
		for (let i = 0; i < rows; i += 1) {
			weavingInstructions[i] = new Array(tablets);
		}

		switch (patternType) {
			case 'individual':
				// fill in the weaving instructions as all Forward 1 turn
				for (let i = 0; i < tablets; i += 1) {
					for (let j = 0; j < rows; j += 1) {
						weavingInstructions[j][i] = {
							'direction': DEFAULT_DIRECTION,
							'numberOfTurns': DEFAULT_NUMBER_OF_TURNS,
						};
					}
				}

				patternDesign = { weavingInstructions };
				break;

			default:
				break;
		}

		return Patterns.insert({
			name,
			'nameSort': name.toLowerCase(),
			'numberOfRows': rows,
			'numberOfTablets': tablets,
			'createdAt': new Date(),
			'createdBy': Meteor.userId(),
			holes,
			'isPublic': false,
			'palette': DEFAULT_PALETTE,
			'orientations': new Array(tablets).fill(DEFAULT_ORIENTATION),
			patternDesign,
			patternType,
			// tablets,
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
	'pattern.getPatternCount': function () {
		// this is required for pagination
		// it needs to return the same number of patterns as the patterns publication in publications.js
		return Patterns.find({ 'createdBy': Meteor.userId() }).count();
	},
	// threading
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
	// weaving
	'pattern.editWeavingCellDirection': function ({
		_id,
		row,
		tablet,
		direction,
	}) {
		check(_id, nonEmptyStringCheck);
		check(row, Match.Integer);
		check(tablet, validTabletsCheck);
		check(direction, String);
		// this applies when editing the weaving chart for an 'individual' type of pattern

		// TO DO check the direction is valid

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-weaving-not-logged-in', 'Unable to edit weaving because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('edit-weaving-not-found', 'Unable to edit weaving because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-weaving-not-created-by-user', 'Unable to edit weaving because pattern was not created by the current logged in user');
		}

		// TODO this isn't tested
		if (pattern.patternType !== 'individual') {
			throw new Meteor.Error('edit-weaving-type-not-individual', 'Unable to edit weaving because pattern is not of type \'individual\'');
		}

		return Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${row}.${tablet}.direction`]: direction } });
	},
	'pattern.editWeavingCellNumberOfTurns': function ({
		_id,
		row,
		tablet,
		numberOfTurns,
	}) {
		check(_id, nonEmptyStringCheck);
		check(row, Match.Integer);
		check(tablet, validTabletsCheck);
		check(numberOfTurns, Match.Integer);
		// this applies when editing the weaving chart for an 'individual' type of pattern

		// to do check the row is valid
		// TO DO check the number of turns is valid
		// TO DO test all
console.log('here');
		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-weaving-not-logged-in', 'Unable to edit weaving because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('edit-weaving-not-found', 'Unable to edit weaving because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-weaving-not-created-by-user', 'Unable to edit weaving because pattern was not created by the current logged in user');
		}

		if (pattern.patternType !== 'individual') {
			throw new Meteor.Error('edit-weaving-type-not-individual', 'Unable to edit weaving because pattern is not of type \'individual\'');
		}
console.log('row', row);
console.log('tablet', tablet);
console.log('numberOfTurns', numberOfTurns);
		return Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${row}.${tablet}.numberOfTurns`]: numberOfTurns } });
	},
	'pattern.addWeavingRows': function ({
		_id,
		insertNRows,
		insertRowsAt,
	}) {
		check(_id, nonEmptyStringCheck);
		check(insertNRows, Match.Integer);
		check(insertRowsAt, Match.Integer);
		// this applies when adding rows to an 'individual' type of pattern

		// TO DO test all

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-rows-not-logged-in', 'Unable to add rows because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('add-rows-not-found', 'Unable to add rows because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('add-rows-not-created-by-user', 'Unable to add rows because pattern was not created by the current logged in user');
		}

		if (pattern.patternType !== 'individual') {
			throw new Meteor.Error('add-rows-type-not-individual', 'Unable to add rows because pattern is not of type \'individual\'');
		}

		if (pattern.patternType !== 'individual') {
			throw new Meteor.Error('add-rows-type-not-individual', 'Unable to add rows because pattern is not of type \'individual\'');
		}

		if (insertNRows > MAX_ROWS_TO_ADD) {
			throw new Meteor.Error('add-rows-too-many-rows', 'Unable to add rows because too many rows being added');
		}

		if (insertNRows + pattern.numberOfRows > MAX_ROWS) {
			throw new Meteor.Error('add-rows-too-many-rows', 'Unable to add rows because the pattern will have too many rows');
		}

		if (insertRowsAt < 0 || insertRowsAt > pattern.numberOfRows) {
			throw new Meteor.Error('add-rows-invalid position', 'Unable to add rows because the position is invalid');
		}

		const newRows = [];

		for (let i = 0; i < insertNRows; i += 1) {
			const newRow = [];

			for (let j = 0; j < pattern.numberOfTablets; j += 1) {
				newRow.push({
					'direction': DEFAULT_DIRECTION,
					'numberOfTurns': DEFAULT_NUMBER_OF_TURNS,
				});
			}
			newRows.push(newRow);
		}

		const update = {};
		update.$push = {
			'patternDesign.weavingInstructions': {
				'$each': newRows,
				'$position': insertRowsAt,
			},
		};
		update.$set = {
			'numberOfRows': pattern.numberOfRows + insertNRows,
		};

		return Patterns.update({ _id }, update);
	},
	'pattern.removeWeavingRow': function ({
		_id,
		rowIndex,
	}) {
		check(_id, nonEmptyStringCheck);
		check(rowIndex, Match.Integer);
		// this applies when removing a row from an 'individual' type of pattern

		// TO DO test all

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-row-not-logged-in', 'Unable to remove row because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('remove-row-not-found', 'Unable to remove row because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('remove-row-not-created-by-user', 'Unable to remove row because pattern was not created by the current logged in user');
		}

		if (pattern.patternType !== 'individual') {
			throw new Meteor.Error('remove-row-type-not-individual', 'Unable to remove row because pattern is not of type \'individual\'');
		}

		if (pattern.numberOfRows === 1) {
			throw new Meteor.Error('remove-row-last-row', 'Unable to remove row because there is only one row');
		}

		if (pattern.numberOfRows <= rowIndex) {
			throw new Meteor.Error('remove-row-invalid-row', 'Unable to remove row because the row does not exist');
		}

		// an element cannot be removed from an array by index
		// so first we mark the row to remove
		// then use 'pull'

		Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${rowIndex}.${0}.toBeDeleted`]: true } });

		// NOTE if the pull fails, the numberOfRows will then be incorrect
		// however if the following updates don't take place atomically, the client will likely show errors
		const update = {};
		update.$pull = { 'patternDesign.weavingInstructions': { '$elemMatch': { 'toBeDeleted': true } } };
		update.$set = {
			'numberOfRows': pattern.numberOfRows - 1,
		};

		return Patterns.update({ _id }, update);
	},
	'pattern.addTablets': function ({
		_id,
		colorIndex,
		insertNTablets,
		insertTabletsAt,
	}) {
		check(_id, nonEmptyStringCheck);
		check(colorIndex, Match.Integer); // TO DO check this is a valid color
		check(insertNTablets, Match.Integer);
		check(insertTabletsAt, Match.Integer);
		// this applies when adding tablets to any type of pattern

		// TO DO test all

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-tablets-not-logged-in', 'Unable to add tablets because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });
		const {
			createdBy,
			numberOfRows,
			numberOfTablets,
			patternType,
		} = pattern;

		if (!pattern) {
			throw new Meteor.Error('add-tablets-not-found', 'Unable to add tablets because the pattern was not found');
		}

		if (createdBy !== Meteor.userId()) {
			throw new Meteor.Error('add-tablets-not-created-by-user', 'Unable to add tablets because pattern was not created by the current logged in user');
		}

		if (colorIndex >= DEFAULT_PALETTE.length) {
			throw new Meteor.Error('add-tablets-invalid-color', 'Unable to add tablets because an invalid thread color was specified');
		}

		if (colorIndex < -1) {
			throw new Meteor.Error('add-tablets-invalid-color', 'Unable to add tablets because an invalid thread color was specified');
		}

		if (insertNTablets > MAX_ROWS_TO_ADD) {
			throw new Meteor.Error('add-tablets-too-many-tablets', 'Unable to add tablets because too many tablets being added');
		}

		if (insertNTablets + numberOfRows > MAX_ROWS) {
			throw new Meteor.Error('add-tablets-too-many-rows', 'Unable to add tablets because the pattern will have too many tablets');
		}

		if (insertTabletsAt < 0 || insertTabletsAt > numberOfTablets) {
			throw new Meteor.Error('add-tablets-invalid position', 'Unable to add tablets because the position is invalid');
		}

		// new tablets to be added to each threading row
		const newTablets = [];

		for (let j = 0; j < insertNTablets; j += 1) {
			newTablets.push(colorIndex);
		}

		// new tablets to be added to orientation
		const newOrientations = [];

		for (let j = 0; j < insertNTablets; j += 1) {
			newOrientations.push(DEFAULT_ORIENTATION);
		}

		const update = {};

		// updates for threading and orientation are the same for all pattern types
		update.$push = {
			'threading.$[]': {
				'$each': newTablets,
				'$position': insertTabletsAt,
			},
			'orientations': {
				'$each': newOrientations,
				'$position': insertTabletsAt,
			},
		};

		// updates for weaving depend on pattern type
		let newWeaving;

		switch (patternType) {
			case 'individual':
				// new picks to be added to each weaving row
				newWeaving = [];

				for (let j = 0; j < insertNTablets; j += 1) {
					newWeaving.push({
						'direction': DEFAULT_DIRECTION,
						'numberOfTurns': DEFAULT_NUMBER_OF_TURNS,
					});
				}

				update.$push['patternDesign.weavingInstructions.$[]'] = {
					'$each': newWeaving,
					'$position': insertTabletsAt,
				};
				break;

			default:
				break;
		}

		update.$set = {
			'numberOfTablets': pattern.numberOfTablets + insertNTablets,
		};

		return Patterns.update({ _id }, update);
	},
	'pattern.removeTablet': function ({
		_id,
		tabletIndex,
	}) {
		check(_id, nonEmptyStringCheck);
		check(tabletIndex, Match.Integer);
		// this applies when removing a tablet from any type of pattern

		// TO DO test all

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-tablet-not-logged-in', 'Unable to remove tablet because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });
		const {
			createdBy,
			numberOfTablets,
			patternType,
		} = pattern;

		if (!pattern) {
			throw new Meteor.Error('remove-tablet-not-found', 'Unable to remove tablet because the pattern was not found');
		}

		if (createdBy !== Meteor.userId()) {
			throw new Meteor.Error('remove-tablet-not-created-by-user', 'Unable to remove tablet because pattern was not created by the current logged in user');
		}

		if (numberOfTablets === 1) {
			throw new Meteor.Error('remove-tablet-last-tablet', 'Unable to remove tablet because there is only one tablet');
		}

		if (numberOfTablets <= tabletIndex) {
			throw new Meteor.Error('remove-tablet-invalid-tablet', 'Unable to remove tablet because the tablet does not exist');
		}

		// an element cannot be removed from an array by index
		// so first we mark the tablet to remove
		// then use 'pull'

		const update1 = {};

		// updates for threading and orientation are the same for all pattern types
		update1.$set = {
			[`threading.$[].${tabletIndex}`]: 'toBeDeleted',
			[`orientations.${tabletIndex}`]: 'toBeDeleted',
		};

		// updates for weaving depend on pattern type
		switch (patternType) {
			case 'individual':
				// new picks to be added to each weaving row
				update1.$set[`patternDesign.weavingInstructions.$[].${tabletIndex}.toBeDeleted`] = true;
				break;

			default:
				break;
		}

		Patterns.update({ _id }, update1);

		const update2 = {};

		// updates for threading and orientation are the same for all pattern types
		update2.$pull = {
			'threading.$[]': 'toBeDeleted',
			'orientations': 'toBeDeleted',
		};
		update2.$set = {
			'numberOfTablets': pattern.numberOfTablets - 1,
		};

		// updates for weaving depend on pattern type
		switch (patternType) {
			case 'individual':
				// remove picks from each weaving row
				update2.$pull['patternDesign.weavingInstructions.$[]'] = { 'toBeDeleted': true };
				break;

			default:
				break;
		}

		return Patterns.update({ _id }, update2);
	},
});
