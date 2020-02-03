import { check } from 'meteor/check';
import {
	checkUserCanCreatePattern,
	getTabletFilter,
	nonEmptyStringCheck,
	positiveIntegerCheck,
	updatePublicPatternsCount,
	validHolesCheck,
	validRowsCheck,
	validTabletsCheck,
	validPaletteIndexCheck,
	validPatternTypeCheck,
} from '../../imports/server/modules/utils';
import { PatternImages, PatternPreviews, Patterns, Tags } from '../../imports/modules/collection';
import {
	ALLOWED_PATTERN_TYPES,
	ALLOWED_PREVIEW_ORIENTATIONS,
	BROKEN_TWILL_THREADING,
	BROKEN_TWILL_FOREGROUND,
	BROKEN_TWILL_BACKGROUND,
	DEFAULT_COLOR,
	DEFAULT_DIRECTION,
	DEFAULT_NUMBER_OF_TURNS,
	DEFAULT_ORIENTATION,
	DEFAULT_PALETTE,
	DEFAULT_WEFT_COLOR,
	MAX_ROWS,
	MAX_TABLETS,
} from '../../imports/modules/parameters';
import {
	getPatternPermissionQuery,
} from '../../imports/modules/permissionQueries';

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
		twillDirection,
	}) {
		check(name, String);
		check(holes, validHolesCheck);
		check(rows, validRowsCheck);
		check(tablets, validTabletsCheck);
		check(patternType, validPatternTypeCheck);
		check(twillDirection, Match.Maybe(String));

		const { error, result } = checkUserCanCreatePattern();

		if (error) {
			throw error;
		}

		// threading is an array of arrays
		// one row per hole
		// one column per tablet
		// note that if you use fill to create new Arrays per tablet, it's really just one array! We need to make sure each array is a new entity.
		// most pattern types use the same threading, so set up the default for all and change later if necessary
		const threading = new Array(holes);
		for (let i = 0; i < holes; i += 1) {
			threading[i] = new Array(tablets).fill(DEFAULT_COLOR);
		}

		// pattern design is based on patternType
		// and will be used to calculated picks, from which the weaving chart and preview will be drawn
		// 'for individual' pattern, patternDesign is simply picks
		let patternDesign = {};
		const tags = [];

		const weavingInstructions = new Array(rows); // construct an empty array to hold the picks
		for (let i = 0; i < rows; i += 1) {
			weavingInstructions[i] = new Array(tablets);
		}

		switch (patternType) {
			case 'individual':
				// specify tablet turning individually for every row and tablet
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
				tags.push('individual');
				break;

			case 'allTogether':
				// all tablets are turned together each row
				// fill in the weaving instructions as Forward for every row
				for (let i = 0; i < rows; i += 1) {
					weavingInstructions[i] = DEFAULT_DIRECTION;
				}

				patternDesign = { weavingInstructions };
				tags.push('all together');
				break;

			case 'brokenTwill':
				// double faced pattern with diagonal structure
				// designed on graph paper and converted to weaving chart
				// 4 hole tablets only
				if (holes !== 4) {
					throw new Meteor.Error('add-pattern-invalid-holes', 'Unable to add pattern because the number of holes must be 4 for broken twill');
				}

				// even number of rows
				if (rows % 2 !== 0) {
					throw new Meteor.Error('add-pattern-invalid-rows', 'Unable to add pattern because the number of rows must be even for broken twill');
				}

				// must have twill direction S or Z
				if (twillDirection !== 'S' && twillDirection !== 'Z') {
					throw new Meteor.Error('add-pattern-twill-direction', 'Unable to add pattern because the twill direction is invalid');
				}

				// set up the pattern chart
				// this corresponds to Data in GTT pattern. This is the chart showing the two-colour design.
				const twillPatternChart = [];
				const twillDirectionChangeChart = [];

				// set up a plain chart for each, this will give just background twill
				// charts have an extra row at the end
				// this extra row is not shown in preview or weaving chart but is used to determine the last even row
				for (let i = 0; i < (rows / 2) + 1; i += 1) {
					twillPatternChart[i] = [];
					twillDirectionChangeChart[i] = [];

					for (let j = 0; j < tablets; j += 1) {
						twillPatternChart[i][j] = '.';
						twillDirectionChangeChart[i][j] = '.';
					}
				}

				patternDesign = {
					twillDirection,
					twillPatternChart,
					twillDirectionChangeChart,
				};

				// broken twill threading is set up with two colours in a repeating pattern
				for (let i = 0; i < holes; i += 1) {
					for (let j = 0; j < tablets; j += 1) {
						const colorRole = BROKEN_TWILL_THREADING[i][j % holes];
						threading[i][j] = colorRole === 'F' ? BROKEN_TWILL_FOREGROUND : BROKEN_TWILL_BACKGROUND;
					}
				}

				// broken twill uses the default orientation, same as other patterns (/ or S)
				tags.push('3/1 broken twill');
				break;


			default:
				break;
		}

		const { previewOrientation } = ALLOWED_PATTERN_TYPES.find((type) => type.name === patternType);

		const patternId = Patterns.insert({
			'description': '',
			name,
			'nameSort': name.toLowerCase(),
			'numberOfRows': rows,
			'numberOfTablets': tablets,
			'createdAt': new Date(),
			'createdBy': Meteor.userId(),
			holes,
			'isPublic': false,
			'palette': DEFAULT_PALETTE,
			'previewOrientation': previewOrientation,
			'orientations': new Array(tablets).fill(DEFAULT_ORIENTATION),
			patternDesign,
			patternType,
			threading,
			'tags': [],
			'threadingNotes': '',
			'weavingNotes': '',
			'weftColor': DEFAULT_WEFT_COLOR,
		});

		// update the user's count of public patterns
		updatePublicPatternsCount(Meteor.userId());

		// add the tags
		tags.forEach((tag) => {
			const existing = Tags.findOne({ 'name': tag });

			if (existing) {
				Meteor.call('tags.assignToPattern', {
					patternId,
					'tagId': existing._id,
				});
			} else {
				Meteor.call('tags.add', {
					patternId,
					'name': tag,
				});
			}
		});

		return patternId;
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

		// remove the pattern preview
		PatternPreviews.remove({ 'patternId': _id });

		const patternImages = PatternImages.find({ 'patternId': _id }).fetch();

		// remove all pattern images
		patternImages.forEach((patternImage) => {
			// remove from Amazon S3
			Meteor.call('patternImages.remove', { '_id': patternImage._id }, (error, result) => {
				if (error) {
					throw new Meteor.Error('remove-pattern-S3-error', `Unable to remove pattern image from S3: ${error}`);
				}

				PatternImages.remove({ '_id': patternImage._id }); // remove from local collection
			});
		});

		// remove the pattern itself
		const removed = Patterns.remove({ _id });

		// Delete unused tags
		Meteor.call('tags.removeUnused', pattern.tags);

		// update the user's count of public patterns
		updatePublicPatternsCount(Meteor.userId());

		return removed;
	},
	'pattern.copy': function (_id) {
		check(_id, nonEmptyStringCheck);
		// TO DO write this properly for all pattern types

		const { error, result } = checkUserCanCreatePattern();

		if (error) {
			throw error;
		}

		const pattern = Patterns.findOne({ _id });

		if (!pattern) {
			throw new Meteor.Error('copy-pattern-not-found', 'Unable to copy pattern because the pattern was not found');
		}

		// you can only copy another user's pattern if it is public
		if (pattern.createdBy !== Meteor.userId() && !pattern.isPublic) {
			throw new Meteor.Error('copy-pattern-not-created-by-user', 'Unable to copy pattern because it was not created by the current logged in user');
		}

		// create a new pattern
		const data = {};
		const {
			holes,
			name,
			'numberOfRows': rows,
			'numberOfTablets': tablets,
			patternType,
		} = pattern;
		Object.assign(data, {
			holes,
			name,
			rows,
			tablets,
			patternType,
		});

		data.name += ' (copy)';

		const newPatternId = Meteor.call('pattern.add', data);

		Patterns.update({ '_id': newPatternId },
			{
				'$set': {
					'description': pattern.description,
					'isPublic': false,
					'threading': pattern.threading,
					'orientations': pattern.orientations,
					'palette': pattern.palette,
					'patternDesign': pattern.patternDesign,
					'previewOrentation': pattern.patternDesign,
					'tags': pattern.tags,
					'threadingNotes': pattern.threadingNotes,
					'weavingNotes': pattern.weavingNotes,
					'weftColor': pattern.weftColor,
				},
			});

		return newPatternId;
	},
	'pattern.getPatternCount': function ({
		filterMaxTablets,
		filterMinTablets,
		userId,
	}) {
		// required for pagination
		// must return the same number as the relevant publications function

		// by default, will count all patterns the user can see i.e. their own and all public patterns

		// if userId is specified, will count all patterns owned by that user which this user can see
		check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
		check(filterMinTablets, Match.Maybe(positiveIntegerCheck));
		check(userId, Match.Maybe(String));

		const tabletFilter = getTabletFilter({ filterMaxTablets, filterMinTablets });

		// if a user is specified, make sure they exist
		if (userId) {
			if (!Meteor.users.findOne({ '_id': userId })) {
				throw new Meteor.Error('get-pattern-count-user-not-found', 'Unable to get pattern count because the specified user did not exist');
			}

			// return patterns created by that user
			// which this user can see
			return Patterns.find({
				'$and': [
					getPatternPermissionQuery(),
					{ 'createdBy': userId },
					tabletFilter,
				],
			}).count();
		}

		// return all patterns visible to this user
		return Patterns.find({
			'$and': [
				{
					'$or': [
						{ 'isPublic': { '$eq': true } },
						{ 'createdBy': Meteor.userId() },
					],
				},
				tabletFilter,
			],
		}).count();
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
		const {
			numberOfRows,
			numberOfTablets,
			patternType,
			patternDesign,
			// 'patternDesign': { weavingInstructions },
		} = pattern;

		// to be filled in by data depending on case
		let colorHexValue;
		let colorIndex;
		let fieldName;
		let hole;
		let isPublic;
		let insertNRows;
		let insertRowsAt;
		let insertNTablets;
		let insertTabletsAt;
		let numberOfTurns;
		let orientation;
		let removeNRows;
		let removeRowsAt;
		let row;
		let rowIndex;
		let tablet;
		let tabletIndex;
		let tabletOrientation;
		let fieldValue;

		switch (type) {
			case 'editIsPublic':
				({ isPublic } = data);
				check(isPublic, Boolean);

				// update the pattern
				Patterns.update({ _id }, { '$set': { 'isPublic': isPublic } });

				// update the user's count of public patterns
				updatePublicPatternsCount(Meteor.userId());

				return;

			case 'editWeavingCellDirection':
				({ row, tablet } = data);
				check(row, Match.Integer);
				check(tablet, validTabletsCheck);

				switch (patternType) {
					case 'individual':
						const { weavingInstructions } = patternDesign;

						// change direction of tablet for this row and all followiing rows
						for (let i = row; i < numberOfRows; i += 1) {
							const newDirection = weavingInstructions[i][tablet].direction === 'F' ? 'B' : 'F';
							weavingInstructions[i][tablet].direction = newDirection;
						}

						return Patterns.update({ _id }, { '$set': { 'patternDesign.weavingInstructions': weavingInstructions } });

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
						throw new Meteor.Error('edit-weaving-cell-turns-unknown-pattern-type', `Unable to edit weaving cell turns because the pattern type ${patternType} was not recognised`);
				}

			case 'editWeavingRowDirection':
				({ row } = data);
				check(row, Match.Integer);

				switch (patternType) {
					case 'allTogether':
						const { weavingInstructions } = patternDesign;
						const newDirection = weavingInstructions[row] === 'F' ? 'B' : 'F';

						return Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${row}`]: newDirection } });

					default:
						throw new Meteor.Error('edit-weaving-row-direction-unknown-pattern-type', `Unable to edit weaving row direction because the pattern type ${patternType} was not recognised`);
				}

			case 'editTwillPatternChart':
				({ rowIndex, tabletIndex } = data);
				check(rowIndex, Match.Integer);
				check(tabletIndex, validTabletsCheck);

				switch (patternType) {
					case 'brokenTwill':
						const { twillPatternChart } = patternDesign;
						const chartLength = twillPatternChart.length;
						if (rowIndex > chartLength - 1) {
							throw new Meteor.Error('edit-twill-pattern-chart-unknown-pattern-type', `Unable to edit twill pattern chart because the rowIndex was greater than the number of chart rows`);
						}

						const currentValue = twillPatternChart[rowIndex][tabletIndex];
						const newValue = currentValue === '.' ? 'X' : '.';

						return Patterns.update({ _id }, { '$set': { [`patternDesign.twillPatternChart.${rowIndex}.${tabletIndex}`]: newValue } });

					default:
						throw new Meteor.Error('edit-twill-pattern-chart-unknown-pattern-type', `Unable to edit twill pattern chart because the pattern type ${patternType} was not recognised`);
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

					case 'allTogether':
						const newRows2 = [];

						for (let i = 0; i < insertNRows; i += 1) {
							const newRow = DEFAULT_DIRECTION;

							newRows2.push(newRow);
						}

						const update2 = {};
						update2.$push = {
							'patternDesign.weavingInstructions': {
								'$each': newRows2,
								'$position': insertRowsAt,
							},
						};

						update2.$set = {
							'numberOfRows': numberOfRows + insertNRows,
						};

						return Patterns.update({ _id }, update2);

					default:
						throw new Meteor.Error('add-rows-unknown-pattern-type', `Unable to add rows because the pattern type ${patternType} was not recognised`);
				}

			case 'removeWeavingRows':
				({
					removeNRows,
					removeRowsAt,
				} = data);
				check(_id, nonEmptyStringCheck);
				check(removeNRows, Match.Maybe(Match.Integer));
				check(removeRowsAt, Match.Maybe(Match.Integer));

				if (pattern.numberOfRows <= removeNRows) {
					throw new Meteor.Error('remove-rows-last-row', 'Unable to remove rows because the last row would be removed');
				}

				if (pattern.numberOfRows < removeRowsAt) {
					throw new Meteor.Error('remove-rows-invalid-row', 'Unable to remove row because the row does not exist');
				}

				switch (patternType) {
					case 'individual':
						// an element cannot be removed from an array by index
						// so first we mark each row to remove
						// then use 'pull'
						for (let i = 0; i < removeNRows; i += 1) {
							rowIndex = i + removeRowsAt;

							Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${rowIndex}.${0}.toBeRemoved`]: true } });
						}

						// NOTE if the pull fails, the numberOfRows will then be incorrect
						// however if the following updates don't take place atomically, the client will likely show errors
						const update = {};
						update.$pull = { 'patternDesign.weavingInstructions': { '$elemMatch': { 'toBeRemoved': true } } };
						update.$set = {
							'numberOfRows': pattern.numberOfRows - removeNRows,
						};

						return Patterns.update({ _id }, update);

					case 'allTogether':
						// an element cannot be removed from an array by index
						// so first we mark each row to remove
						// then use 'pull'
						const start = removeRowsAt - removeNRows + 1;

						for (let i = 0; i < removeNRows; i += 1) {
							rowIndex = i + start;

							Patterns.update({ _id }, { '$set': { [`patternDesign.weavingInstructions.${rowIndex}`]: 'toBeRemoved' } });
						}

						// NOTE if the pull fails, the numberOfRows will then be incorrect
						// however if the following updates don't take place atomically, the client will likely show errors
						const update2 = {};
						update2.$pull = { 'patternDesign.weavingInstructions': 'toBeRemoved' };
						update2.$set = {
							'numberOfRows': pattern.numberOfRows - removeNRows,
						};

						Patterns.update({ _id }, update2);
						return;

					default:
						throw new Meteor.Error('remove-row-unknown-pattern-type', `Unable to remove row because the pattern type ${patternType} was not recognised`);
				}

			case 'editThreadingCell':
				({ hole, tablet, colorIndex } = data);

				check(hole, Match.Integer);
				check(tablet, validTabletsCheck);
				check(colorIndex, validPaletteIndexCheck);

				// update the value in the nested arrays
				return Patterns.update({ _id }, { '$set': { [`threading.${hole}.${tablet}`]: colorIndex } });

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
				return Patterns.update(
					{ _id },
					update,
					{ 'bypassCollection2': true },
				); // schema rejects the operation. This may be a bug in Simple Schema; I have logged in issue


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

					case 'allTogether':
						break;

					default:
						throw new Meteor.Error('remove-tablet-unknown-pattern-type', `Unable to remove tablet because the pattern type ${patternType} was not recognised`);
				}

				Patterns.update(
					{ _id },
					update1,
					{ 'bypassCollection2': true },
				);

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

					case 'allTogether':
						break;

					default:
						break;
				}

				return Patterns.update(
					{ _id },
					update2,
					{ 'bypassCollection2': true },
				);
				// schema rejects the operation. This may be a bug in Simple Schema; I have logged in issue

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
				({ colorIndex } = data);

				check(colorIndex, validPaletteIndexCheck);

				if (colorIndex === -1) {
					throw new Meteor.Error('edit-weft-no-empty', 'Unable to edit pattern because empty hole was specified as weft color');
				}

				return Patterns.update({ _id }, { '$set': { 'weftColor': colorIndex } });

			case 'orientation':
				({ tablet, tabletOrientation } = data);
				check(tablet, validTabletsCheck);

				if (tablet >= numberOfTablets) {
					throw new Meteor.Error('edit-pattern-invalid-tablet', 'Unable to edit pattern because an invalid tablet number was specified');
				}

				// update the value in the nested arrays
				return Patterns.update({ _id }, { '$set': { [`orientations.${tablet}`]: tabletOrientation } });

			case 'previewOrientation':
				({ orientation } = data);

				check(orientation, String);
				const values = ALLOWED_PREVIEW_ORIENTATIONS.map((option) => option.value);

				if (values.indexOf(orientation) === -1) {
					throw new Meteor.Error('edit-pattern-preview-orientation-invalid', 'Unable to edit pattern because an invalid preview orientation was specified');
				}

				return Patterns.update({ _id }, { '$set': { 'previewOrientation': orientation } });

			case 'editTextField':
				({ fieldName, fieldValue } = data);
				check(fieldName, nonEmptyStringCheck);

				const optionalFields = [
					'description',
					'threadingNotes',
					'weavingNotes',
				];

				if (optionalFields.indexOf(fieldName) === -1) {
					check(fieldValue, nonEmptyStringCheck);
				} else {
					check(fieldValue, String);
				}

				const update3 = {};
				update3[fieldName] = fieldValue;

				// if the pattern name changes, we must also update nameSort
				if (fieldName === 'name') {
					update3.nameSort = fieldValue.toLowerCase();
				}

				return Patterns.update({ _id }, { '$set': update3 });

			default:
				break;
		}
	},
});
