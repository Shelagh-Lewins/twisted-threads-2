// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state
// import * as svg from 'save-svg-as-png';
import { createSelector } from 'reselect';
// import createCachedSelector from 're-reselect';
import { logErrors, clearErrors } from './errors';
import {
	buildTwillOffsetThreadingForTablet,
	buildTwillOffsetThreading,
	buildTwillWeavingInstructionsForTablet,
	buiildWeavingInstructionsByTablet,
	calculateAllPicks,
	calculatePicksForTablet,
	findPatternTwist,
	getThreadingByTablet,
	getTotalTurnsForTablet,
	modulus,
} from './weavingUtils';
import {
	BROKEN_TWILL_BACKGROUND,
	BROKEN_TWILL_FOREGROUND,
	BROKEN_TWILL_THREADING,
	DEFAULT_FREEHAND_CELL,
	DEFAULT_DIRECTION,
	DEFAULT_NUMBER_OF_TURNS,
	DEFAULT_ORIENTATION,
	MAX_TABLETS,
} from '../../modules/parameters';
import getColorsForRolesByTablet from '../../modules/getColorsForRolesByTablet';
import patternAsText from './patternAsText';
import newPatternFromFile from './newPatternFromFile';

const updeep = require('updeep');
const filenamify = require('filenamify');

/* eslint-disable no-case-declarations */

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const SET_PATTERN_COUNT = 'SET_PATTERN_COUNT';
export const SET_PATTERN_COUNT_USERID = 'SET_PATTERN_COUNT_USERID';
export const SET_ISLOADING = 'SET_ISLOADING';
export const SET_PATTERN_ID = 'SET_PATTERN_ID';
export const SET_WEAVING_INSTRUCTIONS = 'SET_WEAVING_INSTRUCTIONS';
export const CLEAR_PATTERN_DATA = 'CLEAR_PATTERN_DATA';
export const SET_PATTERN_DATA = 'SET_PATTERN_DATA';

// edit pattern charts
export const SET_IS_EDITING_WEAVING = 'SET_IS_EDITING_WEAVING';
export const SET_IS_EDITING_THREADING = 'SET_IS_EDITING_THREADING';

// 'individual' patternType
export const UPDATE_WEAVING_CELL_DIRECTION = 'UPDATE_WEAVING_CELL_DIRECTION';
export const UPDATE_WEAVING_CELL_TURNS = 'UPDATE_WEAVING_CELL_TURNS';

// 'allTogether' patternType
export const UPDATE_WEAVING_ROW_DIRECTION = 'UPDATE_WEAVING_ROW_DIRECTION';

// 'brokenTwill' patternType
export const UPDATE_TWILL_CHART = 'UPDATE_TWILL_CHART';
export const UPDATE_TWILL_WEAVING_START_ROW = 'UPDATE_TWILL_WEAVING_START_ROW';

// 'freehand' patternType
export const UPDATE_FREEHAND_CELL_THREAD = 'UPDATE_FREEHAND_CELL_THREAD';
export const UPDATE_FREEHAND_CELL_DIRECTION = 'UPDATE_FREEHAND_CELL_DIRECTION';

// more than one patternType
export const SET_UPDATE_PREVIEW_WHILE_EDITING = 'SET_UPDATE_PREVIEW_WHILE_EDITING';
export const UPDATE_THREADING_CELL = 'UPDATE_THREADING_CELL';
export const UPDATE_ORIENTATION = 'UPDATE_ORIENTATION';
export const UPDATE_PALETTE_COLOR = 'UPDATE_PALETTE_COLOR';
export const UPDATE_HOLE_HANDEDNESS = 'UPDATE_HOLE_HANDEDNESS';

export const UPDATE_ADD_WEAVING_ROWS = 'UPDATE_ADD_WEAVING_ROWS';
export const UPDATE_REMOVE_WEAVING_ROWS = 'UPDATE_REMOVE_WEAVING_ROWS';
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

	Meteor.call('pattern.getPatternCount', {
		filterMaxTablets,
		filterMinTablets,
		'userId': patternCountUserId,
	}, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'get pattern count': error.reason }));
		}

		dispatch(setPatternCount(result));
	});
};

// should the pattern count only include patterns belonging to a particular user?
export function setPatternCountUserId(userId) {
	return {
		'type': SET_PATTERN_COUNT_USERID,
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
		'type': SET_ISLOADING,
		'payload': isLoading,
	};
}

export function setIsEditingWeaving(isEditingWeaving) {
	return {
		'type': SET_IS_EDITING_WEAVING,
		'payload': isEditingWeaving,
	};
}

export function setIsEditingThreading(isEditingThreading) {
	return {
		'type': SET_IS_EDITING_THREADING,
		'payload': isEditingThreading,
	};
}

// //////////////////////////////
// save pattern data in store for calculating charts
export function setPatternId(_id) {
	return {
		'type': SET_PATTERN_ID,
		'payload': _id,
	};
}
// build and save the weaving instructions from pattern design
export function setWeavingInstructions(weavingInstructionsByTablet) {
	return {
		'type': SET_WEAVING_INSTRUCTIONS,
		'payload': weavingInstructionsByTablet,
	};
}

export function clearPatternData() {
	return {
		'type': CLEAR_PATTERN_DATA,
		'payload': false,
	};
}

export function setPatternData({
	picks,
	patternDesign,
	patternObj,
	threadingByTablet,
}) {
	const {
		holes,
		numberOfRows,
		numberOfTablets,
		orientations,
		palette,
		patternType,
	} = patternObj;

	return {
		'type': SET_PATTERN_DATA,
		'payload': {
			holes,
			numberOfRows,
			numberOfTablets,
			orientations,
			palette,
			patternDesign,
			patternType,
			picks,
			threadingByTablet,
		},
	};
}

// build chart data and save it in the store
export const savePatternData = (patternObj) => (dispatch) => {
	const {
		numberOfRows,
		numberOfTablets,
		patternDesign,
		patternType,
	} = patternObj;
	const weavingInstructionsByTablet = buiildWeavingInstructionsByTablet(patternObj);

	dispatch(setWeavingInstructions(weavingInstructionsByTablet));

	const threadingByTablet = getThreadingByTablet(patternObj);

	let picks;

	switch (patternType) {
		// all simulation patterns
		case 'individual':
		case 'allTogether':
		case 'brokenTwill': {
			picks = calculateAllPicks({
				numberOfRows,
				numberOfTablets,
				weavingInstructionsByTablet,
			});

			break;
		}

		default:
			break;
	}

	dispatch(setPatternData({
		picks,
		patternDesign,
		patternObj,
		threadingByTablet,
	}));
};

// ///////////////////////////
// Provide information to the UI
export const getIsLoading = (state) => state.pattern.isLoading;

export const getPatternId = (state) => state.pattern._id;

export const getPatternType = (state) => state.pattern.patternType;

export const getPatternDesign = (state) => state.pattern.patternDesign || {};

export const getNumberOfRows = (state) => state.pattern.numberOfRows || 0;

// chart may be truncated for broken twill
export const getNumberOfRowsForChart = (state) => {
	const {
		numberOfRows,
		patternDesign,
		patternType,
	} = state.pattern;

	let numberOfRowsForChart = numberOfRows || 0;

	if (patternType === 'brokenTwill') {
		numberOfRowsForChart = numberOfRows - patternDesign.weavingStartRow + 1;
	}

	return numberOfRowsForChart;
};

export const getNumberOfTablets = (state) => state.pattern.numberOfTablets || 0;

export const getHoles = (state) => state.pattern.holes;

export const getPalette = (state) => state.pattern.palette;

export const getHoleHandedness = (state) => (state.pattern.patternDesign ? state.pattern.patternDesign.holeHandedness : undefined);

export const getPicks = (state) => state.pattern.picks;

export const getPicksForChart = (state) => {
	const {
		patternDesign,
		patternType,
	} = state.pattern;

	const picks = [...state.pattern.picks];

	if (patternType === 'brokenTwill') {
		for (let i = 0; i < picks.length; i += 1) {
			picks[i] = [...picks[i]];
			picks[i].splice(0, patternDesign.weavingStartRow - 1);
		}
	}

	return picks;
};

export const getPick = (state, tabletIndex, rowIndex) => state.pattern.picks[tabletIndex][rowIndex];

export const getPicksForTablet = (state, tabletIndex) => state.pattern.picks[tabletIndex];

// picks may be truncated for broken twill
export const getPicksForTabletForChart = (state, tabletIndex) => {
	const {
		numberOfTablets,
		patternDesign,
		patternType,
	} = state.pattern;

	let picksForTablet = [];

	if (tabletIndex < numberOfTablets) { // can happen when preview re-renders after remove tablet
		picksForTablet = [...state.pattern.picks[tabletIndex]];

		if (patternType === 'brokenTwill') {
			picksForTablet.splice(0, patternDesign.weavingStartRow - 1);
		}
	}

	return picksForTablet;
};

export const getPickForChart = (state, tabletIndex, rowIndex) => {
	const picksForTablet = getPicksForTabletForChart(state, tabletIndex);

	return picksForTablet[rowIndex];
};

export const getThreadingForTablet = (state, tabletIndex) => state.pattern.threadingByTablet[tabletIndex];

// used for the threading chart
export const getThreadingForHole = (state, tabletIndex, holeIndex) => {
	// broken twill displays an offset threading diagram
	// based on the weaving start row
	if (state.pattern.patternType === 'brokenTwill') {
		// after a tablet is added there may be a delay before the new tablet is ready
		const threadingForTablet = state.pattern.patternDesign.offsetThreadingByTablets[tabletIndex];

		if (threadingForTablet) {
			return threadingForTablet[holeIndex];
		}

		return undefined;
	}
	return state.pattern.threadingByTablet[tabletIndex][holeIndex];
};

export const getTotalTurnsByTablet = (state) => state.pattern.picks.map((picksForTablet) => picksForTablet[state.pattern.numberOfRows - 1].totalTurns);

export const getOrientationForTablet = (state, tabletIndex) => state.pattern.orientations[tabletIndex];

export const getIsEditing = (state) => state.pattern.isEditingWeaving || state.pattern.isEditingThreading;

export const getPreviewShouldUpdate = (state) => (!state.pattern.isEditingWeaving && !state.pattern.isEditingThreading) || state.pattern.updatePreviewWhileEditing;

// ///////////////////////
// cached selectors to provide props without triggering re-render
export const getPatternTwistSelector = createSelector(
	getHoles,
	getNumberOfRows,
	getNumberOfTablets,
	getPatternDesign,
	getPatternType,
	getPicks,
	(
		holes,
		numberOfRows,
		numberOfTablets,
		patternDesign,
		patternType,
		picks,
	) => findPatternTwist({
		holes,
		numberOfRows,
		numberOfTablets,
		patternDesign,
		patternType,
		picks,
	}),
);

export const getTotalTurnsByTabletSelector = createSelector(
	getNumberOfRows,
	getPatternDesign,
	getPatternType,
	getPicks,
	(
		numberOfRows,
		patternDesign,
		patternType,
		picks,
	) => picks.map((picksForTablet) => getTotalTurnsForTablet({
		numberOfRows,
		patternDesign,
		patternType,
		picksForTablet,
	})),
);

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

export const removePattern = (_id, history) => (dispatch) => {
	Meteor.call('pattern.remove', _id, (error) => {
		if (error) {
			return dispatch(logErrors({ 'remove pattern': error.reason }));
		}
	});

	if (history) { // if deleting from Home page, no need to redirect
		history.push(`/`);
	}
};

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

	const text = patternAsText(_id, patternObj);
	const { name } = patternObj;
	const filename = filenamify(name, {
		'replacement': '_',
		'maxLength': 100000, // 0.1MB
	});

	const element = document.createElement('a');

	element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
	element.setAttribute('download', `${filename}.twt`);

	element.style.display = 'none';
	document.body.appendChild(element);

	element.click();

	document.body.removeChild(element);
};

export const importPatternFromText = (text, history) => (dispatch) => {
	dispatch(clearErrors());

	const { isValid, patternObj } = newPatternFromFile(text);

	console.log('isValid', isValid);
	console.log('patternObj', patternObj);

	// send to server
	Meteor.call('pattern.newPatternFromData', {
		patternObj,
	}, (error, result) => {
		if (error) {
			return dispatch(logErrors({ 'add new pattern from data': error.reason }));
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
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editIsPublic',
				isPublic,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit is public': error.reason }));
			}
		});
	};
}

// Pattern charts
// Weaving (individual)
export function updateWeavingCellDirection(data) {
	return {
		'type': UPDATE_WEAVING_CELL_DIRECTION,
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
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit weaving cell direction': error.reason }));
			}
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
		'type': UPDATE_WEAVING_CELL_TURNS,
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
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit weaving cell turns': error.reason }));
			}
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
		'type': UPDATE_WEAVING_ROW_DIRECTION,
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
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit weaving row direction': error.reason }));
			}
		});

		dispatch(updateWeavingRowDirection({
			row,
		}));
	};
}

// ///////////////////////////////
// brokenTwill
export function updateTwillChart(data) {
	return {
		'type': UPDATE_TWILL_CHART,
		'payload': data,
	};
}

export function editTwillChart({
	_id,
	rowIndex,
	tabletIndex,
	twillChart, // which chart to update
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editTwillChart',
				_id,
				rowIndex,
				tabletIndex,
				twillChart,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit twill pattern chart': error.reason }));
			}
		});

		dispatch(updateTwillChart({
			_id,
			rowIndex,
			tabletIndex,
			twillChart,
		}));
	};
}

// set weaving start row
export function updateTwillWeavingStartRow(data) {
	return {
		'type': UPDATE_TWILL_WEAVING_START_ROW,
		'payload': data,
	};
}

export function editTwillWeavingStartRow({
	_id,
	weavingStartRow,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editTwillWeavingStartRow',
				_id,
				weavingStartRow,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit twill weaving start row': error.reason }));
			}
		});

		dispatch(updateTwillWeavingStartRow(weavingStartRow));
	};
}

// ///////////////////////////////
// freehand patterns

// set thread (colour and shape)
export function updateFreehandCellThread({
	'row': rowIndex,
	'tablet': tabletIndex,
	'threadColor': selectedColorIndex,
	'threadShape': selectedThread,
}) {
	return {
		'type': UPDATE_FREEHAND_CELL_THREAD,
		'payload': {
			'row': rowIndex,
			'tablet': tabletIndex,
			'threadColor': selectedColorIndex,
			'threadShape': selectedThread,
		},
	};
}

export function editFreehandCellThread({
	_id,
	'row': rowIndex,
	'tablet': tabletIndex,
	'threadColor': selectedColorIndex,
	'threadShape': selectedThread,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editFreehandCellThread',
				_id,
				'row': rowIndex,
				'tablet': tabletIndex,
				'threadColor': selectedColorIndex,
				'threadShape': selectedThread,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit freehand cell thread': error.reason }));
			}
		});

		dispatch(updateFreehandCellThread({
			'row': rowIndex,
			'tablet': tabletIndex,
			'threadColor': selectedColorIndex,
			'threadShape': selectedThread,
		}));
	};
}

// set background (white or grey)
export function updateFreehandCellDirection({
	'row': rowIndex,
	'tablet': tabletIndex,
}) {
	return {
		'type': UPDATE_FREEHAND_CELL_DIRECTION,
		'payload': {
			'row': rowIndex,
			'tablet': tabletIndex,
		},
	};
}

export function editFreehandCellDirection({
	_id,
	direction,
	'row': rowIndex,
	'tablet': tabletIndex,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editFreehandCellDirection',
				_id,
				'row': rowIndex,
				'tablet': tabletIndex,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit freehand cell direction': error.reason }));
			}
		});

		dispatch(updateFreehandCellDirection({
			direction,
			'row': rowIndex,
			'tablet': tabletIndex,
		}));
	};
}

// ///////////////////////////////
// add weaving rows
export function updateAddWeavingRows(data) {
	return {
		'type': UPDATE_ADD_WEAVING_ROWS,
		'payload': data,
	};
}

export function addWeavingRows({
	_id,
	chartCell,
	insertNRows,
	insertRowsAt,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'addWeavingRows',
				chartCell,
				insertNRows,
				insertRowsAt,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'add weaving row': error.reason }));
			}
		});

		dispatch(updateAddWeavingRows({
			chartCell,
			insertNRows,
			insertRowsAt,
		}));
	};
}

// remove weaving rows
export function updateRemoveWeavingRows(data) {
	return {
		'type': UPDATE_REMOVE_WEAVING_ROWS,
		'payload': data,
	};
}

export function removeWeavingRows({
	_id,
	removeNRows,
	removeRowsAt,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				removeNRows,
				removeRowsAt,
				'type': 'removeWeavingRows',
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'remove weaving row': error.reason }));
			}
		});

		dispatch(updateRemoveWeavingRows({
			removeNRows,
			removeRowsAt,
		}));
	};
}

// Preview
export function setUpdatePreviewWhileEditing(data) {
	return {
		'type': SET_UPDATE_PREVIEW_WHILE_EDITING,
		'payload': data,
	};
}

// Threading
export function updateThreadingCell(data) {
	return {
		'type': UPDATE_THREADING_CELL,
		'payload': data,
	};
}

export function editThreadingCell({
	_id,
	hole,
	tablet,
	colorIndex,
}) {
	return (dispatch, getState) => {
		const {
			holes,
			'patternDesign': { weavingStartRow },
			patternType,
			picks,
			threadingByTablet,
		} = getState().pattern;
		let newOffsetThreadingForTablet; // only used for broken twill

		const holesToSet = [];
		if (patternType === 'brokenTwill') {
			// set both holes with the role the user clicked
			// offset threading is displayed
			// find the threading cell clicked
			const newThreadingForTablet = [...threadingByTablet[tablet]];
			let tabletOffset = 0;

			if (weavingStartRow > 1) {
				tabletOffset = picks[tablet][weavingStartRow - 2].totalTurns;
			}

			const originalHole = modulus(hole - tabletOffset, holes);

			// find the role of the clicked cell F / B
			const colorRole = BROKEN_TWILL_THREADING[originalHole][tablet % holes];
			// set the new colour for both affected cells in that tablet

			for (let i = 0; i < holes; i += 1) {
				if (BROKEN_TWILL_THREADING[i][tablet % holes] === colorRole) {
					holesToSet.push(i);
					newThreadingForTablet[i] = colorIndex;
				}
			}

			// rebuild offset threading for that tablet
			newOffsetThreadingForTablet = buildTwillOffsetThreadingForTablet({
				holes,
				'pick': picks[tablet],
				'threadingForTablet': newThreadingForTablet,
				weavingStartRow,
			});
		} else {
			holesToSet.push(hole); // other pattern types just set the hole the user clicked
		}

		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editThreadingCell',
				holesToSet,
				tablet,
				colorIndex,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit threading cell direction': error.reason }));
			}
		});

		dispatch(updateThreadingCell({
			colorIndex,
			holesToSet,
			newOffsetThreadingForTablet,
			tablet,
		}));
	};
}

// add tablets
export function updateAddTablets(data) {
	return {
		'type': UPDATE_ADD_TABLETS,
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
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'add tablets': error.reason }));
			}
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
		'type': UPDATE_REMOVE_TABLET,
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
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'remove tablet': error.reason }));
			}
		});

		dispatch(updateRemoveTablet({
			tablet,
		}));
	};
}

// Tablet orientation
export function updateOrientation(data) {
	return {
		'type': UPDATE_ORIENTATION,
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
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'update orientation': error.reason }));
			}
		});

		dispatch(updateOrientation({
			tablet,
			tabletOrientation,
		}));
	};
}

// Palette color
export function updatePaletteColor(data) {
	return {
		'type': UPDATE_PALETTE_COLOR,
		'payload': data,
	};
}

export function editPaletteColor({
	_id,
	colorHexValue,
	colorIndex,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'paletteColor',
				colorHexValue,
				colorIndex,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit palette color': error.reason }));
			}
		});

		dispatch(updatePaletteColor({
			colorHexValue,
			colorIndex,
		}));
	};
}

// hole handedness (freehand patterns only)
export function updateHoleHandedness(data) {
	return {
		'type': UPDATE_HOLE_HANDEDNESS,
		'payload': data,
	};
}

export function editHoleHandedness({
	_id,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'holeHandedness',
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit hole handedness': error.reason }));
			}
		});

		dispatch(updateHoleHandedness());
	};
}

// Weft Color
export function editWeftColor({
	_id,
	colorIndex,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'weftColor',
				colorIndex,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit weft colour': error.reason }));
			}
		});
	};
}

// Preview orientation
export function editPreviewOrientation({
	_id,
	orientation,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'previewOrientation',
				orientation,
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit preview orientation': error.reason }));
			}
		});
	};
}

// editable text fields like name, description
export function editTextField({
	_id,
	fieldName,
	fieldValue,
}) {
	return (dispatch) => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				fieldName,
				fieldValue,
				'type': 'editTextField',
			},
		}, (error) => {
			if (error) {
				return dispatch(logErrors({ 'edit text field': error.reason }));
			}
		});
	};
}

// ///////////////////////////
// filter pattern list on number of tablets
export function setFilterMaxTablets(maxTablets) {
	return {
		'type': SET_FILTER_MAX_TABLETS,
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
		'type': SET_FILTER_MIN_TABLETS,
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
		'type': REMOVE_TABLET_FILTER,
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
	'patternDataReady': false,
	'patternDesign': undefined,
	'picks': [],
	'threadingByTablet': undefined,
	'updatePreviewWhileEditing': false,
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

		case SET_PATTERN_ID: {
			return updeep({ '_id': action.payload }, state);
		}

		case SET_WEAVING_INSTRUCTIONS: {
			return updeep({ 'weavingInstructionsByTablet': action.payload }, state);
		}

		case CLEAR_PATTERN_DATA: {
			return updeep({ 'patternDataReady': false }, state);
		}

		case SET_PATTERN_DATA: {
			const {
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				palette,
				patternDesign,
				patternType,
				picks,
				threadingByTablet,
			} = action.payload;

			const update = {
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				palette,
				'patternDataReady': true,
				patternDesign,
				patternType,
				picks,
				threadingByTablet,
			};

			switch (patternType) {
				case 'individual':
					update.picks = picks;
					break;

				case 'allTogether':
					update.picks = picks;
					break;

				case 'brokenTwill':
					// offset threading chart
					const { weavingStartRow } = patternDesign;
					const offsetThreadingByTablets = buildTwillOffsetThreading({
						holes,
						numberOfTablets,
						picks,
						threadingByTablet,
						weavingStartRow,
					});

					patternDesign.offsetThreadingByTablets = offsetThreadingByTablets;

					break;

				default:
					break;
			}

			if (patternType === 'brokenTwill') {
				// offset threading chart
				const { weavingStartRow } = patternDesign;
				const offsetThreadingByTablets = buildTwillOffsetThreading({
					holes,
					numberOfTablets,
					picks,
					threadingByTablet,
					weavingStartRow,
				});

				patternDesign.offsetThreadingByTablets = offsetThreadingByTablets;
			}

			return updeep(update, state);
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

			const picksForTablet = calculatePicksForTablet({
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

			const picksForTablet = calculatePicksForTablet({
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
			// 'allTogether' patterns only
			const { row } = action.payload;
			const {
				numberOfTablets,
				patternDesign,
				weavingInstructionsByTablet,
			} = state;

			const newWeavingInstructions = [...patternDesign.weavingInstructions];
			const newWeavingInstructionsByTablet = [];
			const newPicks = [];

			// update pattern design for this row
			newWeavingInstructions[row] = newWeavingInstructions[row] === 'F' ? 'B' : 'F';

			// update weaving instructions for each tablet
			for (let i = 0; i < numberOfTablets; i += 1) {
				const weavingInstructionsForTablet = [...weavingInstructionsByTablet[i]];

				// change direction for this row
				const obj = { ...weavingInstructionsForTablet[row] };
				obj.direction = obj.direction === 'F' ? 'B' : 'F';
				weavingInstructionsForTablet[row] = obj;

				const picksForTablet = calculatePicksForTablet({
					'currentPicks': state.picks[i],
					weavingInstructionsForTablet,
					row,
				});

				newWeavingInstructionsByTablet.push(weavingInstructionsForTablet);
				newPicks.push(picksForTablet);
			}

			return updeep({
				'patternDesign': { 'weavingInstructions': newWeavingInstructions },
				'picks': newPicks,
				'weavingInstructionsByTablet': newWeavingInstructionsByTablet,
			}, state);
		}

		case UPDATE_TWILL_CHART: {
			const { rowIndex, tabletIndex, twillChart } = action.payload;

			// first row of an even tablet cannot be edited
			if (tabletIndex % 2 === 1 && rowIndex === 0) {
				return state;
			}

			const {
				numberOfRows,
				patternDesign,
				weavingInstructionsByTablet,
			} = state;

			const weavingInstructionsForTablet = [...weavingInstructionsByTablet[tabletIndex]];

			// toggle '.' or 'X' in the chart
			// original arrays are immutable
			const newTwillChart = [...patternDesign[twillChart]];
			const newRow = [...newTwillChart[rowIndex]];
			const currentValue = newTwillChart[rowIndex][tabletIndex];
			const newValue = currentValue === '.' ? 'X' : '.';
			newRow[tabletIndex] = newValue;
			newTwillChart[rowIndex] = newRow;

			// find the new weavingInstructions for the changed tablet
			const newPatternDesign = { ...patternDesign };
			newPatternDesign[twillChart] = newTwillChart;

			const newWeavingInstructions = buildTwillWeavingInstructionsForTablet({
				numberOfRows,
				'patternDesign': newPatternDesign,
				'startRow': Math.max(rowIndex * 2 - 2, 0), // reweave from previous block to catch color change
				tabletIndex,
				weavingInstructionsForTablet,
			});

			const picksForTablet = calculatePicksForTablet({
				'currentPicks': state.picks[tabletIndex],
				'weavingInstructionsForTablet': newWeavingInstructions,
				'row': Math.max((rowIndex * 2) - 1, 0),
			});

			return updeep({
				'patternDesign': { [twillChart]: newTwillChart },
				'weavingInstructionsByTablet': { [tabletIndex]: newWeavingInstructions },
				'picks': { [tabletIndex]: picksForTablet },
			}, state);
		}

		case UPDATE_TWILL_WEAVING_START_ROW: {
			const {
				holes,
				numberOfTablets,
				picks,
				threadingByTablet,
			} = state;
			const newWeavingStartRow = action.payload;

			const offsetThreadingByTablets = buildTwillOffsetThreading({
				holes,
				numberOfTablets,
				picks,
				threadingByTablet,
				'weavingStartRow': newWeavingStartRow,
			});

			return updeep({
				'patternDesign': {
					offsetThreadingByTablets,
					'weavingStartRow': newWeavingStartRow,
				},
			}, state);
		}

		case UPDATE_FREEHAND_CELL_THREAD: {
			const {
				row,
				tablet,
				threadColor,
				threadShape,
			} = action.payload;

			return updeep({ 'patternDesign': { 'freehandChart': { [row]: { [tablet]: { threadColor, threadShape } } } } }, state);
		}

		case UPDATE_FREEHAND_CELL_DIRECTION: {
			const {
				row,
				tablet,
			} = action.payload;

			// toggle cel direction
			const cell = state.patternDesign.freehandChart[row][tablet];
			const direction = cell.direction === 'F' ? 'B' : 'F';

			return updeep({ 'patternDesign': { 'freehandChart': { [row]: { [tablet]: { direction } } } } }, state);
		}

		case SET_IS_EDITING_WEAVING: {
			return updeep({ 'isEditingWeaving': action.payload }, state);
		}

		case SET_IS_EDITING_THREADING: {
			return updeep({ 'isEditingThreading': action.payload }, state);
		}

		case SET_UPDATE_PREVIEW_WHILE_EDITING: {
			return updeep({ 'updatePreviewWhileEditing': action.payload }, state);
		}

		case UPDATE_THREADING_CELL: {
			const {
				colorIndex,
				holesToSet,
				newOffsetThreadingForTablet,
				tablet,
			} = action.payload;

			const {
				patternType,
			} = state;

			const update = {
				'threadingByTablet': {
					[tablet]: {},
				},
			};

			if (patternType === 'brokenTwill') {
				update.patternDesign = { 'offsetThreadingByTablets': { [tablet]: newOffsetThreadingForTablet } };
			}

			holesToSet.forEach((holeIndex) => {
				update.threadingByTablet[tablet][holeIndex] = colorIndex;
			});

			return updeep(update, state);
		}

		case UPDATE_ORIENTATION: {
			const { tablet, tabletOrientation } = action.payload;
			const { patternType, weavingInstructionsByTablet } = state;

			const update = {
				'orientations': { [tablet]: tabletOrientation },
			};

			if (patternType !== 'freehand') { // freehand doesn't calculate picks
				// to calculate new picks for this tablet
				const weavingInstructionsForTablet = [...weavingInstructionsByTablet[tablet]];

				const picksForTablet = calculatePicksForTablet({
					'currentPicks': state.picks[tablet],
					weavingInstructionsForTablet,
					'row': 0,
				});

				update.picks = { [tablet]: picksForTablet };
			}

			return updeep(update, state);
		}

		case UPDATE_PALETTE_COLOR: {
			const { colorHexValue, colorIndex } = action.payload;

			return updeep({
				'palette': { [colorIndex]: colorHexValue },
			}, state);
		}

		case UPDATE_HOLE_HANDEDNESS: {
			const currentHandedness = state.patternDesign.holeHandedness;

			// toggle handedness
			const newHandedness = currentHandedness === 'anticlockwise' ? 'clockwise' : 'anticlockwise';

			return updeep({
				'patternDesign': { 'holeHandedness': newHandedness },
			}, state);
		}

		case UPDATE_ADD_WEAVING_ROWS: {
			const { chartCell, insertNRows, insertRowsAt } = action.payload;
			const {
				numberOfRows,
				numberOfTablets,
				patternDesign,
				patternType,
				picks,
				weavingInstructionsByTablet,
			} = state;

			const newNumberOfRows = numberOfRows + insertNRows;

			const update = {
				'numberOfRows': newNumberOfRows,
			};

			const newPicks = [];
			const newWeavingInstructionsByTablet = [];

			switch (patternType) {
				// each tablet is independent so just remove it
				case 'individual':
				case 'allTogether':
					// individual weaving instruction
					const obj = {
						'direction': DEFAULT_DIRECTION,
						'numberOfTurns': DEFAULT_NUMBER_OF_TURNS,
					};

					for (let i = 0; i < numberOfTablets; i += 1) {
						const newWeavingInstructionsForTablet = [...weavingInstructionsByTablet[i]];

						for (let j = 0; j < insertNRows; j += 1) {
							newWeavingInstructionsForTablet.splice(insertRowsAt, 0, obj);
						}

						const picksForTablet = calculatePicksForTablet({
							'currentPicks': picks[i],
							'weavingInstructionsForTablet': newWeavingInstructionsForTablet,
							'row': insertRowsAt,
						});

						newWeavingInstructionsByTablet.push(newWeavingInstructionsForTablet);
						newPicks.push(picksForTablet);
					}

					if (patternType === 'allTogether') {
						// update patternDesign for patterns will be used for UI
						const newPatternDesignRows = [];
						let newWeavingInstructions = [];

						for (let i = 0; i < insertNRows; i += 1) {
							newPatternDesignRows.push(DEFAULT_DIRECTION);
						}
						newWeavingInstructions = patternDesign.weavingInstructions.concat(newPatternDesignRows);
						update.patternDesign = { 'weavingInstructions': newWeavingInstructions };
					}

					update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
					update.picks = newPicks;

					break;

				case 'brokenTwill':
					const {
						twillDirection,
						twillPatternChart,
						twillDirectionChangeChart,
					} = patternDesign;

					const newTwillPatternChart = [...twillPatternChart];
					const newTwillDirectionChangeChart = [...twillDirectionChangeChart];

					for (let i = 0; i < insertNRows / 2; i += 1) {
						const chartPosition = ((insertRowsAt) / 2);

						const newRow1 = new Array(numberOfTablets);
						newRow1.fill('.');
						newTwillPatternChart.splice(chartPosition, 0, newRow1);

						const newRow2 = new Array(numberOfTablets);
						newRow2.fill('.');
						newTwillDirectionChangeChart.splice(chartPosition, 0, newRow2);
					}

					// calculate weaving from new row onwards
					for (let i = 0; i < numberOfTablets; i += 1) {
						const weavingInstructionsForTablet = [...weavingInstructionsByTablet[i]];

						const newWeavingInstructionsForTablet = buildTwillWeavingInstructionsForTablet({
							'numberOfRows': newNumberOfRows,
							'patternDesign': {
								twillDirection,
								'twillPatternChart': newTwillPatternChart,
								'twillDirectionChangeChart': newTwillDirectionChangeChart,
							},
							'startRow': insertRowsAt,
							'tabletIndex': i,
							weavingInstructionsForTablet,
						});

						const picksForTablet = calculatePicksForTablet({
							'weavingInstructionsForTablet': newWeavingInstructionsForTablet,
							'row': 0,
						});

						newWeavingInstructionsByTablet.push(newWeavingInstructionsForTablet);
						newPicks.push(picksForTablet);
					}

					update.patternDesign = {
						'twillPatternChart': newTwillPatternChart,
						'twillDirectionChangeChart': newTwillDirectionChangeChart,
					};

					update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
					update.picks = newPicks;

					break;

				case 'freehand':
					const {
						freehandChart,
					} = patternDesign;

					const newWeavingChart = [...freehandChart];

					for (let i = 0; i < insertNRows; i += 1) {
						const newChartRow = [];

						for (let j = 0; j < numberOfTablets; j += 1) {
							newChartRow.push(chartCell);
						}

						newWeavingChart.splice(insertRowsAt + i, 0, newChartRow);
					}

					update.patternDesign = {
						'freehandChart': newWeavingChart,
					};

					break;

				default:
					break;
			}

			return updeep(update, state);
		}

		case UPDATE_REMOVE_WEAVING_ROWS: {
			const { removeNRows, removeRowsAt } = action.payload;
			const {
				numberOfRows,
				numberOfTablets,
				patternDesign,
				patternType,
				weavingInstructionsByTablet,
			} = state;

			const newNumberOfRows = numberOfRows - removeNRows;

			const update = {
				'numberOfRows': newNumberOfRows,
			};

			const newPicks = [];
			const newWeavingInstructionsByTablet = [];

			switch (patternType) {
				// each tablet is independent so just remove it
				case 'individual':
				case 'allTogether':
					for (let i = 0; i < numberOfTablets; i += 1) {
						const newWeavingInstructionsForTablet = [...weavingInstructionsByTablet[i]];

						newWeavingInstructionsForTablet.splice(removeRowsAt, removeNRows);

						const picksForTablet = calculatePicksForTablet({
							'currentPicks': state.picks[i],
							'weavingInstructionsForTablet': newWeavingInstructionsForTablet,
							'row': removeRowsAt,
						});

						newWeavingInstructionsByTablet.push(newWeavingInstructionsForTablet);
						newPicks.push(picksForTablet);
					}

					if (patternType === 'allTogether') {
						const newWeavingInstructions = [...patternDesign.weavingInstructions];

						newWeavingInstructions.splice(removeRowsAt - removeNRows + 1, removeNRows);
						update.patternDesign = { 'weavingInstructions': newWeavingInstructions };
					}

					break;

				case 'brokenTwill':
					const {
						twillDirection,
						twillPatternChart,
						twillDirectionChangeChart,
					} = patternDesign;

					const newTwillPatternChart = [...twillPatternChart];
					const newTwillDirectionChangeChart = [...twillDirectionChangeChart];

					newTwillPatternChart.splice(removeRowsAt / 2, removeNRows / 2);
					newTwillDirectionChangeChart.splice(removeRowsAt / 2, removeNRows / 2);

					// odd rows of twill charts cannot start with 'X'
					for (let i = 1; i < numberOfTablets; i += 2) {
						newTwillPatternChart[0] = [...newTwillPatternChart[0]];
						newTwillDirectionChangeChart[0] = [...newTwillDirectionChangeChart[0]];

						newTwillPatternChart[0][i] = '.';
						newTwillDirectionChangeChart[0][i] = '.';
					}

					// calculate weaving from removed row onwards
					for (let i = 0; i < numberOfTablets; i += 1) {
						const weavingInstructionsForTablet = [...weavingInstructionsByTablet[i]];

						const newWeavingInstructionsForTablet = buildTwillWeavingInstructionsForTablet({
							'numberOfRows': newNumberOfRows,
							'patternDesign': {
								twillDirection,
								'twillPatternChart': newTwillPatternChart,
								'twillDirectionChangeChart': newTwillDirectionChangeChart,
							},
							'startRow': removeRowsAt,
							'tabletIndex': i,
							weavingInstructionsForTablet,
						});

						const picksForTablet = calculatePicksForTablet({
							'weavingInstructionsForTablet': newWeavingInstructionsForTablet,
							'row': 0,
						});

						newWeavingInstructionsByTablet.push(newWeavingInstructionsForTablet);
						newPicks.push(picksForTablet);
					}

					update.patternDesign = {
						'twillPatternChart': newTwillPatternChart,
						'twillDirectionChangeChart': newTwillDirectionChangeChart,
					};

					break;

				case 'freehand':
					const {
						freehandChart,
					} = patternDesign;
					const newFreehandChart = [...freehandChart];

					newFreehandChart.splice(removeRowsAt, removeNRows);

					update.patternDesign = {
						'freehandChart': newFreehandChart,
					};

					break;

				default:
					break;
			}

			update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
			update.picks = newPicks;

			return updeep(update, state);
		}

		case UPDATE_ADD_TABLETS: {
			const { colorIndex, insertNTablets, insertTabletsAt } = action.payload;
			const {
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				patternDesign,
				patternType,
				picks,
				threadingByTablet,
				weavingInstructionsByTablet,
			} = state;

			const newThreadingByTablet = [...threadingByTablet];
			const newOrientations = [...orientations];
			const newNumberOfTablets = numberOfTablets + insertNTablets;

			// build update for updeep / state
			const update = {
				'numberOfTablets': newNumberOfTablets,
				'orientations': newOrientations,
				'threadingByTablet': newThreadingByTablet,
			};

			let newWeavingInstructionsByTablet;
			let newPicks;

			if (patternType !== 'freehand') {
				newWeavingInstructionsByTablet = [...weavingInstructionsByTablet];
				newPicks = [...picks];

				update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
				update.picks = newPicks;
			}

			// threading chart is the same for all these patterns
			switch (patternType) {
				case 'individual':
				case 'allTogether':
				case 'freehand':
					for (let i = 0; i < insertNTablets; i += 1) {
						// update orientations
						newOrientations.splice(insertTabletsAt, 0, DEFAULT_ORIENTATION);

						// update threading
						const newThreadingTablet = [];
						for (let j = 0; j < holes; j += 1) {
							newThreadingTablet.push(colorIndex);
						}

						newThreadingByTablet.splice(insertTabletsAt, 0, newThreadingTablet);
					}
					break;

				default:
					break;
			}

			switch (patternType) {
				case 'individual':
				case 'allTogether':
					for (let i = 0; i < insertNTablets; i += 1) {
						const newWeavingInstructionsForTablet = [];
						for (let j = 0; j < numberOfRows; j += 1) {
							let direction;
							let numberOfTurns;

							if (patternType === 'individual') {
								direction = DEFAULT_DIRECTION;
								numberOfTurns = DEFAULT_NUMBER_OF_TURNS;
							} else if (patternType === 'allTogether') {
								direction = patternDesign.weavingInstructions[j];
								numberOfTurns = 1;
							}

							const obj = {
								direction,
								numberOfTurns,
							};
							newWeavingInstructionsForTablet.push(obj);
						}

						newWeavingInstructionsByTablet.splice(insertTabletsAt, 0, newWeavingInstructionsForTablet);

						const picksForTablet = calculatePicksForTablet({
							'weavingInstructionsForTablet': newWeavingInstructionsByTablet[insertTabletsAt],
							'row': 0,
							numberOfRows,
						});

						newPicks.splice(insertTabletsAt, 0, picksForTablet);
					}
					break;

				case 'brokenTwill':
					const {
						offsetThreadingByTablets,
						twillDirection,
						twillPatternChart,
						twillDirectionChangeChart,
						weavingStartRow,
					} = patternDesign;
					const chartLength = twillPatternChart.length;
					const newTwillPatternChart = [...twillPatternChart];
					const newTwillDirectionChangeChart = [...twillDirectionChangeChart];
					const newOffsetThreading = [...offsetThreadingByTablets];

					// orientations
					for (let i = 0; i < insertNTablets; i += 1) {
						// set orientation of new tablet
						newOrientations.splice(insertTabletsAt, 0, DEFAULT_ORIENTATION);

						// insert new tablet to twill design charts
						// these are by row, tablet
						for (let j = 0; j < chartLength; j += 1) {
							newTwillPatternChart[j] = [...newTwillPatternChart[j]];
							newTwillPatternChart[j].splice(insertTabletsAt, 0, '.');

							newTwillDirectionChangeChart[j] = [...newTwillDirectionChangeChart[j]];
							newTwillDirectionChangeChart[j].splice(insertTabletsAt, 0, '.');
						}
					}

					// add the new tablets to threading.
					// find the foreground / background colour for each tablet from the change onwards
					const colorsForRolesByTablet = getColorsForRolesByTablet({
						holes,
						numberOfTablets,
						'startAt': insertTabletsAt,
						'threading': threadingByTablet,
						'threadingStructure': 'byTablet',
					});

					// insert the new tablets
					for (let i = insertTabletsAt; i < insertTabletsAt + insertNTablets; i += 1) {
						const newThreadingForTablet = [];

						for (let j = 0; j < holes; j += 1) {
							const colorRole = BROKEN_TWILL_THREADING[j][i % holes];
							newThreadingForTablet.push(colorRole === 'F' ? BROKEN_TWILL_FOREGROUND : BROKEN_TWILL_BACKGROUND);
						}

						newThreadingByTablet.splice(i, 0, newThreadingForTablet);
					}

					// reset the threading of the subsequence tablets
					for (let i = 0; i < colorsForRolesByTablet.length; i += 1) {
						const { B, F } = colorsForRolesByTablet[i];

						const tabletIndex = i + insertTabletsAt + insertNTablets;

						newThreadingByTablet[tabletIndex] = [];

						for (let j = 0; j < holes; j += 1) {
							const colorRole = BROKEN_TWILL_THREADING[j][tabletIndex % holes];

							newThreadingByTablet[tabletIndex].push(colorRole === 'F' ? F : B);
						}
					}

					// calculate weaving for new and subsequent tablets
					for (let i = insertTabletsAt; i < newNumberOfTablets; i += 1) {
						const newWeavingInstructions = buildTwillWeavingInstructionsForTablet({
							numberOfRows,
							'patternDesign': {
								twillDirection,
								'twillPatternChart': newTwillPatternChart,
								'twillDirectionChangeChart': newTwillDirectionChangeChart,
							},
							'startRow': 0, // reweave entire tablet
							'tabletIndex': i,
						});

						newPicks[i] = calculatePicksForTablet({
							'weavingInstructionsForTablet': newWeavingInstructions,
							'row': 0,
						});

						// add the new tablets to offset threading - this depends on picks
						newOffsetThreading[i] = buildTwillOffsetThreadingForTablet({
							holes,
							'pick': newPicks[i],
							'threadingForTablet': newThreadingByTablet[i],
							weavingStartRow,
						});
					}

					update.patternDesign = {
						'offsetThreadingByTablets': newOffsetThreading,
						'twillPatternChart': newTwillPatternChart,
						'twillDirectionChangeChart': newTwillDirectionChangeChart,
					};
					break;

				case 'freehand':
					const { freehandChart } = patternDesign;
					const newFreehandChart = [...freehandChart];

					for (let i = 0; i < insertNTablets; i += 1) {
						for (let j = 0; j < numberOfRows; j += 1) {
							const newChartCell = { ...DEFAULT_FREEHAND_CELL };
							newChartCell.threadColor = colorIndex;

							newFreehandChart[j] = [...newFreehandChart[j]];
							newFreehandChart[j].splice(insertTabletsAt, 0, newChartCell);
						}
					}

					update.patternDesign = {
						'freehandChart': newFreehandChart,
					};

					break;

				default:
					break;
			}

			return updeep(update, state);
		}

		case UPDATE_REMOVE_TABLET: {
			const { tablet } = action.payload;
			const {
				holes,
				numberOfRows,
				numberOfTablets,
				orientations,
				patternDesign,
				patternType,
				picks,
				threadingByTablet,
				weavingInstructionsByTablet,
			} = state;

			let newWeavingInstructionsByTablet;
			let newPicks;

			const newThreadingByTablet = [...threadingByTablet];
			const newOrientations = [...orientations];
			const newNumberOfTablets = numberOfTablets - 1;

			// build update for updeep / state
			const update = {
				'numberOfTablets': newNumberOfTablets,
				'orientations': newOrientations,
				'threadingByTablet': newThreadingByTablet,
			};

			if (patternType !== 'freehand') {
				newWeavingInstructionsByTablet = [...weavingInstructionsByTablet];
				newPicks = [...picks];

				update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
				update.picks = newPicks;
			}

			switch (patternType) {
				// each tablet is independent so just remove it
				case 'individual':
				case 'allTogether':
					newOrientations.splice(tablet, 1);
					newPicks.splice(tablet, 1);
					newWeavingInstructionsByTablet.splice(tablet, 1);
					newThreadingByTablet.splice(tablet, 1);
					break;

				case 'brokenTwill':
					const {
						offsetThreadingByTablets,
						twillDirection,
						twillPatternChart,
						twillDirectionChangeChart,
						weavingStartRow,
					} = patternDesign;
					const chartLength = twillPatternChart.length;
					const newTwillPatternChart = [...twillPatternChart];
					const newTwillDirectionChangeChart = [...twillDirectionChangeChart];
					const newOffsetThreading = [...offsetThreadingByTablets];

					newOrientations.pop(); // all tablets have the same orientation
					newWeavingInstructionsByTablet.pop(); // this will be rewoven
					newPicks.pop(); // this will be rewoven
					newOffsetThreading.pop(); // this will be recalculated

					// remove the tablet from threading
					// find the foreground / background colour for each tablet from the change onwards
					const colorsForRolesByTablet = getColorsForRolesByTablet({
						holes,
						numberOfTablets,
						'startAt': tablet + 1,
						'threading': threadingByTablet,
						'threadingStructure': 'byTablet',
					});

					// shorten the threading array
					newThreadingByTablet.pop();

					// reset the threading of the subsequence tablets
					for (let i = 0; i < colorsForRolesByTablet.length; i += 1) {
						const { B, F } = colorsForRolesByTablet[i];
						const tabletIndex = i + tablet;

						newThreadingByTablet[tabletIndex] = [];

						for (let j = 0; j < holes; j += 1) {
							const colorRole = BROKEN_TWILL_THREADING[j][tabletIndex % holes];

							newThreadingByTablet[tabletIndex].push(colorRole === 'F' ? F : B);
						}
					}

					// design charts are by row, tablet
					// for each row, remove the tablet
					for (let i = 0; i < chartLength; i += 1) {
						newTwillPatternChart[i] = [...newTwillPatternChart[i]];
						newTwillPatternChart[i].splice(tablet, 1);

						newTwillDirectionChangeChart[i] = [...newTwillDirectionChangeChart[i]];
						newTwillDirectionChangeChart[i].splice(tablet, 1);
					}

					// calculate weaving from removed tablet onwards
					for (let i = tablet; i < newNumberOfTablets; i += 1) {
						newWeavingInstructionsByTablet = buildTwillWeavingInstructionsForTablet({
							numberOfRows,
							'patternDesign': {
								twillDirection,
								'twillPatternChart': newTwillPatternChart,
								'twillDirectionChangeChart': newTwillDirectionChangeChart,
							},
							'startRow': 0, // reweave entire tablet
							'tabletIndex': i,
						});

						newPicks[i] = calculatePicksForTablet({
							'weavingInstructionsForTablet': newWeavingInstructionsByTablet,
							'row': 0,
						});

						// calculate offset threading from removed tablet onwards
						newOffsetThreading[i] = buildTwillOffsetThreadingForTablet({
							holes,
							'pick': newPicks[i],
							'threadingForTablet': newThreadingByTablet[i],
							weavingStartRow,
						});
					}

					update.patternDesign = {
						'offsetThreadingByTablets': newOffsetThreading,
						'twillPatternChart': newTwillPatternChart,
						'twillDirectionChangeChart': newTwillDirectionChangeChart,
					};

					break;

				case 'freehand':
					newOrientations.splice(tablet, 1);
					newThreadingByTablet.splice(tablet, 1);

					const { freehandChart } = patternDesign;
					const newFreehandChart = [...freehandChart];

					// freehand chart is by row, tablet
					// for each row, remove the tablet
					for (let i = 0; i < numberOfRows; i += 1) {
						newFreehandChart[i] = [...newFreehandChart[i]];
						newFreehandChart[i].splice(tablet, 1);
					}

					update.patternDesign = {
						'freehandChart': newFreehandChart,
					};

					break;

				default:
					break;
			}

			return updeep(update, state);
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
