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
	ALLOWED_PREVIEW_ORIENTATIONS,
	DEFAULT_COLOR,
	DEFAULT_DIRECTION,
	DEFAULT_NUMBER_OF_TURNS,
	DEFAULT_ORIENTATION,
	DEFAULT_PALETTE,
	DEFAULT_PREVIEW_ORIENTATION,
	DEFAULT_WEFT_COLOR,
	MAX_ROWS,
	MAX_TABLETS,
} from '../../imports/modules/parameters';

const tinycolor = require('tinycolor2');

// the switch block in editPattern would be very messy otherwise
/* eslint-disable no-case-declarations */

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
			'previewOrientation': DEFAULT_PREVIEW_ORIENTATION,
			'orientations': new Array(tablets).fill(DEFAULT_ORIENTATION),
			patternDesign,
			patternType,
			// tablets,
			threading,
			'weftColor': DEFAULT_WEFT_COLOR,
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
	// /////////////////////
	// multi-purpose edit pattern method to avoid having to repeat the same permissions checks
	'pattern.edit': function ({
		_id,
		data,
	}) {
		check(_id, nonEmptyStringCheck);
		check(data, Match.ObjectIncluding({ 'type': String }));
		// type specifies the update operation
		// e.g. orientation, weftColor

		const { type } = data;

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-pattern-not-logged-in', 'Unable to edit pattern because the user is not logged in');
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('edit-pattern-not-found', 'Unable to edit pattern because the pattern was not found');
		}

		if (pattern.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-pattern-not-created-by-user', 'Unable to edit pattern because pattern was not created by the current logged in user');
		}

		// same for any pattern type
		const { numberOfRows, numberOfTablets, patternType } = pattern;

		// to be filled in by data depending on case
		let colorHexValue;
		let colorIndex;
		let direction;
		let hole;
		let insertNRows;
		let insertRowsAt;
		let insertNTablets;
		let insertTabletsAt;
		let numberOfTurns;
		let orientation;
		let row;
		let tablet;
		let value;

		switch (type) {
			case 'editWeavingCellDirection':
				({ direction, row, tablet } = data);
				check(direction, String);
				check(row, Match.Integer);
				check(tablet, validTabletsCheck);

				switch (patternType) {
					case 'individual':
						return Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${row}.${tablet}.direction`]: direction } });

					default:
						throw new Meteor.Error('edit-weaving-cell-direction-unknown-pattern-type', `Unable to add weaving cell direction because the pattern type ${patternType} was not recognised`);
				}

			case 'editWeavingCellNumberOfTurns':
				({ row, tablet, numberOfTurns } = data);
				check(row, Match.Integer);
				check(tablet, validTabletsCheck);
				check(numberOfTurns, Match.Integer);

				switch (patternType) {
					case 'individual':
						return Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${row}.${tablet}.numberOfTurns`]: numberOfTurns } });

					default:
						throw new Meteor.Error('edit-weaving-cell-turns-unknown-pattern-type', `Unable to add weaving cell turns because the pattern type ${patternType} was not recognised`);
				}

			case 'addWeavingRows':
				({ insertNRows, insertRowsAt } = data);
				check(insertNRows, Match.Integer);
				check(insertRowsAt, Match.Integer);

				if (insertNRows + numberOfRows > MAX_ROWS) {
					throw new Meteor.Error('add-rows-too-many-rows', 'Unable to add rows because the pattern will have too many rows');
				}

				if (insertRowsAt < 0 || insertRowsAt > numberOfRows) {
					throw new Meteor.Error('add-rows-invalid position', 'Unable to add rows because the position is invalid');
				}

				switch (patternType) {
					case 'individual':
						const newRows = [];

						for (let i = 0; i < insertNRows; i += 1) {
							const newRow = [];

							for (let j = 0; j < numberOfTablets; j += 1) {
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
							'numberOfRows': numberOfRows + insertNRows,
						};

						return Patterns.update({ _id }, update);

					default:
						throw new Meteor.Error('add-rows-unknown-pattern-type', `Unable to add rows because the pattern type ${patternType} was not recognised`);
				}

			case 'removeWeavingRow':
				({ row } = data);
				check(_id, nonEmptyStringCheck);
				check(row, Match.Integer);

				if (pattern.numberOfRows === 1) {
					throw new Meteor.Error('remove-row-last-row', 'Unable to remove row because there is only one row');
				}

				if (pattern.numberOfRows <= row) {
					throw new Meteor.Error('remove-row-invalid-row', 'Unable to remove row because the row does not exist');
				}

				switch (patternType) {
					case 'individual':
						// an element cannot be removed from an array by index
						// so first we mark the row to remove
						// then use 'pull'
						Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${row}.${0}.toBeRemoved`]: true } });

						// NOTE if the pull fails, the numberOfRows will then be incorrect
						// however if the following updates don't take place atomically, the client will likely show errors
						const update = {};
						update.$pull = { 'patternDesign.weavingInstructions': { '$elemMatch': { 'toBeRemoved': true } } };
						update.$set = {
							'numberOfRows': pattern.numberOfRows - 1,
						};

						return Patterns.update({ _id }, update);

					default:
						throw new Meteor.Error('remove-row-unknown-pattern-type', `Unable to remove row because the pattern type ${patternType} was not recognised`);
				}

			case 'editThreadingCell':
				({ hole, tablet, value } = data);

				check(hole, Match.Integer);
				check(tablet, validTabletsCheck);
				check(value, Match.Integer);
				// TO DO check value, hole valid

				// update the value in the nested arrays
				return Patterns.update({ _id }, { '$set': { [`threading.${hole}.${tablet}`]: value } });

			case 'addTablets':
				({ colorIndex, insertNTablets, insertTabletsAt } = data);

				check(insertNTablets, Match.Integer);
				check(insertTabletsAt, Match.Integer);
				check(colorIndex, validPaletteIndexCheck);

				if (insertNTablets + numberOfTablets > MAX_TABLETS) {
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


			case 'removeTablet':
				({ tablet } = data);
				check(tablet, validTabletsCheck);

				if (numberOfTablets === 1) {
					throw new Meteor.Error('edit-pattern-remove-tablet-last-tablet', 'Unable to remove tablet because there is only one tablet');
				}

				// an element cannot be removed from an array by index
				// so first we mark the tablet to remove
				// then use 'pull'

				const update1 = {};

				// updates for threading and orientation are the same for all pattern types
				update1.$set = {
					[`threading.$[].${tablet}`]: 'toBeRemoved',
					[`orientations.${tablet}`]: 'toBeRemoved',
				};

				// updates for weaving depend on pattern type
				switch (patternType) {
					case 'individual':
						// new picks to be added to each weaving row
						update1.$set[`patternDesign.weavingInstructions.$[].${tablet}.toBeRemoved`] = true;
						break;

					default:
						throw new Meteor.Error('remove-tablet-unknown-pattern-type', `Unable to remove tablet because the pattern type ${patternType} was not recognised`);
				}

				Patterns.update({ _id }, update1);

				const update2 = {};

				// updates for threading and orientation are the same for all pattern types
				update2.$pull = {
					'threading.$[]': 'toBeRemoved',
					'orientations': 'toBeRemoved',
				};
				update2.$set = {
					'numberOfTablets': pattern.numberOfTablets - 1,
				};

				// updates for weaving depend on pattern type
				switch (patternType) {
					case 'individual':
						// remove picks from each weaving row
						update2.$pull['patternDesign.weavingInstructions.$[]'] = { 'toBeRemoved': true };
						break;

					default:
						break;
				}

				return Patterns.update({ _id }, update2);

			case 'paletteColor':
				({ colorHexValue, colorIndex } = data);
				check(colorHexValue, String);
				check(colorIndex, validPaletteIndexCheck);

				if (!tinycolor(colorHexValue).isValid()) {
					throw new Meteor.Error('edit-pattern-palette-color-invalid', 'Unable to edit pattern because the new palette color is not a valid color');
				}
				// update the value in the nested arrays
				return Patterns.update({ _id }, { '$set': { [`palette.${colorIndex}`]: colorHexValue } });

			case 'weftColor':
				({ colorHexValue } = data);

				if (!tinycolor(colorHexValue).isValid()) {
					throw new Meteor.Error('edit-pattern-weft-color-invalid', 'Unable to edit pattern because the new weft color is not a valid color');
				}

				return Patterns.update({ _id }, { '$set': { 'weftColor': colorHexValue } });

			case 'orientation':
				({ tablet } = data);
				check(tablet, validTabletsCheck);

				if (tablet >= numberOfTablets) {
					throw new Meteor.Error('edit-pattern-invalid-tablet', 'Unable to edit pattern because an invalid tablet number was specified');
				}

				const newOrientation = pattern.orientations[tablet] === '\\' ? '/' : '\\';

				// update the value in the nested arrays
				return Patterns.update({ _id }, { '$set': { [`orientations.${tablet}`]: newOrientation } });

			case 'previewOrientation':
				({ orientation } = data);

				check(orientation, String);
				const values = ALLOWED_PREVIEW_ORIENTATIONS.map((option) => option.value);

				if (values.indexOf(orientation) === -1) {
					throw new Meteor.Error('edit-pattern-preview-orientation-invalid', 'Unable to edit pattern because an invalid preview orientation was specified');
				}

				return Patterns.update({ _id }, { '$set': { 'previewOrientation': orientation } });

			default:
				break;
		}
	},
});
