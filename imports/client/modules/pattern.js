// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state
// import * as svg from 'save-svg-as-png';
import { createSelector } from 'reselect';
import createCachedSelector from 're-reselect';
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
} from '../../modules/parameters';


const updeep = require('updeep');

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const GET_PATTERN_COUNT = 'GET_PATTERN_COUNT';
export const SET_PATTERN_COUNT = 'SET_PATTERN_COUNT';
export const SET_ISLOADING = 'SET_ISLOADING';
export const SET_PATTERN_DATA = 'SET_PATTERN_DATA';

// edit pattern charts
export const UPDATE_WEAVING_CELL = 'UPDATE_WEAVING_CELL';
export const UPDATE_THREADING_CELL = 'UPDATE_THREADING_CELL';
export const UPDATE_ORIENTATION = 'UPDATE_ORIENTATION';
export const UPDATE_ADD_WEAVING_ROWS = 'UPDATE_ADD_WEAVING_ROWS';
export const UPDATE_REMOVE_WEAVING_ROW = 'UPDATE_REMOVE_WEAVING_ROW';
export const UPDATE_ADD_TABLETS = 'UPDATE_ADD_TABLETS';
export const UPDATE_REMOVE_TABLET = 'UPDATE_REMOVE_TABLET';

// ////////////////////////////
// Actions that change the Store

// used in pagination
export function setPatternCount(patternCount) {
	return {
		'type': 'SET_PATTERN_COUNT',
		'payload': patternCount,
	};
}

export const getPatternCount = (userId) => (dispatch) => Meteor.call('pattern.getPatternCount', userId, (error, result) => {
	dispatch(setPatternCount(result));
});

export const changePage = (newPageNumber, history) => (dispatch) => {
	const url = `/?page=${newPageNumber + 1}`;

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

// ///////////////////////////
// NEW put pattern in store

// save pattern data in store for calculating charts
export function setPatternData({
	picks,
	patternObj,
	threadingByTablet,
	weavingInstructionsByTablet,
}) {
	const {
		holes,
		numberOfRows,
		numberOfTablets,
		orientations,
		palette,
	} = patternObj;

	return {
		'type': 'SET_PATTERN_DATA',
		'payload': {
			picks,
			holes,
			numberOfRows,
			numberOfTablets,
			orientations,
			palette,
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
export const getIsSubscribed = (state) => state.pattern.isSubscribed;

export const getIsLoading = (state) => state.pattern.isLoading;

export const getNumberOfRows = (state) => state.pattern.numberOfRows || 0;

export const getNumberOfTablets = (state) => state.pattern.numberOfTablets || 0;

export const getHoles = (state) => state.pattern.holes;

export const getPalette = (state) => state.pattern.palette;

export const getPick = (state, rowIndex, tabletIndex) => state.pattern.picks[tabletIndex][rowIndex];

export const getPicksForTablet = (state, tabletIndex) => state.pattern.picks[tabletIndex];

export const getDirection = (state, rowIndex, tabletIndex) => state.pattern.picks[tabletIndex][rowIndex].direction;

export const getNumberOfTurns = (state, rowIndex, tabletIndex) => state.pattern.picks[tabletIndex][rowIndex].numberOfTurns;

export const getTotalTurns = (state, rowIndex, tabletIndex) => state.pattern.picks[tabletIndex][rowIndex].totalTurns;

export const totalTurns = (state, tabletIndex) => state.pattern.picks[tabletIndex].totalTurns;

// export const getThreadingForCell = (state, tabletIndex, rowIndex) => state.patternObj.threading[rowIndex][tabletIndex];

// ///////////////////////
// cached selectors to provide array props without triggering re-render

// use re-reselect to cache processed threading for tablet
// otherwise, passing an array triggers re-render even when there is no change
export const getThreading = (state) => state.pattern.threadingByTablet;

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
);

// ///////////////////////////////////
export const getTotalTurnsByTablet = (state) => state.pattern.picks.map((picksForTablet) => picksForTablet[state.pattern.numberOfRows - 1].totalTurns);

export const getOrientationForTablet = (state, tabletIndex) => state.pattern.orientations[tabletIndex];

export const getPatternTwist = (state) => findPatternTwist(state.pattern.holes, state.pattern.picks);

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
// Weaving
export function updateWeavingCell(data) {
	return {
		'type': 'UPDATE_WEAVING_CELL',
		'payload': data,
	};
}

export function editWeavingCellDirection({
	_id,
	row,
	tablet,
}) {
	return (dispatch, getState) => {
		const currentDirection = getState().pattern.picks[tablet][row].direction;
		const direction = currentDirection === 'F' ? 'B' : 'F';

		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editWeavingCellDirection',
				row,
				tablet,
				direction,
			},
			row,
			tablet,
		});

		dispatch(updateWeavingCell({
			'modification': { direction },
			row,
			tablet,
		}));
	};
}

// number of turns
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

		dispatch(updateWeavingCell({
			'modification': { numberOfTurns },
			row,
			tablet,
		}));
	};
}

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
// default state
const initialPatternState = {
	'currentPageNumber': 0,
	'error': null,
	'holes': 0,
	'isLoading': true,
	'palette': [],
	'patternCount': 0,
	'picks': [],
	'threading': [],
};

// state updates
export default function pattern(state = initialPatternState, action) {
	switch (action.type) {
		case SET_PATTERN_COUNT: {
			return updeep({ 'patternCount': action.payload }, state);
		}

		case SET_ISLOADING: {
			return updeep({ 'isLoading': action.payload }, state);
		}

		case SET_PATTERN_DATA: {
			const {
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				palette,
				picks,
				threadingByTablet,
				weavingInstructionsByTablet,
			} = action.payload;

			return updeep({
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				palette,
				picks,
				threadingByTablet,
				weavingInstructionsByTablet,
			}, state);
		}

		// edit pattern charts. modification can be direction or numberOfTurns
		case UPDATE_WEAVING_CELL: {
			const { modification, row, tablet } = action.payload;
			const { weavingInstructionsByTablet } = state;

			// to update the weaving instructions
			const obj = { ...weavingInstructionsByTablet[tablet][row] };
			const modName = Object.keys(modification)[0];
			obj[modName] = modification[modName];

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
				threading,
				weavingInstructionsByTablet,
			} = state;

			const newThreading = [...threading];
			const newOrientations = [...orientations];
			const newWeavingInstructionsByTablet = [...weavingInstructionsByTablet];
			const obj = {
				'direction': DEFAULT_DIRECTION,
				'numberOfTurns': DEFAULT_NUMBER_OF_TURNS,
			};
			const newPicks = [...picks];
			const newNumberOfTablets = numberOfTablets + insertNTablets;

			for (let i = 0; i < insertNTablets; i += 1) {
				newOrientations.splice(insertTabletsAt, 0, DEFAULT_ORIENTATION);
			}

			for (let i = 0; i < insertNTablets; i += 1) {
				for (let j = 0; j < holes; j += 1) {
					const newThreadingRow = [...newThreading[j]];
					newThreadingRow.splice(insertTabletsAt, 0, colorIndex);
					newThreading[j] = newThreadingRow;
				}

				const newWeavingInstructionsForTablet = [];
				for (let j = 0; j < numberOfRows; j += 1) {
					newWeavingInstructionsForTablet.push(obj);
				}

				newWeavingInstructionsByTablet.splice(insertTabletsAt, 0, newWeavingInstructionsForTablet);
			}

			for (let i = 0; i < insertNTablets; i += 1) {
				const picksForTablet = calculatePicksForTablet({
					'weavingInstructionsForTablet': newWeavingInstructionsByTablet[i],
				});

				newPicks.splice(i, 0, picksForTablet);
			}

			return updeep({
				'numberOfTablets': newNumberOfTablets,
				'orientations': newOrientations,
				'threading': newThreading,
				'weavingInstructionsByTablet': newWeavingInstructionsByTablet,
				'picks': newPicks,
			}, state);
		}

		case UPDATE_REMOVE_TABLET: {
			const { tablet } = action.payload;
			const {
				holes,
				numberOfTablets,
				orientations,
				picks,
				threading,
				weavingInstructionsByTablet,
			} = state;

			const newPicks = [...picks];
			const newWeavingInstructionsByTablet = [...weavingInstructionsByTablet];
			const newThreading = [...threading];
			const newOrientations = [...orientations];
			const newNumberOfTablets = numberOfTablets - 1;

			newPicks.splice(tablet, 1);
			newWeavingInstructionsByTablet.splice(tablet, 1);
			newOrientations.splice(tablet, 1);

			for (let i = 0; i < holes; i += 1) {
				const newThreadingRow = [...newThreading[i]];
				newThreadingRow.splice(tablet, 1);
				newThreading[i] = newThreadingRow;
			}

			return updeep({
				'numberOfTablets': newNumberOfTablets,
				'orientations': newOrientations,
				'threading': newThreading,
				'weavingInstructionsByTablet': newWeavingInstructionsByTablet,
				'picks': newPicks,
			}, state);
		}

		default:
			return state;
	}
}
