import { check } from 'meteor/check';
import {
	checkUserCanCreatePattern,
	getTabletFilter,
	nonEmptyStringCheck,
	positiveIntegerCheck,
	setupDoubleFacedThreading,
	setupOrientations,
	setupTwillThreading,
	updatePublicPatternsCountForSet,
	updatePublicPatternsCountForUser,
	updateMultiplePublicSetsCount,
	validDirectionCheck,
	validHolesCheck,
	validRowsCheck,
	validPaletteIndexCheck,
	validPatternTypeCheck,
	validTabletsCheck,
} from '../../imports/server/modules/utils';
import {
	PatternImages,
	PatternPreviews,
	Patterns,
	Sets,
	Tags,
} from '../../imports/modules/collection';
import {
	ALLOWED_PATTERN_TYPES,
	DEFAULT_COLOR,
	DEFAULT_DIRECTION,
	DEFAULT_FREEHAND_CELL,
	DEFAULT_HOLE_HANDEDNESS,
	DEFAULT_NUMBER_OF_TURNS,
	DEFAULT_PALETTE,
	DEFAULT_WEFT_COLOR,
} from '../../imports/modules/parameters';
import {
	getPatternPermissionQuery,
} from '../../imports/modules/permissionQueries';

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
		let threading = new Array(holes);
		for (let i = 0; i < holes; i += 1) {
			threading[i] = new Array(tablets).fill(DEFAULT_COLOR);
		}

		// pattern design is based on patternType
		// and will be used to calculated picks, from which the weaving chart and preview will be drawn
		// 'for individual' pattern, patternDesign is simply picks
		let patternDesign = {};
		const tags = [ALLOWED_PATTERN_TYPES.find((patternTypeDef) => patternTypeDef.name === patternType).tag];

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
				break;

			case 'allTogether':
				// all tablets are turned together each row
				// fill in the weaving instructions as Forward for every row
				for (let i = 0; i < rows; i += 1) {
					weavingInstructions[i] = DEFAULT_DIRECTION;
				}

				patternDesign = { weavingInstructions };
				break;

			case 'doubleFaced':
				// double faced pattern
				// designed on graph paper and converted to weaving chart
				// 4 hole tablets only
				if (holes !== 4) {
					throw new Meteor.Error('add-pattern-invalid-holes', 'Unable to add pattern because the number of holes must be 4 for double faced');
				}

				// even number of rows
				if (rows % 2 !== 0) {
					throw new Meteor.Error('add-pattern-invalid-rows', 'Unable to add pattern because the number of rows must be even for double faced');
				}

				// set up the pattern chart
				// this corresponds to Data in GTT patterns. This is the chart showing the two-colour design.
				const doubleFacedChartRow = new Array(tablets).fill('.');
				const doubleFacedPatternChart = new Array(rows / 2).fill(doubleFacedChartRow);

				patternDesign = {
					doubleFacedPatternChart,
				};

				threading = setupDoubleFacedThreading({
					holes,
					'numberOfTablets': tablets,
				});

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
				// this corresponds to Data in GTT patterns. This is the chart showing the two-colour design and another chart showing reversals of the twill direction.
				// set up a plain chart for each, this will give just background twill
				// charts have an extra row at the end
				// this extra row is not shown in preview or weaving chart but is used to determine the last even row
				const twillChartRow = new Array(tablets).fill('.');
				const twillPatternChart = new Array((rows / 2) + 1).fill(twillChartRow);
				const twillDirectionChangeChart = new Array((rows / 2) + 1).fill(twillChartRow);

				patternDesign = {
					twillDirection,
					twillPatternChart,
					twillDirectionChangeChart,
					'weavingStartRow': 1,
				};

				threading = setupTwillThreading({
					holes,
					'startTablet': 0,
					'numberOfTablets': tablets,
				});

				// broken twill uses the default orientation, same as other patterns (/ or S)
				break;

			case 'freehand':
				// standard threading diagram
				// draw the weaving chart freehand
				const freehandChart = new Array(rows); // construct an empty array to hold the chart cells
				for (let i = 0; i < rows; i += 1) {
					freehandChart[i] = new Array(tablets);

					for (let j = 0; j < tablets; j += 1) {
						freehandChart[i][j] = DEFAULT_FREEHAND_CELL;
					}
				}

				const holeHandedness = DEFAULT_HOLE_HANDEDNESS;

				patternDesign = { freehandChart, holeHandedness };
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
			'createdBy': Meteor.userId(),
			holes,
			'isPublic': false,
			'palette': DEFAULT_PALETTE,
			'previewOrientation': previewOrientation,
			'orientations': setupOrientations({
				patternType,
				tablets,
			}),
			patternDesign,
			patternType,
			threading,
			'tags': [],
			'threadingNotes': '',
			'weavingNotes': '',
			'weftColor': DEFAULT_WEFT_COLOR,
		});

		// set includeInTwist
		if (patternType !== 'freehand') {
			const includeInTwist = new Array(tablets).fill(true);
			Patterns.update({ '_id': patternId }, { '$set': { includeInTwist } });
		}

		// update the user's count of public patterns
		updatePublicPatternsCountForUser(Meteor.userId());

		// add the tags
		tags.forEach((tag) => {
			const existing = Tags.findOne({ 'name': tag });

			if (existing) {
				Meteor.call('tags.assignToDocument', {
					'targetId': patternId,
					'targetType': 'pattern',
					'name': existing.name,
				});
			} else {
				Meteor.call('tags.add', {
					'targetId': patternId,
					'targetType': 'pattern',
					'name': tag,
				});
			}
		});

		return patternId;
	},
	'pattern.newPatternFromData': function ({ patternObj }) {
		// console.log('new from patternObj data', patternObj);
		check(patternObj, Match.ObjectIncluding({
			'description': Match.Maybe(String),
			'holes': positiveIntegerCheck,
			'includeInTwist': Match.Maybe([String]),
			'name': String,
			'numberOfRows': positiveIntegerCheck,
			'numberOfTablets': positiveIntegerCheck,
			'orientations': [String],
			'palette': [Match.OneOf(Number, String)],
			'patternDesign': Object,
			'patternType': String,
			'tags': Match.Maybe([String]),
			'threading': [[Number]],
			'threadingNotes': Match.Maybe(String),
			'weavingNotes': Match.Maybe(String),
			'weftColor': Match.OneOf(Number, String), // number may come in as tring
		}));

		const {
			description,
			holes,
			includeInTwist,
			name,
			numberOfRows,
			numberOfTablets,
			orientations,
			palette,
			patternDesign,
			patternType,
			tags,
			threading,
			threadingNotes,
			weavingNotes,
			weftColor,
		} = patternObj;

		const { error, result } = checkUserCanCreatePattern();

		if (error) {
			throw error;
		}

		// ////////////////////////////
		// check the data

		// pattern type
		check(patternType, validPatternTypeCheck);

		// number of rows
		check(numberOfRows, validRowsCheck);

		// number of tablets
		if (threading[0].length !== numberOfTablets) {
			throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of tablets is invalid');
		}

		check(numberOfTablets, validTabletsCheck);

		// number of holes
		if (threading.length !== holes) {
			throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of holes is invalid');
		}

		check(holes, validHolesCheck);

		// orientations
		if (orientations.length !== numberOfTablets) {
			throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the orientations array is invalid');
		}

		// palette
		if (palette.length !== DEFAULT_PALETTE.length) {
			throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the palette is invalid');
		}

		// weft colour
		check(weftColor, validPaletteIndexCheck);
		const {
			doubleFacedPatternChart, // double faced
			freehandChart, // freehand
			twillDirection, // broken twill
			twillPatternChart, // broken twill
			twillDirectionChangeChart, // broken twill
			weavingInstructions, // individual and freehand
			weavingStartRow, // broken twill
		} = patternDesign;

		// pattern design
		switch (patternType) {
			case 'individual':
				if (weavingInstructions.length !== numberOfRows) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of rows does not match the pattern design');
				}

				if (weavingInstructions[0].length !== numberOfTablets) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of tablets does not match the pattern design');
				}

				// check each pick is valid
				for (let i = 0; i < numberOfRows; i += 1) {
					for (let j = 0; j < numberOfTablets; j += 1) {
						const { direction, numberOfTurns } = weavingInstructions[i][j];
						check(direction, validDirectionCheck);
						check(numberOfTurns, Match.Integer);
						if (numberOfTurns >= holes || numberOfTurns < 0) {
							throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of turns is invalid');
						}
					}
				}
				break;

			case 'allTogether':
				if (weavingInstructions.length !== numberOfRows) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of rows does not match the pattern design');
				}

				weavingInstructions.forEach((value) => check(value, validDirectionCheck));
				break;

			case 'doubleFaced':
				// double faced chart should have one row per two weaving rows
				if (numberOfRows !== doubleFacedPatternChart.length * 2) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of rows is invalid');
				}

				if (doubleFacedPatternChart[0].length !== numberOfTablets) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the double faced pattern chart does not have the correct number of tablets');
				}

				// double faced pattern chart entries should be . or X
				for (let i = 0; i < doubleFacedPatternChart.length; i += 1) {
					for (let j = 0; j < numberOfTablets; j += 1) {
						if (['.', 'X'].indexOf(doubleFacedPatternChart[i][j]) === -1) {
							throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the pattern chart contains an invalid value');
						}
					}
				}

				break;

			case 'brokenTwill':
				// twill charts should have one row per two weaving rows, plus one extra
				if (numberOfRows !== (twillPatternChart.length - 1) * 2) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of rows is invalid');
				}

				if (twillDirectionChangeChart.length !== twillPatternChart.length) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the twill charts are not the same length');
				}

				if (twillPatternChart[0].length !== numberOfTablets
					|| twillDirectionChangeChart[0].length !== numberOfTablets) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because a twill chart does not have the correct number of tablets');
				}

				// twill chart entries should be . or X
				for (let i = 0; i < twillPatternChart.length; i += 1) {
					for (let j = 0; j < numberOfTablets; j += 1) {
						if (['.', 'X'].indexOf(twillPatternChart[i][j]) === -1) {
							throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the pattern chart contains an invalid value');
						}

						if (['.', 'X'].indexOf(twillDirectionChangeChart[i][j]) === -1) {
							throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the direction change chart contains an invalid value');
						}
					}
				}

				if (['S', 'Z'].indexOf(twillDirection)) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the twill direction is invalid');
				}

				check(weavingStartRow, positiveIntegerCheck);

				if (weavingStartRow >= numberOfRows) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the weaving start row is invalid');
				}
				break;

			case 'freehand':
				if (freehandChart.length !== numberOfRows) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of rows does not match the pattern design');
				}

				if (freehandChart[0].length !== numberOfTablets) {
					throw new Meteor.Error('new-pattern-from-data-invalid-data', 'Unable to create new pattern from data because the number of tablets does not match the pattern design');
				}

				// check each pick is valid
				for (let i = 0; i < numberOfRows; i += 1) {
					for (let j = 0; j < numberOfTablets; j += 1) {
						const { direction, threadColor, threadShape } = freehandChart[i][j];
						check(direction, validDirectionCheck);
						check(threadColor, validPaletteIndexCheck);
						check(threadShape, String); // not bothering to check the value
					}
				}

				break;

			default:
				throw new Meteor.Error('new-pattern-from-datainvalid-data', 'Unable to create new pattern from data because the pattern type is unrecognised');
		}

		// create a new blank pattern
		const patternId = Meteor.call('pattern.add', {
			holes,
			name,
			'rows': numberOfRows,
			'tablets': numberOfTablets,
			patternType,
			twillDirection,
		});

		// set the pattern details
		const update = {
			'$set': {
				description,
				orientations,
				palette,
				patternDesign,
				threading,
				weftColor,
			},
		};

		if (threadingNotes) {
			update.$set.threadingNotes = threadingNotes;
		}

		if (threadingNotes) {
			update.$set.weavingNotes = weavingNotes;
		}

		if (includeInTwist) {
			update.$set.includeInTwist = includeInTwist;
		}

		Patterns.update({ '_id': patternId }, update);

		if (tags) {
			// add each tag
			tags.forEach((tagName) => {
				Meteor.call('tags.ensureExistsAndAssignToDocument', {
					'targetId': patternId,
					'targetType': 'pattern',
					'name': tagName,
				});
			});
		}

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

		// find all sets that contain this pattern
		const sets = Sets.find({ '_id': { '$in': pattern.sets } }).fetch();

		if (pattern.isPublic) {
			sets.forEach((set) => {
				// remove the pattern from the set's patterns array
				Sets.update(
					{ '_id': set._id },
					{ '$pull': { 'patterns': _id } },
				);

				// update the set's count of public pattern
				updatePublicPatternsCountForSet(set._id);
			});
		}

		// delete any of those sets which now have no patterns
		Sets.remove(
			{
				'$and': [
					{ '_id': { '$in': pattern.sets } },
					{ 'patterns': { '$size': 0 } },
				],
			},
		);

		updateMultiplePublicSetsCount(pattern.sets);

		// remove the pattern itself
		const removed = Patterns.remove({ _id });

		// Delete unused tags
		Meteor.call('tags.removeUnused', pattern.tags);

		// update the user's count of public patterns
		updatePublicPatternsCountForUser(Meteor.userId());

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

		if (patternType === 'brokenTwill') {
			data.twillDirection = pattern.patternDesign.twillDirection;
		}

		const newPatternId = Meteor.call('pattern.add', data);

		Patterns.update({ '_id': newPatternId },
			{
				'$set': {
					'description': pattern.description,
					'includeInTwist': pattern.includeInTwist,
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
});
