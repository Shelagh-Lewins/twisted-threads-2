// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state
// import * as svg from 'save-svg-as-png';
import { logErrors, clearErrors } from './errors';
import {
	findPatternTwist,
	getPicksByTablet,
	getWeavingInstructionsByTablet,
	reCalculatePicksForTablet,
} from './weavingUtils';

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
	weavingInstructionsByTablet,
}) {
	const {
		holes,
		numberOfRows,
		numberOfTablets,
		orientations,
		palette,
		threading,
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
			threading,
			weavingInstructionsByTablet,
		},
	};
}

// calculate weaving picks from pattern data
export const savePatternData = (patternObj) => (dispatch) => {
	const weavingInstructionsByTablet = getWeavingInstructionsByTablet(patternObj || {});
	const picks = getPicksByTablet(patternObj || {});

	dispatch(setPatternData({
		picks,
		patternObj,
		weavingInstructionsByTablet,
	}));
};

// ///////////////////////////
// Provide information to the UI
//TO DO rework as selectors
export const getIsSubscribed = (state) => state.pattern.isSubscribed;

export const getIsLoading = (state) => state.pattern.isLoading;

export const getNumberOfRows = (state) => state.pattern.numberOfRows || 0;

export const getNumberOfTablets = (state) => state.pattern.numberOfTablets || 0;

export const getPick = (state, rowIndex, tabletIndex) => state.pattern.picks[tabletIndex][rowIndex];

export const getPicksForTablet = (state, tabletIndex) => state.pattern.picks[tabletIndex];

export const getTotalTurnsByTablet = (state) => state.pattern.picks.map((picksForTablet) => picksForTablet[state.pattern.numberOfRows - 1].totalTurns);

export const getHoles = (state) => state.pattern.holes;

export const getPalette = (state) => state.pattern.palette;

export const getThreadingForTablet = (state, tabletIndex) => state.pattern.threading.map((threadingRow) => threadingRow[tabletIndex]);

export const getOrientationForTablet = (state, tabletIndex) => state.pattern.orientations[tabletIndex];

export const getPatternTwist = (state) => findPatternTwist(state.pattern.holes, state.pattern.picks);

// ///////////////////////////
// Action that call Meteor methods; teh

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
				'type': 'updateWeavingCellDirection',
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

export function addWeavingRows({
	_id,
	insertNRows,
	insertRowsAt,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'addWeavingRows',
				insertNRows,
				insertRowsAt,
			},
		});
	};
}

export function removeWeavingRow({
	_id,
	row,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'removeWeavingRow',
				row,
			},
		});
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

export function addTablets({
	_id,
	colorIndex,
	insertNTablets,
	insertTabletsAt,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'addTablets',
				colorIndex,
				insertNTablets,
				insertTabletsAt,
			},
		});
	};
}

export function removeTablet({
	_id,
	tablet,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			tablet,
			'data': {
				'type': 'removeTablet',
				tablet,
			},
		});
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
				threading,
				weavingInstructionsByTablet,
			} = action.payload;

			return updeep({
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				palette,
				picks,
				threading,
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
				'weavingInstructionsByTablet': { [row]: { [tablet]: obj } },
				'picks': { [tablet]: picksForTablet },
			}, state);
		}

		case UPDATE_THREADING_CELL: {
			const { hole, tablet, colorIndex } = action.payload;

			return updeep({
				'threading': { [hole]: { [tablet]: colorIndex } },
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

		default:
			return state;
	}
}
