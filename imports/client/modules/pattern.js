// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state
// import * as svg from 'save-svg-as-png';
import { createSelector } from 'reselect';
// import createCachedSelector from 're-reselect';
import { logErrors, clearErrors } from './errors';
import {
	calculatePicksForTablet,
	findPatternTwist,
	getPicksByTablet,
	getThreadingByTablet,
	getWeavingInstructionsByTablet,
	reCalculatePicksForTablet,
} from './weavingUtils';
import {
	DEFAULT_DIRECTION,
	DEFAULT_NUMBER_OF_TURNS,
	DEFAULT_ORIENTATION,
	MAX_TABLETS,
} from '../../modules/parameters';

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const SET_PATTERN_COUNT = 'SET_PATTERN_COUNT';
export const SET_PATTERN_COUNT_USERID = 'SET_PATTERN_COUNT_USERID';
export const SET_ISLOADING = 'SET_ISLOADING';
export const SET_PATTERN_DATA = 'SET_PATTERN_DATA';

// edit pattern charts
export const SET_IS_EDITING_WEAVING = 'SET_IS_EDITING_WEAVING';
export const SET_IS_EDITING_THREADING = 'SET_IS_EDITING_THREADING';

// 'individual' patternType
export const UPDATE_WEAVING_CELL_DIRECTION = 'UPDATE_WEAVING_CELL_DIRECTION';
export const UPDATE_WEAVING_CELL_TURNS = 'UPDATE_WEAVING_CELL_TURNS';

// 'allTogether' patternType
export const UPDATE_WEAVING_ROW_DIRECTION = 'UPDATE_WEAVING_ROW_DIRECTION';

// general patternType
export const UPDATE_THREADING_CELL = 'UPDATE_THREADING_CELL';
export const UPDATE_ORIENTATION = 'UPDATE_ORIENTATION';
export const UPDATE_ADD_WEAVING_ROWS = 'UPDATE_ADD_WEAVING_ROWS';
export const UPDATE_REMOVE_WEAVING_ROW = 'UPDATE_REMOVE_WEAVING_ROW';
export const UPDATE_ADD_TABLETS = 'UPDATE_ADD_TABLETS';
export const UPDATE_REMOVE_TABLET = 'UPDATE_REMOVE_TABLET';

export const SET_FILTER_MAX_TABLETS = 'SET_FILTER_MAX_TABLETS';
export const SET_FILTER_MIN_TABLETS = 'SET_FILTER_MIN_TABLETS';
export const REMOVE_TABLET_FILTER = 'REMOVE_TABLET_FILTER';

// ////////////////////////////
// Actions that change the Store

// used in pagination
export function setPatternCount(patternCount) {
	return {
		'type': 'SET_PATTERN_COUNT',
		'payload': patternCount,
	};
}

export const getPatternCount = () => (dispatch, getState) => {
	const {
		filterMaxTablets,
		filterMinTablets,
		patternCountUserId,
	} = getState().pattern;
// console.log('2 *** about to call');
	Meteor.call('pattern.getPatternCount', {
		filterMaxTablets,
		filterMinTablets,
		'userId': patternCountUserId,
	}, (error, result) => {
		dispatch(setPatternCount(result));
	});
};

// should the pattern count only include patterns belonging to a particular user?
export function setPatternCountUserId(userId) {
	return {
		'type': 'SET_PATTERN_COUNT_USERID',
		'payload': userId,
	};
}

export const changePage = (newPageNumber, history) => (dispatch) => {
	const url = `?page=${newPageNumber + 1}`;

	history.push(url);

	dispatch(getPatternCount());
};

// waiting for data subscription to be ready
export function setIsLoading(isLoading) {
	return {
		'type': 'SET_ISLOADING',
		'payload': isLoading,
	};
}

export function setIsEditingWeaving(isEditingWeaving) {
	return {
		'type': 'SET_IS_EDITING_WEAVING',
		'payload': isEditingWeaving,
	};
}

export function setIsEditingThreading(isEditingThreading) {
	return {
		'type': 'SET_IS_EDITING_THREADING',
		'payload': isEditingThreading,
	};
}

// save pattern data in store for calculating charts
export function setPatternData({
	picks,
	patternObj,
	threadingByTablet,
	weavingInstructionsByTablet,
}) {
	const {
		_id,
		holes,
		numberOfRows,
		numberOfTablets,
		orientations,
		palette,
		patternDesign,
	} = patternObj;

	return {
		'type': 'SET_PATTERN_DATA',
		'payload': {
			_id,
			picks,
			holes,
			numberOfRows,
			numberOfTablets,
			orientations,
			palette,
			patternDesign,
			threadingByTablet,
			weavingInstructionsByTablet,
		},
	};
}

// calculate weaving picks from pattern data
export const savePatternData = (patternObj) => (dispatch) => {
	const threadingByTablet = getThreadingByTablet(patternObj);
	const weavingInstructionsByTablet = getWeavingInstructionsByTablet(patternObj || {});
	const picks = getPicksByTablet(patternObj || {});

	dispatch(setPatternData({
		picks,
		patternObj,
		threadingByTablet,
		weavingInstructionsByTablet,
	}));
};

// ///////////////////////////
// Provide information to the UI
export const getIsLoading = (state) => state.pattern.isLoading;

export const getPatternId = (state) => state.pattern._id;

export const getNumberOfRows = (state) => state.pattern.numberOfRows || 0;

export const getNumberOfTablets = (state) => state.pattern.numberOfTablets || 0;

export const getHoles = (state) => state.pattern.holes;

export const getPalette = (state) => state.pattern.palette;

export const getPicks = (state) => state.pattern.picks;

export const getPick = (state, tabletIndex, rowIndex) => state.pattern.picks[tabletIndex][rowIndex];

export const getPicksForTablet = (state, tabletIndex) => state.pattern.picks[tabletIndex];

export const getThreadingForTablet = (state, tabletIndex) => state.pattern.threadingByTablet[tabletIndex];

export const getThreadingForHole = (state, tabletIndex, holeIndex) => state.pattern.threadingByTablet[tabletIndex][holeIndex];

export const getTotalTurnsByTablet = (state) => state.pattern.picks.map((picksForTablet) => picksForTablet[state.pattern.numberOfRows - 1].totalTurns);

export const getOrientationForTablet = (state, tabletIndex) => state.pattern.orientations[tabletIndex];

export const getIsEditing = (state) => state.pattern.isEditingWeaving || state.pattern.isEditingThreading;

// ///////////////////////
// cached selectors to provide props without triggering re-render
export const getPatternTwistSelector = createSelector(
	getHoles,
	getNumberOfRows,
	getNumberOfTablets,
	getPicks,
	(
		holes,
		numberOfRows,
		numberOfTablets,
		picks,
	) => findPatternTwist({
		holes,
		numberOfRows,
		numberOfTablets,
		picks,
	}),
);

export const getTotalTurnsByTabletSelector = createSelector(
	getPicks,
	getNumberOfRows,
	(picks, numberOfRows) => picks.map((picksForTablet) => picksForTablet[numberOfRows - 1].totalTurns),
);

// this next is unnecessary because threading has been recast, but it's a useful example of how to get array props

// use re-reselect to cache processed threading for tablet
// otherwise, passing an array triggers re-render even when there is no change
/* export const getThreading = (state) => state.pattern.threadingByTablet;

export const getTabletIndex = (state, tabletIndex) => tabletIndex;

export const getThreadingForTabletCached = createCachedSelector(
	getThreading,
	getTabletIndex,

	// resultFunc
	(threading, tabletIndex) => threading[tabletIndex],
)(
	// re-reselect keySelector (receives selectors' arguments)
	// Use "tabletIndex_rowIndex" as cacheKey
	(_state_, tabletIndex) => tabletIndex,
); */

// ///////////////////////////////////


// ///////////////////////////
// Action that call Meteor methods
// if pattern chart data change, this will be updated in the Redux store

export const addPattern = (data, history) => (dispatch) => {
	dispatch(clearErrors());
	Meteor.call('pattern.add', data, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'add-pattern': error.reason }));
		}

		history.push(`/pattern/${result}`);
	});
};

export function removePattern(_id, history) {
	return () => {
		Meteor.call('pattern.remove', _id);

		if (history) { // if deleting from Home page, no need to redirect
			history.push(`/`);
		}
	};
}

export const copyPattern = (_id, history) => (dispatch) => {
	dispatch(clearErrors());

	Meteor.call('pattern.copy', _id, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'copy-pattern': error.reason }));
		}

		history.push(`/pattern/${result}`);
	});
};

export const downloadPattern = (_id, patternObj) => (dispatch) => {
	dispatch(clearErrors());

	console.log('Pattern data:', patternObj);
};

// Edit pattern
// Pattern as a whole
export function editIsPublic({
	_id,
	isPublic,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editIsPublic',
				isPublic,
			},
		});
	};
}

// Pattern charts
// Weaving (individual)
export function updateWeavingCellDirection(data) {
	return {
		'type': 'UPDATE_WEAVING_CELL_DIRECTION',
		'payload': data,
	};
}

// change direction of this row and all followiing rows
export function editWeavingCellDirection({
	_id,
	row,
	tablet,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editWeavingCellDirection',
				row,
				tablet,
			},
			row,
			tablet,
		});

		dispatch(updateWeavingCellDirection({
			row,
			tablet,
		}));
	};
}

// number of turns
export function updateWeavingCellNumberOfTurns(data) {
	return {
		'type': 'UPDATE_WEAVING_CELL_TURNS',
		'payload': data,
	};
}

export function editWeavingCellNumberOfTurns({
	_id,
	row,
	tablet,
	numberOfTurns,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editWeavingCellNumberOfTurns',
				row,
				tablet,
				numberOfTurns,
			},
		});

		dispatch(updateWeavingCellNumberOfTurns({
			numberOfTurns,
			row,
			tablet,
		}));
	};
}

// ///////////////////////////////
// allTogether
// number of turns
export function updateWeavingRowDirection(data) {
	return {
		'type': 'UPDATE_WEAVING_ROW_DIRECTION',
		'payload': data,
	};
}

export function editWeavingRowDirection({
	_id,
	row,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editWeavingRowDirection',
				row,
			},
		});

		dispatch(updateWeavingRowDirection({
			row,
		}));
	};
}

// ///////////////////////////////
// add weaving rows
export function updateAddWeavingRows(data) {
	return {
		'type': 'UPDATE_ADD_WEAVING_ROWS',
		'payload': data,
	};
}

export function addWeavingRows({
	_id,
	insertNRows,
	insertRowsAt,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'addWeavingRows',
				insertNRows,
				insertRowsAt,
			},
		});

		dispatch(updateAddWeavingRows({
			insertNRows,
			insertRowsAt,
		}));
	};
}

// remove weaving rows
export function updateRemoveWeavingRow(data) {
	return {
		'type': 'UPDATE_REMOVE_WEAVING_ROW',
		'payload': data,
	};
}

export function removeWeavingRow({
	_id,
	row,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'removeWeavingRow',
				row,
			},
		});

		dispatch(updateRemoveWeavingRow({
			row,
		}));
	};
}

// Threading
export function updateThreadingCell(data) {
	return {
		'type': 'UPDATE_THREADING_CELL',
		'payload': data,
	};
}

export function editThreadingCell({
	_id,
	hole,
	tablet,
	colorIndex,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editThreadingCell',
				hole,
				tablet,
				colorIndex,
			},
		});

		dispatch(updateThreadingCell({
			hole,
			tablet,
			colorIndex,
		}));
	};
}

// add tablets
export function updateAddTablets(data) {
	return {
		'type': 'UPDATE_ADD_TABLETS',
		'payload': data,
	};
}

export function addTablets({
	_id,
	colorIndex,
	insertNTablets,
	insertTabletsAt,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'addTablets',
				colorIndex,
				insertNTablets,
				insertTabletsAt,
			},
		});

		dispatch(updateAddTablets({
			colorIndex,
			insertNTablets,
			insertTabletsAt,
		}));
	};
}

// remove tablet
export function updateRemoveTablet(data) {
	return {
		'type': 'UPDATE_REMOVE_TABLET',
		'payload': data,
	};
}

export function removeTablet({
	_id,
	tablet,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			tablet,
			'data': {
				'type': 'removeTablet',
				tablet,
			},
		});

		dispatch(updateRemoveTablet({
			tablet,
		}));
	};
}

// Tablet orientation
export function updateOrientation(data) {
	return {
		'type': 'UPDATE_ORIENTATION',
		'payload': data,
	};
}

export function editOrientation({
	_id,
	tablet,
}) {
	return (dispatch, getState) => {
		const currentOrientation = getState().pattern.orientations[tablet];

		const tabletOrientation = currentOrientation === '\\' ? '/' : '\\';

		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'orientation',
				tablet,
				tabletOrientation,
			},
		});

		dispatch(updateOrientation({
			tablet,
			tabletOrientation,
		}));
	};
}

// Palette color
export function editPaletteColor({
	_id,
	colorHexValue,
	colorIndex,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'paletteColor',
				colorHexValue,
				colorIndex,
			},
		});
	};
}

// Weft Color
export function editWeftColor({
	_id,
	colorIndex,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'weftColor',
				colorIndex,
			},
		});
	};
}

// Preview orientation
export function editPreviewOrientation({
	_id,
	orientation,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'previewOrientation',
				orientation,
			},
		});
	};
}

// editable text fields like name, description
export function editTextField({
	_id,
	fieldName,
	fieldValue,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				fieldName,
				fieldValue,
				'type': 'editTextField',
			},
		});
	};
}

// ///////////////////////////
// filter pattern list on number of tablets
export function setFilterMaxTablets(maxTablets) {
	return {
		'type': 'SET_FILTER_MAX_TABLETS',
		'payload': maxTablets,
	};
}

export function updateFilterMaxTablets(maxTablets, history) {
	return (dispatch, getState) => {
		const value = parseFloat(maxTablets, 10);

		if ((value) < 1
			|| value > MAX_TABLETS
			|| !Number.isInteger(value)
			|| value <= getState().pattern.minTablets) {
			return;
		}

		dispatch(setFilterMaxTablets(value));
		dispatch(changePage(0, history));
		dispatch(getPatternCount());
	};
}

export function setFilterMinTablets(minTablets) {
	return {
		'type': 'SET_FILTER_MIN_TABLETS',
		'payload': minTablets,
	};
}

export function updateFilterMinTablets(minTablets, history) {
	return (dispatch, getState) => {
		const value = parseFloat(minTablets, 10);

		if ((value) < 1
			|| value > MAX_TABLETS
			|| !Number.isInteger(value)
			|| value >= getState().pattern.maxTablets) {
			return;
		}

		dispatch(setFilterMinTablets(value));
		dispatch(changePage(0, history));
		dispatch(getPatternCount());
	};
}

export function removeTabletFilter() {
	return {
		'type': 'REMOVE_TABLET_FILTER',
		'payload': {
			'maxTablets': undefined,
			'minTablets': undefined,
		},
	};
}

export function updateFilterRemove(history) {
	return (dispatch) => {
		dispatch(removeTabletFilter());
		dispatch(changePage(0, history));
		dispatch(getPatternCount());
	};
}

// ///////////////////////////
// default state
const initialPatternState = {
	'currentPageNumber': 0,
	'error': null,
	'filterMaxTablets': undefined,
	'filterMinTablets': undefined,
	'holes': 0,
	'isEditingThreading': false,
	'isEditingWeaving': false,
	'isLoading': true,
	'palette': [],
	'patternCount': 0,
	'patternCountUserId': undefined,
	'picks': [],
	'threading': [],
};

// state updates
export default function pattern(state = initialPatternState, action) {
	switch (action.type) {
		case SET_PATTERN_COUNT: {
			return updeep({ 'patternCount': action.payload }, state);
		}

		case SET_PATTERN_COUNT_USERID: {
			return updeep({ 'patternCountUserId': action.payload }, state);
		}

		case SET_ISLOADING: {
			return updeep({ 'isLoading': action.payload }, state);
		}

		case SET_PATTERN_DATA: {
			const {
				_id,
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				palette,
				patternDesign,
				picks,
				threadingByTablet,
				weavingInstructionsByTablet,
			} = action.payload;

			return updeep({
				_id,
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				palette,
				patternDesign,
				picks,
				threadingByTablet,
				weavingInstructionsByTablet,
			}, state);
		}

		case UPDATE_WEAVING_CELL_TURNS: {
			const { numberOfTurns, row, tablet } = action.payload;
			const { weavingInstructionsByTablet } = state;

			// to update the weaving instructions
			const obj = { ...weavingInstructionsByTablet[tablet][row] };

			obj.numberOfTurns = numberOfTurns;

			// to calculate new picks for this tablet
			const weavingInstructionsForTablet = [...weavingInstructionsByTablet[tablet]];

			weavingInstructionsForTablet[row] = obj;

			const picksForTablet = reCalculatePicksForTablet({
				'currentPicks': state.picks[tablet],
				weavingInstructionsForTablet,
				row,
			});

			return updeep({
				'weavingInstructionsByTablet': { [tablet]: { [row]: obj } },
				'picks': { [tablet]: picksForTablet },
			}, state);
		}

		case UPDATE_WEAVING_CELL_DIRECTION: {
			const { row, tablet } = action.payload;
			const { numberOfRows, weavingInstructionsByTablet } = state;

			const weavingInstructionsForTablet = [...weavingInstructionsByTablet[tablet]];

			// change direction of tablet for this row and all following rows
			for (let i = row; i < numberOfRows; i += 1) {
				const obj = { ...weavingInstructionsForTablet[i] };
				obj.direction = weavingInstructionsForTablet[i].direction === 'F' ? 'B' : 'F';
				weavingInstructionsForTablet[i] = obj;
			}

			const picksForTablet = reCalculatePicksForTablet({
				'currentPicks': state.picks[tablet],
				weavingInstructionsForTablet,
				row,
			});

			return updeep({
				'weavingInstructionsByTablet': { [tablet]: weavingInstructionsForTablet },
				'picks': { [tablet]: picksForTablet },
			}, state);
		}

		case UPDATE_WEAVING_ROW_DIRECTION: {
			const { row } = action.payload;
			const {
				numberOfRows,
				numberOfTablets,
				patternDesign,
				weavingInstructionsByTablet,
			} = state;
console.log('patternDesign', patternDesign);
			const newWeavingInstructions = [...patternDesign.weavingInstructions];
			const newWeavingInstructionsByTablet = [];
			const newPicks = [];

			// update pattern design for this row
			newWeavingInstructions[row] = newWeavingInstructions[row] === 'F' ? 'B' : 'F';

			// update weaving instructions for each tablet
			for (let i = 0; i < numberOfTablets; i += 1) {
				console.log('weavingInstructionsByTablet', weavingInstructionsByTablet);

				const weavingInstructionsForTablet = [...weavingInstructionsByTablet[i]];

				// change direction of tablet for this row and all following rows
				for (let j = row; j < numberOfRows; j += 1) {
					const obj = { ...weavingInstructionsForTablet[j] };
					obj.direction = weavingInstructionsForTablet[j].direction === 'F' ? 'B' : 'F';
					weavingInstructionsForTablet[j] = obj;
				}

				const picksForTablet = reCalculatePicksForTablet({
					'currentPicks': state.picks[i],
					weavingInstructionsForTablet,
					row,
				});

				newWeavingInstructionsByTablet.push(weavingInstructionsForTablet);
				newPicks.push(picksForTablet);
			}

			return updeep({
				'weavingInstructionsByTablet': newWeavingInstructionsByTablet,
				'patternDesign': { 'weavingInstructions': newWeavingInstructions },
				'picks': newPicks,
			}, state);
		}

		case SET_IS_EDITING_WEAVING: {
			return updeep({ 'isEditingWeaving': action.payload }, state);
		}

		case SET_IS_EDITING_THREADING: {
			return updeep({ 'isEditingThreading': action.payload }, state);
		}

		case UPDATE_THREADING_CELL: {
			const { hole, tablet, colorIndex } = action.payload;

			return updeep({
				'threadingByTablet': { [tablet]: { [hole]: colorIndex } },
			}, state);
		}

		case UPDATE_ORIENTATION: {
			const { tablet, tabletOrientation } = action.payload;
			const { weavingInstructionsByTablet } = state;

			// to calculate new picks for this tablet
			const weavingInstructionsForTablet = [...weavingInstructionsByTablet[tablet]];
			// weavingInstructionsForTablet[row] = obj;
			const picksForTablet = reCalculatePicksForTablet({
				'currentPicks': state.picks[tablet],
				weavingInstructionsForTablet,
				'row': 0,
			});

			return updeep({
				'orientations': { [tablet]: tabletOrientation },
				'picks': { [tablet]: picksForTablet },
			}, state);
		}

		case UPDATE_ADD_WEAVING_ROWS: {
			const { insertNRows, insertRowsAt } = action.payload;
			const {
				numberOfRows,
				numberOfTablets,
				picks,
				weavingInstructionsByTablet,
			} = state;

			// individual weaving instruction
			const obj = {
				'direction': DEFAULT_DIRECTION,
				'numberOfTurns': DEFAULT_NUMBER_OF_TURNS,
			};

			const newPicks = [];
			const newWeavingInstructionsByTablet = [];

			for (let i = 0; i < numberOfTablets; i += 1) {
				const newWeavingInstructionsForTablet = [...weavingInstructionsByTablet[i]];

				for (let j = 0; j < insertNRows; j += 1) {
					newWeavingInstructionsForTablet.splice(insertRowsAt, 0, obj);
				}

				const picksForTablet = reCalculatePicksForTablet({
					'currentPicks': picks[i],
					'weavingInstructionsForTablet': newWeavingInstructionsForTablet,
					'row': insertRowsAt,
				});

				newWeavingInstructionsByTablet.push(newWeavingInstructionsForTablet);
				newPicks.push(picksForTablet);
			}

			const newNumberOfRows = numberOfRows + insertNRows;

			return updeep({
				'numberOfRows': newNumberOfRows,
				'weavingInstructionsByTablet': newWeavingInstructionsByTablet,
				'picks': newPicks,
			}, state);
		}

		case UPDATE_REMOVE_WEAVING_ROW: {
			const { row } = action.payload;
			const {
				numberOfRows,
				numberOfTablets,
				weavingInstructionsByTablet,
			} = state;

			const newPicks = [];
			const newWeavingInstructionsByTablet = [];

			for (let i = 0; i < numberOfTablets; i += 1) {
				const newWeavingInstructionsForTablet = [...weavingInstructionsByTablet[i]];

				newWeavingInstructionsForTablet.splice(row, 1);

				const picksForTablet = reCalculatePicksForTablet({
					'currentPicks': state.picks[i],
					'weavingInstructionsForTablet': newWeavingInstructionsForTablet,
					'row': row,
				});

				newWeavingInstructionsByTablet.push(newWeavingInstructionsForTablet);
				newPicks.push(picksForTablet);
			}

			const newNumberOfRows = numberOfRows - 1;

			return updeep({
				'numberOfRows': newNumberOfRows,
				'weavingInstructionsByTablet': newWeavingInstructionsByTablet,
				'picks': newPicks,
			}, state);
		}

		case UPDATE_ADD_TABLETS: {
			const { colorIndex, insertNTablets, insertTabletsAt } = action.payload;
			const {
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				picks,
				threadingByTablet,
				weavingInstructionsByTablet,
			} = state;

			const newThreadingByTablet = [...threadingByTablet];
			const newOrientations = [...orientations];
			const newWeavingInstructionsByTablet = [...weavingInstructionsByTablet];
			const obj = {
				'direction': DEFAULT_DIRECTION,
				'numberOfTurns': DEFAULT_NUMBER_OF_TURNS,
			};
			const newPicks = [...picks];
			const newNumberOfTablets = numberOfTablets + insertNTablets;

			for (let i = 0; i < insertNTablets; i += 1) {
				// update orientations
				newOrientations.splice(insertTabletsAt, 0, DEFAULT_ORIENTATION);

				// update threading
				const newThreadingTablet = [];
				for (let j = 0; j < holes; j += 1) {
					newThreadingTablet.push(colorIndex);
				}

				newThreadingByTablet.splice(insertTabletsAt, 0, newThreadingTablet);

				// update weaving instructions
				const newWeavingInstructionsForTablet = [];
				for (let j = 0; j < numberOfRows; j += 1) {
					newWeavingInstructionsForTablet.push(obj);
				}

				newWeavingInstructionsByTablet.splice(insertTabletsAt, 0, newWeavingInstructionsForTablet);

				// update picks
				const picksForTablet = calculatePicksForTablet({
					'weavingInstructionsForTablet': newWeavingInstructionsByTablet[insertTabletsAt],
				});

				newPicks.splice(insertTabletsAt, 0, picksForTablet);
			}

			return updeep({
				'numberOfTablets': newNumberOfTablets,
				'orientations': newOrientations,
				'threadingByTablet': newThreadingByTablet,
				'weavingInstructionsByTablet': newWeavingInstructionsByTablet,
				'picks': newPicks,
			}, state);
		}

		case UPDATE_REMOVE_TABLET: {
			const { tablet } = action.payload;
			const {
				numberOfTablets,
				orientations,
				picks,
				threadingByTablet,
				weavingInstructionsByTablet,
			} = state;

			const newPicks = [...picks];
			const newWeavingInstructionsByTablet = [...weavingInstructionsByTablet];
			const newThreadingByTablet = [...threadingByTablet];
			const newOrientations = [...orientations];
			const newNumberOfTablets = numberOfTablets - 1;

			newPicks.splice(tablet, 1);
			newThreadingByTablet.splice(tablet, 1);
			newWeavingInstructionsByTablet.splice(tablet, 1);
			newOrientations.splice(tablet, 1);

			return updeep({
				'numberOfTablets': newNumberOfTablets,
				'orientations': newOrientations,
				'threadingByTablet': newThreadingByTablet,
				'weavingInstructionsByTablet': newWeavingInstructionsByTablet,
				'picks': newPicks,
			}, state);
		}

		case SET_FILTER_MAX_TABLETS: {
			return updeep({ 'filterMaxTablets': action.payload }, state);
		}

		case SET_FILTER_MIN_TABLETS: {
			return updeep({ 'filterMinTablets': action.payload }, state);
		}

		case REMOVE_TABLET_FILTER: {
			return updeep({ 'filterMaxTablets': null, 'filterMinTablets': null }, state);
		}

		default:
			return state;
	}
}
