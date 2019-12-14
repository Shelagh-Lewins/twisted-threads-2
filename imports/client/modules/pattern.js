// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state
// import * as svg from 'save-svg-as-png';
import { logErrors, clearErrors } from './errors';

const updeep = require('updeep');

// ////////////////////////////////
// Action creators

// define action types so they are visible
// and export them so other reducers can use them
export const GET_PATTERN_COUNT = 'GET_PATTERN_COUNT';
export const SET_PATTERN_COUNT = 'SET_PATTERN_COUNT';
export const SET_ISLOADING = 'SET_ISLOADING';

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
// Action that call Meteor methods; these do not change the Store but are located here in order to keep server interactions away from UI

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

		history.push(`/`);
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
export function editWeavingCellDirection({
	_id,
	row,
	tablet,
	direction,
}) {
	return () => {
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
	};
}

export function editWeavingCellNumberOfTurns({
	_id,
	row,
	tablet,
	numberOfTurns,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editWeavingCellNumberOfTurns',
				row,
				tablet,
				numberOfTurns,
			},
		});
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
export function editThreadingCell({
	_id,
	hole,
	tablet,
	colorIndex,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'editThreadingCell',
				hole,
				tablet,
				colorIndex,
			},
		});
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
export function editOrientation({
	_id,
	tablet,
}) {
	return () => {
		Meteor.call('pattern.edit', {
			_id,
			'data': {
				'type': 'orientation',
				tablet,
			},
		});
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

// ///////////////////////////
// default state
const initialPatternState = {
	'currentPageNumber': 0,
	'error': null,
	'isLoading': true,
	'patternCount': 0,
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

		default:
			return state;
	}
}
