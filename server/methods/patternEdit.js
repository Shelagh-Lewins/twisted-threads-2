// the pattern.edit method is so large it warrants its own file

import { check } from 'meteor/check';
import {
	nonEmptyStringCheck,
	positiveIntegerCheck,
	updateMultiplePublicSetsCount,
	updatePublicPatternsCountForSet,
	updatePublicPatternsCountForUser,
	validRowsCheck,
	validPaletteIndexCheck,
	validTabletsCheck,
	validTwillChartCheck,
} from '../../imports/server/modules/utils';
import {
	Patterns,
	Sets,
} from '../../imports/modules/collection';
import {
	ALLOWED_PREVIEW_ORIENTATIONS,
	BROKEN_TWILL_BACKGROUND,
	BROKEN_TWILL_FOREGROUND,
	BROKEN_TWILL_THREADING,
	DEFAULT_DIRECTION,
	DEFAULT_FREEHAND_CELL,
	DEFAULT_NUMBER_OF_TURNS,
	DEFAULT_ORIENTATION,
	DOUBLE_FACED_FOREGROUND,
	DOUBLE_FACED_BACKGROUND,
	DOUBLE_FACED_THREADING,
	MAX_ROWS,
	MAX_TABLETS,
} from '../../imports/modules/parameters';

import getColorsForRolesByTablet from '../../imports/modules/getColorsForRolesByTablet';

const tinycolor = require('tinycolor2');

// the switch block in editPattern would be very messy otherwise
/* eslint-disable no-case-declarations */

Meteor.methods({
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
			holes,
			numberOfRows,
			numberOfTablets,
			patternType,
			patternDesign,
		} = pattern;

		// to be filled in by data depending on case
		let chartCell;
		let colorHexValue;
		let colorIndex;
		let fieldName;
		let fieldValue;
		let holesToSet;
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
		let threading;
		let threadColor;
		let threadShape;
		let twillChart;
		let weavingStartRow;

		const update = {}; // builds the Mongo update

		switch (type) {
			case 'editIsPublic':
				({ isPublic } = data);
				check(isPublic, Boolean);

				// only verified users can publish patterns
				if (!Roles.userIsInRole(Meteor.userId(), 'verified')) {
					throw new Meteor.Error('edit-pattern-not-verified', 'Unable to make the pattern public or private because the user\'s email address is not verified');
				}

				// update the pattern
				Patterns.update({ _id }, { '$set': { 'isPublic': isPublic } });

				// find all sets that contain this pattern
				const sets = Sets.find({ '_id': { '$in': pattern.sets } }).fetch();
				sets.forEach((set) => {
					// update the set's count of public pattern
					updatePublicPatternsCountForSet(set._id);
				});

				// update the user's count of public patterns
				updatePublicPatternsCountForUser(Meteor.userId());

				// for each set to which the pattern belongs, update the owner's count of public sets
				updateMultiplePublicSetsCount(pattern.sets);

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
						throw new Meteor.Error('edit-weaving-row-direction-unknown-pattern-type', `Unable to edit weaving is not allTogether`);
				}

			case 'editDoubleFacedChart':
				({ rowIndex, tabletIndex } = data);
				check(rowIndex, Match.Integer);
				check(tabletIndex, validTabletsCheck);

				switch (patternType) {
					case 'doubleFaced':
						const chartToEdit = patternDesign.doubleFacedPatternChart;
						const chartLength = chartToEdit.length;
						if (rowIndex > chartLength - 1) {
							throw new Meteor.Error('edit-double-faced-pattern-chart-invalid-rowIndex', `Unable to edit double faced pattern chart because the rowIndex was greater than the number of chart rows`);
						}

						const currentValue = chartToEdit[rowIndex][tabletIndex];
						const newValue = currentValue === '.' ? 'X' : '.';

						return Patterns.update({ _id }, { '$set': { [`patternDesign.doubleFacedPatternChart.${rowIndex}.${tabletIndex}`]: newValue } });

					default:
						throw new Meteor.Error('edit-double-faced-chart-unknown-pattern-type', `Unable to edit double faced pattern chart because the pattern type ${patternType} is not doubleFaced`);
				}

			case 'editTwillChart':
				({ rowIndex, tabletIndex, twillChart } = data);
				check(rowIndex, Match.Integer);
				check(tabletIndex, validTabletsCheck);
				check(twillChart, validTwillChartCheck);

				switch (patternType) {
					case 'brokenTwill':
						const chartToEdit = patternDesign[twillChart];
						const chartLength = chartToEdit.length;
						if (rowIndex > chartLength - 1) {
							throw new Meteor.Error('edit-twill-pattern-chart-invalid-rowIndex', `Unable to edit twill pattern chart because the rowIndex was greater than the number of chart rows`);
						}

						if (tabletIndex % 2 === 1 && rowIndex === 0) {
							throw new Meteor.Error('edit-twill-pattern-chart-invalid-chart-cell', `Unable to edit twill pattern chart because the first row of an even tablet cannot be edited`);
						}

						const currentValue = chartToEdit[rowIndex][tabletIndex];
						const newValue = currentValue === '.' ? 'X' : '.';

						return Patterns.update({ _id }, { '$set': { [`patternDesign.${twillChart}.${rowIndex}.${tabletIndex}`]: newValue } });

					default:
						throw new Meteor.Error('edit-twill-pattern-chart-unknown-pattern-type', `Unable to edit twill pattern chart because the pattern type ${patternType} is not brokenTwill`);
				}

			case 'editTwillWeavingStartRow':
				({ weavingStartRow } = data);
				check(weavingStartRow, validRowsCheck);

				switch (patternType) {
					case 'brokenTwill':
						if (weavingStartRow >= numberOfRows) {
							throw new Meteor.Error('edit-twill-weaving-start-row-invalid-rowIndex', `Unable to edit twill pattern chart because the weaving start row must be less than the number of rows`);
						}

						if (weavingStartRow % 2 !== 1) {
							throw new Meteor.Error('edit-twill-weaving-start-row-invalid-rowIndex', `Unable to edit twill pattern chart because the weaving start row must be an odd number`);
						}

						return Patterns.update({ _id }, { '$set': { 'patternDesign.weavingStartRow': weavingStartRow } });

					default:
						throw new Meteor.Error('edit-twill-weaving-start-row-unknown-pattern-type', `Unable to edit twill weaving start row because the pattern type ${patternType} is not brokenTwill`);
				}

			case 'editFreehandCellThread':
				({
					row,
					tablet,
					threadColor,
					threadShape,
				} = data);
				check(row, Match.Integer);
				check(tablet, validTabletsCheck);
				check(threadColor, validPaletteIndexCheck);
				check(threadShape, String);

				switch (patternType) {
					case 'freehand':
						return Patterns.update({ _id }, {
							'$set': {
								[`patternDesign.freehandChart.${row}.${tablet}.threadColor`]: threadColor,
								[`patternDesign.freehandChart.${row}.${tablet}.threadShape`]: threadShape,
							},
						});

					default:
						throw new Meteor.Error('edit-freehand-cell-thread-unknown-pattern-type', `Unable to edit freehand cell thread because the pattern type ${patternType} is not freehand`);
				}

			case 'editFreehandCellDirection':
				({
					row,
					tablet,
				} = data);
				check(row, Match.Integer);
				check(tablet, validTabletsCheck);

				switch (patternType) {
					case 'freehand':
						// toggle cell direction
						const cell = patternDesign.freehandChart[row][tablet];
						const direction = cell.direction === 'F' ? 'B' : 'F';

						return Patterns.update({ _id }, {
							'$set': {
								[`patternDesign.freehandChart.${row}.${tablet}.direction`]: direction,
							},
						});

					default:
						throw new Meteor.Error('edit-freehand-cell-direction-unknown-pattern-type', `Unable to edit freehand cell direction because the pattern type ${patternType} is not freehand`);
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

				update.$set = {
					'numberOfRows': numberOfRows + insertNRows,
				};

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

						update.$push = {
							'patternDesign.weavingInstructions': {
								'$each': newRows,
								'$position': insertRowsAt,
							},
						};
						break;

					case 'allTogether':
						const newRows2 = [];

						for (let i = 0; i < insertNRows; i += 1) {
							const newRow = DEFAULT_DIRECTION;

							newRows2.push(newRow);
						}

						update.$push = {
							'patternDesign.weavingInstructions': {
								'$each': newRows2,
								'$position': insertRowsAt,
							},
						};
						break;

					case 'doubleFaced':
						if (insertNRows % 2 !== 0) {
							throw new Meteor.Error('add-rows-invalid-number', 'Unable to add rows because the number of rows must be even for double faced');
						}

						if (insertRowsAt % 2 !== 0) {
							throw new Meteor.Error('add-rows-invalid-number', 'Unable to add rows because the new rows must be inserted at an odd row for double faced');
						}
						const newDoubleFacedRow = new Array(numberOfTablets);
						newDoubleFacedRow.fill('.');
						const newDoubleFacedRows = [];

						for (let i = 0; i < insertNRows / 2; i += 1) {
							newDoubleFacedRows.push(newDoubleFacedRow);
						}

						const doubleFacedChartPosition = ((insertRowsAt) / 2);

						update.$push = {
							'patternDesign.doubleFacedPatternChart': {
								'$each': newDoubleFacedRows,
								'$position': doubleFacedChartPosition,
							},
						};

						break;

					case 'brokenTwill':
						if (insertNRows % 2 !== 0) {
							throw new Meteor.Error('add-rows-invalid-number', 'Unable to add rows because the number of rows must be even for broken twill');
						}

						if (insertRowsAt % 2 !== 0) {
							throw new Meteor.Error('add-rows-invalid-number', 'Unable to add rows because the new rows must be inserted at an odd row for broken twill');
						}
						const newDesignRow = new Array(numberOfTablets);
						newDesignRow.fill('.');
						const newDesignRows = [];

						for (let i = 0; i < insertNRows / 2; i += 1) {
							newDesignRows.push(newDesignRow);
						}

						const chartPosition = ((insertRowsAt) / 2);

						update.$push = {
							'patternDesign.twillDirectionChangeChart': {
								'$each': newDesignRows,
								'$position': chartPosition,
							},
							'patternDesign.twillPatternChart': {
								'$each': newDesignRows,
								'$position': chartPosition,
							},
						};

						break;

					case 'freehand':
						({ chartCell } = data);

						check(chartCell, Match.ObjectIncluding({
							'direction': String,
							'threadColor': Number,
							'threadShape': String,
						}));
						const newChartRow = new Array(numberOfTablets);
						newChartRow.fill(chartCell);
						const newChartRows = [];

						for (let i = 0; i < insertNRows; i += 1) {
							newChartRows.push(newChartRow);
						}

						update.$push = {
							'patternDesign.freehandChart': {
								'$each': newChartRows,
								'$position': insertRowsAt,
							},
						};
						break;

					default:
						throw new Meteor.Error('add-rows-unknown-pattern-type', `Unable to add rows because the pattern type ${patternType} was not recognised`);
				}

				return Patterns.update({ _id }, update);

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

				update.$set = {
					'numberOfRows': numberOfRows - removeNRows,
				};

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

						update.$pull = { 'patternDesign.weavingInstructions': { '$elemMatch': { 'toBeRemoved': true } } };

						break;

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

						update.$pull = { 'patternDesign.weavingInstructions': 'toBeRemoved' };

						break;

					case 'doubleFaced':
						if (removeNRows % 2 !== 0) {
							throw new Meteor.Error('remove-rows-invalid-number', 'Unable to remove rows because the number of rows must be even for double faced');
						}

						if (removeRowsAt % 2 !== 0) {
							throw new Meteor.Error('add-rows-invalid-number', 'Unable to remove rows because the rows must be removed at an even row for double faced');
						}

						for (let i = 0; i < removeNRows / 2; i += 1) {
							rowIndex = i + (removeRowsAt / 2);

							Patterns.update({ _id }, {
								'$set': {
									[`patternDesign.doubleFacedPatternChart.${rowIndex}`]: 'toBeRemoved',
								},
							});
						}

						update.$pull = {
							'patternDesign.doubleFacedPatternChart': 'toBeRemoved',
						};

						break;

					case 'brokenTwill':
						if (removeNRows % 2 !== 0) {
							throw new Meteor.Error('remove-rows-invalid-number', 'Unable to remove rows because the number of rows must be even for broken twill');
						}

						if (removeRowsAt % 2 !== 0) {
							throw new Meteor.Error('add-rows-invalid-number', 'Unable to remove rows because the rows must be removed at an even row for broken twill');
						}

						for (let i = 0; i < removeNRows / 2; i += 1) {
							rowIndex = i + (removeRowsAt / 2);

							Patterns.update({ _id }, {
								'$set': {
									[`patternDesign.twillDirectionChangeChart.${rowIndex}`]: 'toBeRemoved',
									[`patternDesign.twillPatternChart.${rowIndex}`]: 'toBeRemoved',
								},
							});
						}

						// odd rows of twill charts cannot start with 'X'
						// what will be the new start row?
						let newFirstRow = 0;
						if (removeRowsAt === 0) {
							newFirstRow = removeNRows / 2;
						}

						for (let i = 1; i < numberOfTablets; i += 2) {
							if (pattern.patternDesign.twillDirectionChangeChart[newFirstRow][i] === 'X') {
								Patterns.update({ _id }, {
									'$set': {
										[`patternDesign.twillDirectionChangeChart.${newFirstRow}.${i}`]: '.',
									},
								});
							}

							if (pattern.patternDesign.twillPatternChart[newFirstRow][i] === 'X') {
								Patterns.update({ _id }, {
									'$set': {
										[`patternDesign.twillPatternChart.${newFirstRow}.${i}`]: '.',
									},
								});
							}
						}

						update.$pull = {
							'patternDesign.twillDirectionChangeChart': 'toBeRemoved',
							'patternDesign.twillPatternChart': 'toBeRemoved',
						};

						break;

					case 'freehand':
						for (let i = 0; i < removeNRows; i += 1) {
							rowIndex = i + removeRowsAt;

							Patterns.update({ _id }, { '$set': { [`patternDesign.freehandChart.${rowIndex}.${0}.toBeRemoved`]: true } });
						}

						update.$pull = { 'patternDesign.freehandChart': { '$elemMatch': { 'toBeRemoved': true } } };

						break;

					default:
						throw new Meteor.Error('remove-row-unknown-pattern-type', `Unable to remove row because the pattern type ${patternType} was not recognised`);
				}

				return Patterns.update({ _id }, update);

			case 'editThreadingCell':
				// broken twill sets two holes at once
				// other pattern types only set the one the user clicked
				({ holesToSet, tablet, colorIndex } = data);

				check(holesToSet, [Match.Integer]);
				check(tablet, validTabletsCheck);
				check(colorIndex, validPaletteIndexCheck);

				// update the value in the nested arrays
				holesToSet.forEach((holeIndex) => {
					check(holeIndex, positiveIntegerCheck);
					Patterns.update({ _id }, { '$set': { [`threading.${holeIndex}.${tablet}`]: colorIndex } });
				});

				return;

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

				// all pattern types have the new number of tablets
				const newNumberOfTablets = numberOfTablets + insertNTablets;

				update.$set = {
					'numberOfTablets': newNumberOfTablets,
				};

				// inesrt new tablet orientations
				const newOrientations = [];
				let orientationPosition = insertTabletsAt;

				for (let j = 0; j < insertNTablets; j += 1) {
					if (patternType === 'doubleFaced') {
						// double faced tablets alternate
						// so put them at the end
						const newOrientation = (numberOfTablets + j) % 2 === 0 ? '\\' : '/';
						newOrientations.push(newOrientation);
						orientationPosition = numberOfTablets;
					} else {
						// all other patterns use default orientation
						newOrientations.push(DEFAULT_ORIENTATION);
					}
				}

				update.$push = {
					'orientations': {
						'$each': newOrientations,
						'$position': orientationPosition,
					},
				};

				switch (patternType) {
					// all these pattern types use the same threading chart
					case 'individual':
					case 'allTogether':
					case 'freehand':

						// new tablets to be added to each threading row
						const newTabletsForThreading = [];

						for (let j = 0; j < insertNTablets; j += 1) {
							newTabletsForThreading.push(colorIndex);
						}

						update.$push['threading.$[]'] = {
							'$each': newTabletsForThreading,
							'$position': insertTabletsAt,
						};

						break;

					default:
						break;
				}

				// updates for weaving and threading depend on pattern type
				switch (patternType) {
					case 'individual':
						// new picks to be added to each weaving row
						const newWeaving = [];

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

					case 'doubleFaced':
						// extend the threading chart
						({ threading } = pattern);

						const newDoubleFacedThreading = [...threading];

						// insert the new tablets
						for (let i = 0; i < holes; i += 1) {
							newDoubleFacedThreading[i] = [...newDoubleFacedThreading[i]];

							for (let j = insertTabletsAt; j < insertTabletsAt + insertNTablets; j += 1) {
								const colorRole = DOUBLE_FACED_THREADING[i];

								newDoubleFacedThreading[i].splice(j, 0, colorRole === 'F' ? DOUBLE_FACED_FOREGROUND : DOUBLE_FACED_BACKGROUND);
							}
						}

						update.$set.threading = newDoubleFacedThreading;

						// insert new tablets into pattern design charts
						const newDoubleFacedChartCells = [];

						for (let j = 0; j < insertNTablets; j += 1) {
							newDoubleFacedChartCells.push('.');
						}

						update.$push['patternDesign.doubleFacedPatternChart.$[]'] = {
							'$each': newDoubleFacedChartCells,
							'$position': insertTabletsAt,
						};

						break;

					case 'brokenTwill':
						// extend the threading chart
						// it is probably as quick, and certainly easier, to calculate an entirely new threading chart and set it as one operation
						// because subsequent tablets are affected
						({ threading } = pattern);

						// find the foreground / background colour for each tablet from the change onwards
						const colorsForRolesByTablet = getColorsForRolesByTablet({
							holes,
							numberOfTablets,
							'startAt': insertTabletsAt,
							threading,
							'threadingStructure': 'byHole',
						});

						const newThreading = [...threading];

						// insert the new tablets
						for (let i = 0; i < holes; i += 1) {
							newThreading[i] = [...newThreading[i]];

							for (let j = insertTabletsAt; j < insertTabletsAt + insertNTablets; j += 1) {
								const colorRole = BROKEN_TWILL_THREADING[i][j % holes];

								newThreading[i].splice(j, 0, colorRole === 'F' ? BROKEN_TWILL_FOREGROUND : BROKEN_TWILL_BACKGROUND);
							}
						}

						// reset the threading of the subsequence tablets
						for (let i = 0; i < holes; i += 1) {
							for (let j = 0; j < colorsForRolesByTablet.length; j += 1) {
								const { B, F } = colorsForRolesByTablet[j];
								const changedTabletIndex = j + insertTabletsAt + insertNTablets;
								const colorRole = BROKEN_TWILL_THREADING[i][changedTabletIndex % holes];

								newThreading[i][changedTabletIndex] = colorRole === 'F' ? F : B;
							}
						}

						update.$set.threading = newThreading;

						// insert new tablets into pattern design charts
						const newChartCells = [];

						for (let j = 0; j < insertNTablets; j += 1) {
							newChartCells.push('.');
						}

						update.$push['patternDesign.twillDirectionChangeChart.$[]'] = {
							'$each': newChartCells,
							'$position': insertTabletsAt,
						};

						update.$push['patternDesign.twillPatternChart.$[]'] = {
							'$each': newChartCells,
							'$position': insertTabletsAt,
						};

						break;

					case 'freehand':
						// new cells to be added to each chart row
						const newFreehandChartCells = [];
						const newChartCell = DEFAULT_FREEHAND_CELL;
						newChartCell.threadColor = colorIndex;

						for (let j = 0; j < insertNTablets; j += 1) {
							newFreehandChartCells.push(newChartCell);
						}

						update.$push['patternDesign.freehandChart.$[]'] = {
							'$each': newFreehandChartCells,
							'$position': insertTabletsAt,
						};

						break;

					default:
						break;
				}

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
				// so first we mark the element to remove
				// then use 'pull'

				// double faced tablets alternate
				// otherwise just remove the indicated tablet
				const orientationToRemove = patternType === 'doubleFaced' ? (numberOfTablets - 1) : tablet;
				update.$set = {
					[`orientations.${orientationToRemove}`]: 'toBeRemoved',
				};
				// !warning! don't overwrite the update object

				// updates for weaving depend on pattern type
				switch (patternType) {
					case 'individual':
					case 'allTogether':
					case 'freehand':
						// remove the specified tablet
						update.$set[`threading.$[].${tablet}`] = 'toBeRemoved';

						if (patternType === 'individual') {
							update.$set[`patternDesign.weavingInstructions.$[].${tablet}.toBeRemoved`] = true;
						}

						if (patternType === 'freehand') {
							update.$set[`patternDesign.freehandChart.$[].${tablet}`] = 'toBeRemoved';
						}
						break;

					case 'doubleFaced':
						// remove the last tablet
						update.$set[`threading.$[].${tablet}`] = 'toBeRemoved';

						// remove the specified tablet
						update.$set[`patternDesign.doubleFacedPatternChart.$[].${tablet}`] = 'toBeRemoved';
						break;

					case 'brokenTwill':
						update.$set[`patternDesign.twillDirectionChangeChart.$[].${tablet}`] = 'toBeRemoved';
						update.$set[`patternDesign.twillPatternChart.$[].${tablet}`] = 'toBeRemoved';
						break;

					default:
						throw new Meteor.Error('remove-tablet-unknown-pattern-type', `Unable to remove tablet because the pattern type ${patternType} was not recognised`);
				}

				Patterns.update(
					{ _id },
					update,
					{ 'bypassCollection2': true },
				);

				const update2 = {};

				// update for orientation is the same for all pattern types
				update2.$pull = {
					'orientations': 'toBeRemoved',
				};

				update2.$set = {
					'numberOfTablets': pattern.numberOfTablets - 1,
				};

				switch (patternType) {
					case 'individual':
					case 'allTogether':
					case 'freehand':
					case 'doubleFaced':
						update2.$pull['threading.$[]'] = 'toBeRemoved';
						break;

					default:
						break;
				}

				switch (patternType) {
					case 'individual':
						// remove tablets from each weaving row
						update2.$pull['patternDesign.weavingInstructions.$[]'] = { 'toBeRemoved': true };
						break;

					case 'doubleFaced':
					// remove tablets from each chart row
						update2.$pull['patternDesign.doubleFacedPatternChart.$[]'] = 'toBeRemoved';
						break;

					case 'brokenTwill':
						// shorten and recalculate the threading chart
						// it is probably as quick, and certainly easier, to calculate an entirely new threading chart and set it as one operation
						// because subsequent tablets are affected
						({ threading } = pattern);

						// find the foreground / background colour for each tablet from the change onwards
						const colorsForRolesByTablet = getColorsForRolesByTablet({
							holes,
							numberOfTablets,
							'startAt': tablet + 1,
							threading,
							'threadingStructure': 'byHole',
						});

						const newThreading = [...threading];

						// remove the tablet
						for (let i = 0; i < holes; i += 1) {
							newThreading[i] = [...threading[i]];
							// shorten the row
							newThreading[i].pop();

							// reset the threading of the subsequence tablets
							for (let j = 0; j < colorsForRolesByTablet.length; j += 1) {
								const { B, F } = colorsForRolesByTablet[j];
								const changedTabletIndex = j + tablet;
								const colorRole = BROKEN_TWILL_THREADING[i][changedTabletIndex % holes];

								newThreading[i][changedTabletIndex] = colorRole === 'F' ? F : B;
							}
						}

						update2.$set.threading = newThreading;

						// remove tablets from each pattern design chart
						update2.$pull['patternDesign.twillDirectionChangeChart.$[]'] = 'toBeRemoved';
						update2.$pull['patternDesign.twillPatternChart.$[]'] = 'toBeRemoved';
						break;

					case 'freehand':
						update2.$pull['patternDesign.freehandChart.$[]'] = 'toBeRemoved';
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

			case 'holeHandedness':
				if (patternType !== 'freehand') {
					throw new Meteor.Error('edit-pattern-holehandedness', 'Unable to edit holehandedness because the pattern is not of type freehand');
				}

				// toggle handedness
				const newHandedness = pattern.patternDesign.holeHandedness === 'anticlockwise' ? 'clockwise' : 'anticlockwise';
				return Patterns.update({ _id }, { '$set': { 'patternDesign.holeHandedness': newHandedness } });

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

				if (patternType === 'doubleFaced') {
					throw new Meteor.Error('edit-orientation-broken-twill', 'Unable to edit orientation because the pattern type is double faced');
				}

				if (patternType === 'brokenTwill') {
					throw new Meteor.Error('edit-orientation-broken-twill', 'Unable to edit orientation because the pattern type is broken twill');
				}

				if (tablet >= numberOfTablets) {
					throw new Meteor.Error('edit-orientation-invalid-tablet', 'Unable to edit orientation because an invalid tablet number was specified');
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

				update[fieldName] = fieldValue;

				// if the pattern name changes, we must also update nameSort
				if (fieldName === 'name') {
					update.nameSort = fieldValue.toLowerCase();
				}

				return Patterns.update({ _id }, { '$set': update });

			default:
				throw new Meteor.Error('edit-pattern-unknown-type', 'Unable to edit pattern because the type was unknown');
		}
	},
});
