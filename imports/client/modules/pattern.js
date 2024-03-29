// Partial store for Pattern collection in database e.g. actions to call a method to edit a pattern

// And also for Pattern page state
// import * as svg from 'save-svg-as-png';
import { createSelector } from 'reselect';
// import createCachedSelector from 're-reselect';
import { logErrors, clearErrors } from './errors';
import {
  buildDoubleFacedWeavingInstructionsForTablet,
  buildOffsetThreadingForTablet,
  buildOffsetThreading,
  buildTwillWeavingInstructionsForTablet,
  buildWeavingInstructionsByTablet,
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
  DOUBLE_FACED_FOREGROUND,
  DOUBLE_FACED_BACKGROUND,
  DOUBLE_FACED_THREADING,
  MAX_TABLETS,
} from '../../modules/parameters';
import getColorsForRolesByTablet from '../../modules/getColorsForRolesByTablet';
import patternAsText from './patternAsText';
import newPatternFromFile from './newPatternFromFile';
import getDoubleFacedOrientation from '../../modules/getDoubleFacedOrientation';

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

// 'doubleFaced' patternType
export const UPDATE_DOUBLE_FACED_CHART = 'UPDATE_DOUBLE_FACED_CHART';

// 'brokenTwill' patternType
export const UPDATE_TWILL_CHART = 'UPDATE_TWILL_CHART';
export const UPDATE_TWILL_WEAVING_START_ROW = 'UPDATE_TWILL_WEAVING_START_ROW';

// 'freehand' patternType
export const UPDATE_FREEHAND_CELL_THREAD = 'UPDATE_FREEHAND_CELL_THREAD';
export const UPDATE_FREEHAND_CELL_DIRECTION = 'UPDATE_FREEHAND_CELL_DIRECTION';

// more than one patternType
export const SET_UPDATE_PREVIEW_WHILE_EDITING =
  'SET_UPDATE_PREVIEW_WHILE_EDITING';
export const UPDATE_THREADING_CELL = 'UPDATE_THREADING_CELL';
export const UPDATE_INCLUDE_IN_TWIST = 'UPDATE_INCLUDE_IN_TWIST';
export const UPDATE_ORIENTATION = 'UPDATE_ORIENTATION';
export const UPDATE_PALETTE_COLOR = 'UPDATE_PALETTE_COLOR';
export const UPDATE_HOLE_HANDEDNESS = 'UPDATE_HOLE_HANDEDNESS';

export const UPDATE_ADD_WEAVING_ROWS = 'UPDATE_ADD_WEAVING_ROWS';
export const UPDATE_REMOVE_WEAVING_ROWS = 'UPDATE_REMOVE_WEAVING_ROWS';
export const UPDATE_ADD_TABLETS = 'UPDATE_ADD_TABLETS';
export const UPDATE_REMOVE_TABLET = 'UPDATE_REMOVE_TABLET';

export const SET_FILTER_IS_TWIST_NEUTRAL = 'SET_FILTER_IS_TWIST_NEUTRAL';
export const SET_FILTER_MAX_TABLETS = 'SET_FILTER_MAX_TABLETS';
export const SET_FILTER_MIN_TABLETS = 'SET_FILTER_MIN_TABLETS';
export const SET_FILTER_WILL_REPEAT = 'SET_FILTER_WILL_REPEAT';
export const REMOVE_TABLET_FILTER = 'REMOVE_TABLET_FILTER';

// tracking aids
export const SET_SHOW_TABLET_GUIDES = 'SET_SHOW_TABLET_GUIDES';
export const SET_SHOW_CENTER_GUIDE = 'SET_SHOW_CENTER_GUIDE';
export const UPDATE_TABLET_GUIDES = 'UPDATE_TABLET_GUIDES';

// ////////////////////////////
// Actions that change the Store

// used in pagination
// should the pattern count only include patterns belonging to a particular user?
// userId is mainly used for filters, so number of patterns can be checked without the component knowing the userId
export function setPatternCountUserId(userId) {
  return {
    type: SET_PATTERN_COUNT_USERID,
    payload: userId,
  };
}

export function setPatternCount(patternCount) {
  return {
    type: SET_PATTERN_COUNT,
    payload: patternCount,
  };
}

// use this function when the userId hasn't changed, just the number of tablets, e.g. filters
export const getPatternCount = () => (dispatch, getState) => {
  const {
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
    patternCountUserId,
  } = getState().pattern;

  Meteor.call(
    'pattern.getPatternCount',
    {
      filterIsTwistNeutral,
      filterMaxTablets,
      filterMinTablets,
      filterWillRepeat,
      userId: patternCountUserId,
    },
    (error, result) => {
      if (error) {
        return dispatch(logErrors({ 'get pattern count': error.reason }));
      }

      dispatch(setPatternCount(result));
    },
  );
};

// User.js needs to set pattern count immediately
export const updatePatternCountUserId = (userId) => (dispatch, getState) => {
  const {
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
  } = getState().pattern;

  // better to show no pagination briefly than pagination from previous page
  dispatch(setPatternCount(0));
  dispatch(setPatternCountUserId(userId));

  Meteor.call(
    'pattern.getPatternCount',
    {
      filterIsTwistNeutral,
      filterMaxTablets,
      filterMinTablets,
      filterWillRepeat,
      userId,
    },
    (error, result) => {
      if (error) {
        return dispatch(logErrors({ 'update pattern count': error.reason }));
      }

      dispatch(setPatternCount(result));
    },
  );
};

// waiting for data subscription to be ready
export function setIsLoading(isLoading) {
  return {
    type: SET_ISLOADING,
    payload: isLoading,
  };
}

export function setIsEditingWeaving(isEditingWeaving) {
  return {
    type: SET_IS_EDITING_WEAVING,
    payload: isEditingWeaving,
  };
}

export function setIsEditingThreading(isEditingThreading) {
  return {
    type: SET_IS_EDITING_THREADING,
    payload: isEditingThreading,
  };
}

// //////////////////////////////
// save pattern data in store for calculating charts
export function setPatternId(_id) {
  return {
    type: SET_PATTERN_ID,
    payload: _id,
  };
}
// build and save the weaving instructions from pattern design
export function setWeavingInstructions(weavingInstructionsByTablet) {
  return {
    type: SET_WEAVING_INSTRUCTIONS,
    payload: weavingInstructionsByTablet,
  };
}

export function clearPatternData() {
  return {
    type: CLEAR_PATTERN_DATA,
    payload: false,
  };
}

export function setPatternData({
  picks,
  patternDesign,
  patternObj,
  threadingByTablet,
}) {
  const {
    createdBy,
    holes,
    includeInTwist,
    numberOfRows,
    numberOfTablets,
    orientations,
    palette,
    patternType,
    tabletGuides,
  } = patternObj;

  const defaultTabletGuides = new Array(numberOfTablets);
  defaultTabletGuides.fill(false);

  return {
    type: SET_PATTERN_DATA,
    payload: {
      createdBy,
      holes,
      includeInTwist,
      tabletGuides: tabletGuides || defaultTabletGuides,
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
  const { numberOfRows, numberOfTablets, patternDesign, patternType } =
    patternObj;
  const weavingInstructionsByTablet =
    buildWeavingInstructionsByTablet(patternObj);

  dispatch(setWeavingInstructions(weavingInstructionsByTablet));

  const threadingByTablet = getThreadingByTablet(patternObj);

  let picks;

  switch (patternType) {
    // all simulation patterns
    case 'individual':
    case 'allTogether':
    case 'doubleFaced':
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

  dispatch(
    setPatternData({
      picks,
      patternDesign,
      patternObj,
      threadingByTablet,
    }),
  );
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
  const { numberOfRows, patternDesign, patternType } = state.pattern;

  let numberOfRowsForChart = numberOfRows || 0;

  if (patternType === 'brokenTwill') {
    numberOfRowsForChart = numberOfRows - patternDesign.weavingStartRow + 1;
  }

  return numberOfRowsForChart;
};

export const getNumberOfTablets = (state) => state.pattern.numberOfTablets || 0;

export const getHoles = (state) => state.pattern.holes;

export const getPalette = (state) => state.pattern.palette;

export const getHoleHandedness = (state) =>
  state.pattern.patternDesign
    ? state.pattern.patternDesign.holeHandedness
    : undefined;

export const getPicks = (state) => state.pattern.picks;

export const getPicksForChart = (state) => {
  const { patternDesign, patternType } = state.pattern;

  const picks = [...state.pattern.picks];

  if (patternType === 'brokenTwill') {
    for (let i = 0; i < picks.length; i += 1) {
      picks[i] = [...picks[i]];
      picks[i].splice(0, patternDesign.weavingStartRow - 1);
    }
  }

  return picks;
};

export const getPick = (state, tabletIndex, rowIndex) =>
  state.pattern.picks[tabletIndex][rowIndex];

export const getPicksForTablet = (state, tabletIndex) =>
  state.pattern.picks[tabletIndex];

// picks may be truncated for broken twill
export const getPicksForTabletForChart = (state, tabletIndex) => {
  const { numberOfTablets, patternDesign, patternType } = state.pattern;

  let picksForTablet = [];

  if (tabletIndex < numberOfTablets) {
    // can happen when preview re-renders after remove tablet
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

export const getThreadingForTablet = (state, tabletIndex) =>
  state.pattern.threadingByTablet[tabletIndex];

// used for the threading chart
export const getThreadingForHole = ({
  holeIndex,
  selectedRow,
  state,
  tabletIndex,
}) => {
  const { threadingByTablet } = state.pattern;
  const { weavingStartRow } = state.pattern.patternDesign;

  if (threadingByTablet) {
    // broken twill displays an offset threading diagram
    // based on the weaving start row
    const { patternType } = state.pattern;

    let offsetThreadingByTablet = threadingByTablet;
    let currentRow = 1;

    // in the interactive weaving chart
    // update the threading chart for simulation patterns to show the current position of the tablets
    // top row of weaving chart is row 0 so don't use falsy as a test
    if (typeof selectedRow !== 'undefined' && patternType !== 'freehand') {
      currentRow = getNumberOfRowsForChart(state) - selectedRow;
    }

    if (typeof weavingStartRow !== 'undefined') {
      currentRow += weavingStartRow - 1; // if starting on row 3, this is offset 2 from row 1
    }

    if (currentRow) {
      const { holes, numberOfTablets, picks } = state.pattern;

      offsetThreadingByTablet = buildOffsetThreading({
        holes,
        numberOfTablets,
        picks,
        threadingByTablet,
        currentRow,
      });
    }

    return offsetThreadingByTablet[tabletIndex][holeIndex];
  }

  return undefined;
};

export const getTotalTurnsByTablet = (state) =>
  state.pattern.picks.map(
    (picksForTablet) =>
      picksForTablet[state.pattern.numberOfRows - 1].totalTurns,
  );

export const getIncludeInTwist = (state) => state.pattern.includeInTwist;

export const getIncludeInTwistForTablet = (state, tabletIndex) =>
  state.pattern.includeInTwist && state.pattern.includeInTwist[tabletIndex]; // freehand patterns do not have includeInTwist; avoid error.

export const getShowGuideForTablet = (state, tabletIndex) =>
  state.pattern.tabletGuides && state.pattern.tabletGuides[tabletIndex];

export const getOrientationForTablet = (state, tabletIndex) =>
  state.pattern.orientations[tabletIndex];

export const getIsEditing = (state) =>
  state.pattern.isEditingWeaving || state.pattern.isEditingThreading;

export const getPreviewShouldUpdate = (state) =>
  (!state.pattern.isEditingWeaving && !state.pattern.isEditingThreading) ||
  state.pattern.updatePreviewWhileEditing;

export const getShowTabletGuides = (state) => state.pattern.showTabletGuides;

export const getShowCenterGuide = (state) => state.pattern.showCenterGuide;

export const getStateThreadingByTablet = (state) =>
  state.pattern.threadingByTablet;

// ///////////////////////
// cached selectors to provide props without triggering re-render
export const getPatternTwistSelector = createSelector(
  getHoles,
  getIncludeInTwist,
  getNumberOfRows,
  getNumberOfTablets,
  getPatternDesign,
  getPatternType,
  getPicks,
  (
    holes,
    includeInTwist,
    numberOfRows,
    numberOfTablets,
    patternDesign,
    patternType,
    picks,
  ) =>
    findPatternTwist({
      holes,
      includeInTwist,
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
  (numberOfRows, patternDesign, patternType, picks) =>
    picks.map((picksForTablet) =>
      getTotalTurnsForTablet({
        numberOfRows,
        patternDesign,
        patternType,
        picksForTablet,
      }),
    ),
);

export const getThreadCounts = createSelector(
  getStateThreadingByTablet,
  getPalette,
  (threading) =>
    threading.flat().reduce((accumulator, currentValue) => {
      if (typeof accumulator[currentValue] === 'undefined') {
        accumulator[currentValue] = 1;
      } else {
        accumulator[currentValue] += 1;
      }

      return accumulator;
    }, {}),
);

export const getTotalThreads = createSelector(getThreadCounts, (threadCounts) =>
  Object.keys(threadCounts).reduce(
    (accumulator, currentValue) =>
      currentValue === '-1'
        ? accumulator
        : accumulator + threadCounts[currentValue],
    0,
  ),
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

  if (history) {
    // if deleting from Home page, no need to redirect
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
    replacement: '_',
    maxLength: 100000, // 0.1MB
  });

  const element = document.createElement('a');

  element.setAttribute(
    'href',
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`,
  );
  element.setAttribute('download', `${filename}.twt`);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
};

export const importPatternFromText =
  ({ filename, text, history }) =>
  (dispatch) => {
    dispatch(clearErrors());

    const { isValid, patternObj } = newPatternFromFile({ filename, text });

    // send to server
    if (isValid) {
      Meteor.call(
        'pattern.newPatternFromData',
        {
          patternObj,
        },
        (error, result) => {
          if (error) {
            return dispatch(
              logErrors({ 'add new pattern from data': error.reason }),
            );
          }

          history.push(`/pattern/${result}`);
        },
      );
    } else {
      dispatch(
        logErrors({
          'add new pattern from data':
            "file is not valid. Imported file must be a Twisted Threads or Guntram's Tablet Weaving Thingy file.",
        }),
      );
    }
  };

// Edit pattern
// Pattern as a whole
export function editIsPublic({ _id, isPublic }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editIsPublic',
          isPublic,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'edit is public': error.reason }));
        }
      },
    );
  };
}

// is pattern twist neutral?
export function editPatternIsTwistNeutral({ _id, patternIsTwistNeutral }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editIsTwistNeutral',
          isTwistNeutral: patternIsTwistNeutral,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'edit is twist neutral': error.reason }));
        }
      },
    );
  };
}

// will pattern repeat?
export function editPatternWillRepeat({ _id, patternWillRepeat }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editWillRepeat',
          willRepeat: patternWillRepeat,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'edit will repeat': error.reason }));
        }
      },
    );
  };
}

// Pattern charts
// Weaving (individual)
export function updateWeavingCellDirection(data) {
  return {
    type: UPDATE_WEAVING_CELL_DIRECTION,
    payload: data,
  };
}

// change direction of this row and all followiing rows
export function editWeavingCellDirection({ _id, row, tablet }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editWeavingCellDirection',
          row,
          tablet,
        },
        row,
        tablet,
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit weaving cell direction': error.reason }),
          );
        }
      },
    );

    dispatch(
      updateWeavingCellDirection({
        row,
        tablet,
      }),
    );
  };
}

// number of turns
export function updateWeavingCellNumberOfTurns(data) {
  return {
    type: UPDATE_WEAVING_CELL_TURNS,
    payload: data,
  };
}

export function editWeavingCellNumberOfTurns({
  _id,
  row,
  tablet,
  numberOfTurns,
}) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editWeavingCellNumberOfTurns',
          row,
          tablet,
          numberOfTurns,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit weaving cell turns': error.reason }),
          );
        }
      },
    );

    dispatch(
      updateWeavingCellNumberOfTurns({
        numberOfTurns,
        row,
        tablet,
      }),
    );
  };
}

// ///////////////////////////////
// allTogether
// number of turns
export function updateWeavingRowDirection(data) {
  return {
    type: UPDATE_WEAVING_ROW_DIRECTION,
    payload: data,
  };
}

export function editWeavingRowDirection({ _id, row }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editWeavingRowDirection',
          row,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit weaving row direction': error.reason }),
          );
        }
      },
    );

    dispatch(
      updateWeavingRowDirection({
        row,
      }),
    );
  };
}

// ///////////////////////////////
// doubleFaced
export function updateDoubleFacedChart(data) {
  return {
    type: UPDATE_DOUBLE_FACED_CHART,
    payload: data,
  };
}

export function editDoubleFacedChart({ _id, rowIndex, tabletIndex }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editDoubleFacedChart',
          _id,
          rowIndex,
          tabletIndex,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit double faced pattern chart': error.reason }),
          );
        }
      },
    );

    dispatch(
      updateDoubleFacedChart({
        _id,
        rowIndex,
        tabletIndex,
      }),
    );
  };
}

// ///////////////////////////////
// brokenTwill
export function updateTwillChart(data) {
  return {
    type: UPDATE_TWILL_CHART,
    payload: data,
  };
}

export function editTwillChart({
  _id,
  rowIndex,
  tabletIndex,
  twillChart, // which chart to update
}) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editTwillChart',
          _id,
          rowIndex,
          tabletIndex,
          twillChart,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit twill pattern chart': error.reason }),
          );
        }
      },
    );

    dispatch(
      updateTwillChart({
        _id,
        rowIndex,
        tabletIndex,
        twillChart,
      }),
    );
  };
}

// set weaving start row
export function updateTwillWeavingStartRow(data) {
  return {
    type: UPDATE_TWILL_WEAVING_START_ROW,
    payload: data,
  };
}

export function editTwillWeavingStartRow({ _id, weavingStartRow }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editTwillWeavingStartRow',
          _id,
          weavingStartRow,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit twill weaving start row': error.reason }),
          );
        }
      },
    );

    dispatch(updateTwillWeavingStartRow(weavingStartRow));
  };
}

// ///////////////////////////////
// freehand patterns

// set thread (colour and shape)
export function updateFreehandCellThread({
  row: rowIndex,
  tablet: tabletIndex,
  threadColor: selectedColorIndex,
  threadShape: selectedThread,
}) {
  return {
    type: UPDATE_FREEHAND_CELL_THREAD,
    payload: {
      row: rowIndex,
      tablet: tabletIndex,
      threadColor: selectedColorIndex,
      threadShape: selectedThread,
    },
  };
}

export function editFreehandCellThread({
  _id,
  row: rowIndex,
  tablet: tabletIndex,
  threadColor: selectedColorIndex,
  threadShape: selectedThread,
}) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editFreehandCellThread',
          _id,
          row: rowIndex,
          tablet: tabletIndex,
          threadColor: selectedColorIndex,
          threadShape: selectedThread,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit freehand cell thread': error.reason }),
          );
        }
      },
    );

    dispatch(
      updateFreehandCellThread({
        row: rowIndex,
        tablet: tabletIndex,
        threadColor: selectedColorIndex,
        threadShape: selectedThread,
      }),
    );
  };
}

// set background (white or grey)
export function updateFreehandCellDirection({
  row: rowIndex,
  tablet: tabletIndex,
}) {
  return {
    type: UPDATE_FREEHAND_CELL_DIRECTION,
    payload: {
      row: rowIndex,
      tablet: tabletIndex,
    },
  };
}

export function editFreehandCellDirection({
  _id,
  direction,
  row: rowIndex,
  tablet: tabletIndex,
}) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editFreehandCellDirection',
          _id,
          row: rowIndex,
          tablet: tabletIndex,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit freehand cell direction': error.reason }),
          );
        }
      },
    );

    dispatch(
      updateFreehandCellDirection({
        direction,
        row: rowIndex,
        tablet: tabletIndex,
      }),
    );
  };
}

// ///////////////////////////////
// add weaving rows
export function updateAddWeavingRows(data) {
  return {
    type: UPDATE_ADD_WEAVING_ROWS,
    payload: data,
  };
}

export function addWeavingRows({ _id, chartCell, insertNRows, insertRowsAt }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'addWeavingRows',
          chartCell,
          insertNRows,
          insertRowsAt,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'add weaving row': error.reason }));
        }
      },
    );

    dispatch(
      updateAddWeavingRows({
        chartCell,
        insertNRows,
        insertRowsAt,
      }),
    );
  };
}

// remove weaving rows
export function updateRemoveWeavingRows(data) {
  return {
    type: UPDATE_REMOVE_WEAVING_ROWS,
    payload: data,
  };
}

export function removeWeavingRows({ _id, removeNRows, removeRowsAt }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          removeNRows,
          removeRowsAt,
          type: 'removeWeavingRows',
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'remove weaving row': error.reason }));
        }
      },
    );

    dispatch(
      updateRemoveWeavingRows({
        removeNRows,
        removeRowsAt,
      }),
    );
  };
}

// Preview
export function setUpdatePreviewWhileEditing(data) {
  return {
    type: SET_UPDATE_PREVIEW_WHILE_EDITING,
    payload: data,
  };
}

// Tracking aids
export function setShowTabletGuides(data) {
  return {
    type: SET_SHOW_TABLET_GUIDES,
    payload: data,
  };
}

export function setShowCenterGuide(data) {
  return {
    type: SET_SHOW_CENTER_GUIDE,
    payload: data,
  };
}

// Threading
export function updateThreadingCell(data) {
  return {
    type: UPDATE_THREADING_CELL,
    payload: data,
  };
}

export function editThreadingCell({ _id, hole, tablet, colorIndex }) {
  return (dispatch, getState) => {
    const {
      holes,
      patternDesign: { weavingStartRow },
      patternType,
      picks,
      threadingByTablet,
    } = getState().pattern;
    let newOffsetThreadingForTablet; // only used for broken twill
    let newThreadingForTablet;
    let colorRole;

    const holesToSet = [];
    switch (patternType) {
      case 'doubleFaced':
        // set both holes with the role the user clicked
        // find the role of the clicked cell F / B
        colorRole = DOUBLE_FACED_THREADING[hole];

        // set the new colour for both affected cells in that tablet
        for (let i = 0; i < holes; i += 1) {
          if (DOUBLE_FACED_THREADING[i] === colorRole) {
            holesToSet.push(i);
          }
        }

        break;

      case 'brokenTwill':
        // set both holes with the role the user clicked
        // offset threading is displayed
        // find the threading cell clicked
        newThreadingForTablet = [...threadingByTablet[tablet]];
        let tabletOffset = 0;

        if (weavingStartRow > 1) {
          tabletOffset = picks[tablet][weavingStartRow - 2].totalTurns;
        }

        const originalHole = modulus(hole - tabletOffset, holes);

        // find the role of the clicked cell F / B
        colorRole = BROKEN_TWILL_THREADING[originalHole][tablet % holes];
        // set the new colour for both affected cells in that tablet

        for (let i = 0; i < holes; i += 1) {
          if (BROKEN_TWILL_THREADING[i][tablet % holes] === colorRole) {
            holesToSet.push(i);
            newThreadingForTablet[i] = colorIndex;
          }
        }

        // rebuild offset threading for that tablet
        newOffsetThreadingForTablet = buildOffsetThreadingForTablet({
          holes,
          pick: picks[tablet],
          threadingForTablet: newThreadingForTablet,
          weavingStartRow,
        });
        break;

      default: // other pattern types just set the hole the user clicked
        holesToSet.push(hole);
        break;
    }

    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'editThreadingCell',
          holesToSet,
          tablet,
          colorIndex,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit threading cell direction': error.reason }),
          );
        }
      },
    );

    dispatch(
      updateThreadingCell({
        colorIndex,
        holesToSet,
        newOffsetThreadingForTablet,
        tablet,
      }),
    );
  };
}

// add tablets
export function updateAddTablets(data) {
  return {
    type: UPDATE_ADD_TABLETS,
    payload: data,
  };
}

export function addTablets({
  _id,
  colorIndex,
  insertNTablets,
  insertTabletsAt,
}) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'addTablets',
          colorIndex,
          insertNTablets,
          insertTabletsAt,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'add tablets': error.reason }));
        }
      },
    );

    dispatch(
      updateAddTablets({
        colorIndex,
        insertNTablets,
        insertTabletsAt,
      }),
    );
  };
}

// remove tablet
export function updateRemoveTablet(data) {
  return {
    type: UPDATE_REMOVE_TABLET,
    payload: data,
  };
}

export function removeTablet({ _id, tablet }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        tablet,
        data: {
          type: 'removeTablet',
          tablet,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'remove tablet': error.reason }));
        }
      },
    );

    dispatch(
      updateRemoveTablet({
        tablet,
      }),
    );
  };
}

// Include tablet in twist calculations
export function updateIncludeInTwist(data) {
  return {
    type: UPDATE_INCLUDE_IN_TWIST,
    payload: data,
  };
}

export function editIncludeInTwist({ _id, tablet }) {
  return (dispatch, getState) => {
    const currentIncludeInTwist = getState().pattern.includeInTwist[tablet];

    const tabletIncludeInTwist = !currentIncludeInTwist;

    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'includeInTwist',
          tablet,
          tabletIncludeInTwist,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({
              'update include tablet in twist calculations': error.reason,
            }),
          );
        }
      },
    );

    dispatch(
      updateIncludeInTwist({
        tablet,
        tabletIncludeInTwist,
      }),
    );
  };
}

// Show guide line for tablet
export function updateTabletGuides(data) {
  return {
    type: UPDATE_TABLET_GUIDES,
    payload: data,
  };
}

export function editTabletGuides({ canSave, _id, tablet }) {
  return (dispatch, getState) => {
    const tabletGuide = !getState().pattern.tabletGuides[tablet];

    // Any user can set guides in the client
    // Only the pattern's owner can save guides to the pattern
    if (canSave) {
      Meteor.call(
        'pattern.edit',
        {
          _id,
          data: {
            type: 'tabletGuides',
            tablet,
            tabletGuide,
          },
        },
        (error) => {
          if (error) {
            return dispatch(
              logErrors({
                'update include tablet in twist calculations': error.reason,
              }),
            );
          }
        },
      );
    }

    dispatch(
      updateTabletGuides({
        tablet,
        tabletGuide,
      }),
    );
  };
}

// Tablet orientation
export function updateOrientation(data) {
  return {
    type: UPDATE_ORIENTATION,
    payload: data,
  };
}

export function editOrientation({ _id, tablet }) {
  return (dispatch, getState) => {
    const currentOrientation = getState().pattern.orientations[tablet];

    const tabletOrientation = currentOrientation === '\\' ? '/' : '\\';

    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'orientation',
          tablet,
          tabletOrientation,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'update orientation': error.reason }));
        }
      },
    );

    dispatch(
      updateOrientation({
        tablet,
        tabletOrientation,
      }),
    );
  };
}

// Palette color
export function updatePaletteColor(data) {
  return {
    type: UPDATE_PALETTE_COLOR,
    payload: data,
  };
}

export function editPaletteColor({ _id, colorHexValue, colorIndex }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'paletteColor',
          colorHexValue,
          colorIndex,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'edit palette color': error.reason }));
        }
      },
    );

    dispatch(
      updatePaletteColor({
        colorHexValue,
        colorIndex,
      }),
    );
  };
}

// hole handedness (freehand patterns only)
export function updateHoleHandedness(data) {
  return {
    type: UPDATE_HOLE_HANDEDNESS,
    payload: data,
  };
}

export function editHoleHandedness({ _id }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'holeHandedness',
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'edit hole handedness': error.reason }));
        }
      },
    );

    dispatch(updateHoleHandedness());
  };
}

// Weft Color
export function editWeftColor({ _id, colorIndex }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'weftColor',
          colorIndex,
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'edit weft colour': error.reason }));
        }
      },
    );
  };
}

// Preview orientation
export function editPreviewOrientation({ _id, orientation }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          type: 'previewOrientation',
          orientation,
        },
      },
      (error) => {
        if (error) {
          return dispatch(
            logErrors({ 'edit preview orientation': error.reason }),
          );
        }
      },
    );
  };
}

// editable text fields like name, description
export function editTextField({ _id, fieldName, fieldValue }) {
  return (dispatch) => {
    Meteor.call(
      'pattern.edit',
      {
        _id,
        data: {
          fieldName,
          fieldValue,
          type: 'editTextField',
        },
      },
      (error) => {
        if (error) {
          return dispatch(logErrors({ 'edit text field': error.reason }));
        }
      },
    );
  };
}

// ///////////////////////////
// filter pattern list on twist values
export function setFilterIsTwistNeutral(isTwistNeutral) {
  return {
    type: SET_FILTER_IS_TWIST_NEUTRAL,
    payload: isTwistNeutral,
  };
}

export function updateFilterIsTwistNeutral(isTwistNeutral) {
  return (dispatch) => {
    dispatch(setFilterIsTwistNeutral(isTwistNeutral));
    dispatch(getPatternCount());
  };
}

export function setFilterWillRepeat(willRepeat) {
  return {
    type: SET_FILTER_WILL_REPEAT,
    payload: willRepeat,
  };
}

export function updateFilterWillRepeat(willRepeat) {
  return (dispatch) => {
    dispatch(setFilterWillRepeat(willRepeat));
    dispatch(getPatternCount());
  };
}

// ///////////////////////////
// filter pattern list on number of tablets
export function setFilterMaxTablets(maxTablets) {
  return {
    type: SET_FILTER_MAX_TABLETS,
    payload: maxTablets,
  };
}

export function updateFilterMaxTablets(maxTablets) {
  return (dispatch, getState) => {
    const value = parseFloat(maxTablets, 10);

    if (
      value < 1 ||
      value > MAX_TABLETS ||
      !Number.isInteger(value) ||
      value <= getState().pattern.minTablets
    ) {
      return;
    }

    dispatch(setFilterMaxTablets(value));
    dispatch(getPatternCount());
  };
}

export function setFilterMinTablets(minTablets) {
  return {
    type: SET_FILTER_MIN_TABLETS,
    payload: minTablets,
  };
}

export function updateFilterMinTablets(minTablets) {
  return (dispatch, getState) => {
    const value = parseFloat(minTablets, 10);

    if (
      value < 1 ||
      value > MAX_TABLETS ||
      !Number.isInteger(value) ||
      value >= getState().pattern.maxTablets
    ) {
      return;
    }

    dispatch(setFilterMinTablets(value));
    dispatch(getPatternCount());
  };
}

export function removeTabletFilter() {
  return {
    type: REMOVE_TABLET_FILTER,
    payload: {
      maxTablets: undefined,
      minTablets: undefined,
    },
  };
}

export function updateFilterRemove() {
  return (dispatch) => {
    dispatch(removeTabletFilter());
    dispatch(getPatternCount());
  };
}

// ///////////////////////////
// default state
const initialPatternState = {
  createdBy: '',
  error: null,
  filterIsTwistNeutral: false,
  filterMaxTablets: undefined,
  filterMinTablets: undefined,
  filterWillRepeat: false,
  holes: 0,
  isEditingThreading: false,
  isEditingWeaving: false,
  isLoading: true,
  palette: [],
  patternCount: 0,
  patternCountUserId: undefined,
  patternDataReady: false,
  patternDesign: undefined,
  picks: [],
  threadingByTablet: undefined,
  updatePreviewWhileEditing: false,
  showTabletGuides: true,
  showCenterGuide: true,
};

// state updates
export default function pattern(state = initialPatternState, action) {
  switch (action.type) {
    case SET_PATTERN_COUNT: {
      return updeep({ patternCount: action.payload }, state);
    }

    case SET_PATTERN_COUNT_USERID: {
      return updeep({ patternCountUserId: action.payload }, state);
    }

    case SET_ISLOADING: {
      return updeep({ isLoading: action.payload }, state);
    }

    case SET_PATTERN_ID: {
      return updeep({ _id: action.payload }, state);
    }

    case SET_WEAVING_INSTRUCTIONS: {
      return updeep({ weavingInstructionsByTablet: action.payload }, state);
    }

    case CLEAR_PATTERN_DATA: {
      return updeep({ patternDataReady: false }, state);
    }

    case SET_PATTERN_DATA: {
      const {
        createdBy,
        holes,
        includeInTwist,
        numberOfRows,
        numberOfTablets,
        orientations,
        palette,
        patternDesign,
        patternType,
        picks,
        threadingByTablet,
        tabletGuides,
      } = action.payload;

      const update = {
        createdBy,
        holes,
        includeInTwist,
        numberOfRows,
        numberOfTablets,
        orientations,
        palette,
        patternDataReady: true,
        patternType,
        picks,
        threadingByTablet,
        tabletGuides,
      };

      update.patternDesign = updeep.constant(patternDesign); // completely replace patternDesign from any previous pattern
      return updeep(update, state);
    }

    case UPDATE_WEAVING_CELL_TURNS: {
      const { numberOfTurns, row, tablet } = action.payload;
      const { weavingInstructionsByTablet } = state;

      // to update the weaving instructions
      const obj = { ...weavingInstructionsByTablet[tablet][row] };

      obj.numberOfTurns = numberOfTurns;

      // to calculate new picks for this tablet
      const weavingInstructionsForTablet = [
        ...weavingInstructionsByTablet[tablet],
      ];

      weavingInstructionsForTablet[row] = obj;

      const picksForTablet = calculatePicksForTablet({
        currentPicks: state.picks[tablet],
        weavingInstructionsForTablet,
        row,
      });

      return updeep(
        {
          weavingInstructionsByTablet: { [tablet]: { [row]: obj } },
          picks: { [tablet]: picksForTablet },
        },
        state,
      );
    }

    case UPDATE_WEAVING_CELL_DIRECTION: {
      const { row, tablet } = action.payload;
      const { numberOfRows, weavingInstructionsByTablet } = state;

      const weavingInstructionsForTablet = [
        ...weavingInstructionsByTablet[tablet],
      ];

      // change direction of tablet for this row and all following rows
      for (let i = row; i < numberOfRows; i += 1) {
        const obj = { ...weavingInstructionsForTablet[i] };
        obj.direction =
          weavingInstructionsForTablet[i].direction === 'F' ? 'B' : 'F';
        weavingInstructionsForTablet[i] = obj;
      }

      const picksForTablet = calculatePicksForTablet({
        currentPicks: state.picks[tablet],
        weavingInstructionsForTablet,
        row,
      });

      return updeep(
        {
          weavingInstructionsByTablet: {
            [tablet]: weavingInstructionsForTablet,
          },
          picks: { [tablet]: picksForTablet },
        },
        state,
      );
    }

    case UPDATE_WEAVING_ROW_DIRECTION: {
      // 'allTogether' patterns only
      const { row } = action.payload;
      const { numberOfTablets, patternDesign, weavingInstructionsByTablet } =
        state;

      const newWeavingInstructions = [...patternDesign.weavingInstructions];
      const newWeavingInstructionsByTablet = [];
      const newPicks = [];

      // update pattern design for this row
      newWeavingInstructions[row] =
        newWeavingInstructions[row] === 'F' ? 'B' : 'F';

      // update weaving instructions for each tablet
      for (let i = 0; i < numberOfTablets; i += 1) {
        const weavingInstructionsForTablet = [
          ...weavingInstructionsByTablet[i],
        ];

        // change direction for this row
        const obj = { ...weavingInstructionsForTablet[row] };
        obj.direction = obj.direction === 'F' ? 'B' : 'F';
        weavingInstructionsForTablet[row] = obj;

        const picksForTablet = calculatePicksForTablet({
          currentPicks: state.picks[i],
          weavingInstructionsForTablet,
          row,
        });

        newWeavingInstructionsByTablet.push(weavingInstructionsForTablet);
        newPicks.push(picksForTablet);
      }

      return updeep(
        {
          patternDesign: { weavingInstructions: newWeavingInstructions },
          picks: newPicks,
          weavingInstructionsByTablet: newWeavingInstructionsByTablet,
        },
        state,
      );
    }

    case UPDATE_DOUBLE_FACED_CHART: {
      const { rowIndex, tabletIndex } = action.payload;

      // first row of an even tablet cannot be edited
      /* if (tabletIndex % 2 === 1 && rowIndex === 0) {
				return state;
			} */

      const { numberOfRows, patternDesign, weavingInstructionsByTablet } =
        state;

      const weavingInstructionsForTablet = [
        ...weavingInstructionsByTablet[tabletIndex],
      ];

      // toggle '.' or 'X' in the chart
      // original arrays are immutable
      const newChart = [...patternDesign.doubleFacedPatternChart];
      const newRow = [...newChart[rowIndex]];
      const currentValue = newChart[rowIndex][tabletIndex];
      const newValue = currentValue === '.' ? 'X' : '.';
      newRow[tabletIndex] = newValue;
      newChart[rowIndex] = newRow;

      // find the new weavingInstructions for the changed tablet
      const newPatternDesign = { ...patternDesign };
      newPatternDesign.doubleFacedPatternChart = newChart;

      const newWeavingInstructions =
        buildDoubleFacedWeavingInstructionsForTablet({
          numberOfRows,
          patternDesign: newPatternDesign,
          startRow: Math.max(rowIndex * 2 - 2, 0), // reweave from previous block to catch color change
          tabletIndex,
          weavingInstructionsForTablet,
        });

      const picksForTablet = calculatePicksForTablet({
        currentPicks: state.picks[tabletIndex],
        weavingInstructionsForTablet: newWeavingInstructions,
        row: Math.max(rowIndex * 2 - 1, 0),
      });

      return updeep(
        {
          patternDesign: { doubleFacedPatternChart: newChart },
          weavingInstructionsByTablet: {
            [tabletIndex]: newWeavingInstructions,
          },
          picks: { [tabletIndex]: picksForTablet },
        },
        state,
      );
    }

    case UPDATE_TWILL_CHART: {
      const { rowIndex, tabletIndex, twillChart } = action.payload;

      // first row of an even tablet cannot be edited
      if (tabletIndex % 2 === 1 && rowIndex === 0) {
        return state;
      }

      const { numberOfRows, patternDesign, weavingInstructionsByTablet } =
        state;

      const weavingInstructionsForTablet = [
        ...weavingInstructionsByTablet[tabletIndex],
      ];

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
        patternDesign: newPatternDesign,
        startRow: Math.max(rowIndex * 2 - 2, 0), // reweave from previous block to catch color change
        tabletIndex,
        weavingInstructionsForTablet,
      });

      const picksForTablet = calculatePicksForTablet({
        currentPicks: state.picks[tabletIndex],
        weavingInstructionsForTablet: newWeavingInstructions,
        row: Math.max(rowIndex * 2 - 1, 0),
      });

      return updeep(
        {
          patternDesign: { [twillChart]: newTwillChart },
          weavingInstructionsByTablet: {
            [tabletIndex]: newWeavingInstructions,
          },
          picks: { [tabletIndex]: picksForTablet },
        },
        state,
      );
    }

    case UPDATE_TWILL_WEAVING_START_ROW: {
      const newWeavingStartRow = action.payload;

      return updeep(
        {
          patternDesign: {
            weavingStartRow: newWeavingStartRow,
          },
        },
        state,
      );
    }

    case UPDATE_FREEHAND_CELL_THREAD: {
      const { row, tablet, threadColor, threadShape } = action.payload;

      return updeep(
        {
          patternDesign: {
            freehandChart: {
              [row]: { [tablet]: { threadColor, threadShape } },
            },
          },
        },
        state,
      );
    }

    case UPDATE_FREEHAND_CELL_DIRECTION: {
      const { row, tablet } = action.payload;

      // toggle cell direction
      const cell = state.patternDesign.freehandChart[row][tablet];
      const direction = cell.direction === 'F' ? 'B' : 'F';

      return updeep(
        {
          patternDesign: {
            freehandChart: { [row]: { [tablet]: { direction } } },
          },
        },
        state,
      );
    }

    case SET_IS_EDITING_WEAVING: {
      return updeep({ isEditingWeaving: action.payload }, state);
    }

    case SET_IS_EDITING_THREADING: {
      return updeep({ isEditingThreading: action.payload }, state);
    }

    case SET_UPDATE_PREVIEW_WHILE_EDITING: {
      return updeep({ updatePreviewWhileEditing: action.payload }, state);
    }

    case SET_SHOW_TABLET_GUIDES: {
      return updeep({ showTabletGuides: action.payload }, state);
    }

    case SET_SHOW_CENTER_GUIDE: {
      return updeep({ showCenterGuide: action.payload }, state);
    }

    case UPDATE_THREADING_CELL: {
      const { colorIndex, holesToSet, tablet } = action.payload;

      const update = {
        threadingByTablet: {
          [tablet]: {},
        },
      };

      holesToSet.forEach((holeIndex) => {
        update.threadingByTablet[tablet][holeIndex] = colorIndex;
      });

      return updeep(update, state);
    }

    case UPDATE_INCLUDE_IN_TWIST: {
      const { tablet, tabletIncludeInTwist } = action.payload;

      const update = {
        includeInTwist: { [tablet]: tabletIncludeInTwist },
      };

      return updeep(update, state);
    }

    case UPDATE_TABLET_GUIDES: {
      const { tablet, tabletGuide } = action.payload;

      const update = {
        tabletGuides: { [tablet]: tabletGuide },
      };

      return updeep(update, state);
    }

    case UPDATE_ORIENTATION: {
      const { tablet, tabletOrientation } = action.payload;
      const { patternType, weavingInstructionsByTablet } = state;

      const update = {
        orientations: { [tablet]: tabletOrientation },
      };

      if (patternType !== 'freehand') {
        // freehand doesn't calculate picks
        // to calculate new picks for this tablet
        const weavingInstructionsForTablet = [
          ...weavingInstructionsByTablet[tablet],
        ];

        const picksForTablet = calculatePicksForTablet({
          currentPicks: state.picks[tablet],
          weavingInstructionsForTablet,
          row: 0,
        });

        update.picks = { [tablet]: picksForTablet };
      }

      return updeep(update, state);
    }

    case UPDATE_PALETTE_COLOR: {
      const { colorHexValue, colorIndex } = action.payload;

      return updeep(
        {
          palette: { [colorIndex]: colorHexValue },
        },
        state,
      );
    }

    case UPDATE_HOLE_HANDEDNESS: {
      const currentHandedness = state.patternDesign.holeHandedness;

      // toggle handedness
      const newHandedness =
        currentHandedness === 'anticlockwise' ? 'clockwise' : 'anticlockwise';

      return updeep(
        {
          patternDesign: { holeHandedness: newHandedness },
        },
        state,
      );
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
        numberOfRows: newNumberOfRows,
      };

      const newPicks = [];
      const newWeavingInstructionsByTablet = [];

      switch (patternType) {
        // each tablet is independent so just remove it
        case 'individual':
        case 'allTogether':
          // individual weaving instruction
          const obj = {
            direction: DEFAULT_DIRECTION,
            numberOfTurns: DEFAULT_NUMBER_OF_TURNS,
          };

          for (let i = 0; i < numberOfTablets; i += 1) {
            const newWeavingInstructionsForTablet = [
              ...weavingInstructionsByTablet[i],
            ];

            for (let j = 0; j < insertNRows; j += 1) {
              newWeavingInstructionsForTablet.splice(insertRowsAt, 0, obj);
            }

            const picksForTablet = calculatePicksForTablet({
              currentPicks: picks[i],
              weavingInstructionsForTablet: newWeavingInstructionsForTablet,
              row: insertRowsAt,
            });

            newWeavingInstructionsByTablet.push(
              newWeavingInstructionsForTablet,
            );
            newPicks.push(picksForTablet);
          }

          if (patternType === 'allTogether') {
            // update patternDesign for patterns will be used for UI
            const newPatternDesignRows = [];
            let newWeavingInstructions = [];

            for (let i = 0; i < insertNRows; i += 1) {
              newPatternDesignRows.push(DEFAULT_DIRECTION);
            }
            newWeavingInstructions =
              patternDesign.weavingInstructions.concat(newPatternDesignRows);
            update.patternDesign = {
              weavingInstructions: newWeavingInstructions,
            };
          }

          update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
          update.picks = newPicks;

          break;

        case 'doubleFaced':
          const { doubleFacedPatternChart } = patternDesign;

          const newDoubleFacedPatternChart = [...doubleFacedPatternChart];

          for (let i = 0; i < insertNRows / 2; i += 1) {
            const chartPosition = insertRowsAt / 2;

            const newRow1 = new Array(numberOfTablets);
            newRow1.fill('.');
            newDoubleFacedPatternChart.splice(chartPosition, 0, newRow1);
          }

          // calculate weaving from new row onwards
          for (let i = 0; i < numberOfTablets; i += 1) {
            const weavingInstructionsForTablet = [
              ...weavingInstructionsByTablet[i],
            ];

            const newWeavingInstructionsForTablet =
              buildDoubleFacedWeavingInstructionsForTablet({
                numberOfRows: newNumberOfRows,
                patternDesign: {
                  doubleFacedPatternChart: newDoubleFacedPatternChart,
                },
                startRow: insertRowsAt,
                tabletIndex: i,
                weavingInstructionsForTablet,
              });

            const picksForTablet = calculatePicksForTablet({
              weavingInstructionsForTablet: newWeavingInstructionsForTablet,
              row: 0,
            });

            newWeavingInstructionsByTablet.push(
              newWeavingInstructionsForTablet,
            );
            newPicks.push(picksForTablet);
          }

          update.patternDesign = {
            doubleFacedPatternChart: newDoubleFacedPatternChart,
          };

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
            const chartPosition = insertRowsAt / 2;

            const newRow1 = new Array(numberOfTablets);
            newRow1.fill('.');
            newTwillPatternChart.splice(chartPosition, 0, newRow1);

            const newRow2 = new Array(numberOfTablets);
            newRow2.fill('.');
            newTwillDirectionChangeChart.splice(chartPosition, 0, newRow2);
          }

          // calculate weaving from new row onwards
          for (let i = 0; i < numberOfTablets; i += 1) {
            const weavingInstructionsForTablet = [
              ...weavingInstructionsByTablet[i],
            ];

            const newWeavingInstructionsForTablet =
              buildTwillWeavingInstructionsForTablet({
                numberOfRows: newNumberOfRows,
                patternDesign: {
                  twillDirection,
                  twillPatternChart: newTwillPatternChart,
                  twillDirectionChangeChart: newTwillDirectionChangeChart,
                },
                startRow: insertRowsAt,
                tabletIndex: i,
                weavingInstructionsForTablet,
              });

            const picksForTablet = calculatePicksForTablet({
              weavingInstructionsForTablet: newWeavingInstructionsForTablet,
              row: 0,
            });

            newWeavingInstructionsByTablet.push(
              newWeavingInstructionsForTablet,
            );
            newPicks.push(picksForTablet);
          }

          update.patternDesign = {
            twillPatternChart: newTwillPatternChart,
            twillDirectionChangeChart: newTwillDirectionChangeChart,
          };

          update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
          update.picks = newPicks;

          break;

        case 'freehand':
          const { freehandChart } = patternDesign;

          const newWeavingChart = [...freehandChart];

          for (let i = 0; i < insertNRows; i += 1) {
            const newChartRow = [];

            for (let j = 0; j < numberOfTablets; j += 1) {
              newChartRow.push(chartCell);
            }

            newWeavingChart.splice(insertRowsAt + i, 0, newChartRow);
          }

          update.patternDesign = {
            freehandChart: newWeavingChart,
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
        numberOfRows: newNumberOfRows,
      };

      const newPicks = [];
      const newWeavingInstructionsByTablet = [];

      switch (patternType) {
        // each tablet is independent so just remove it
        case 'individual':
        case 'allTogether':
          for (let i = 0; i < numberOfTablets; i += 1) {
            const newWeavingInstructionsForTablet = [
              ...weavingInstructionsByTablet[i],
            ];

            newWeavingInstructionsForTablet.splice(removeRowsAt, removeNRows);

            const picksForTablet = calculatePicksForTablet({
              currentPicks: state.picks[i],
              weavingInstructionsForTablet: newWeavingInstructionsForTablet,
              row: removeRowsAt,
            });

            newWeavingInstructionsByTablet.push(
              newWeavingInstructionsForTablet,
            );
            newPicks.push(picksForTablet);
          }

          if (patternType === 'allTogether') {
            const newWeavingInstructions = [
              ...patternDesign.weavingInstructions,
            ];

            newWeavingInstructions.splice(
              removeRowsAt - removeNRows + 1,
              removeNRows,
            );
            update.patternDesign = {
              weavingInstructions: newWeavingInstructions,
            };
          }

          break;

        case 'doubleFaced':
          const { doubleFacedPatternChart } = patternDesign;

          const newDoubleFacedPatternChart = [...doubleFacedPatternChart];

          newDoubleFacedPatternChart.splice(removeRowsAt / 2, removeNRows / 2);

          // calculate weaving from removed row onwards
          for (let i = 0; i < numberOfTablets; i += 1) {
            const weavingInstructionsForTablet = [
              ...weavingInstructionsByTablet[i],
            ];

            const newWeavingInstructionsForTablet =
              buildDoubleFacedWeavingInstructionsForTablet({
                numberOfRows: newNumberOfRows,
                patternDesign: {
                  doubleFacedPatternChart: newDoubleFacedPatternChart,
                },
                tabletIndex: i,
                weavingInstructionsForTablet,
              });

            const picksForTablet = calculatePicksForTablet({
              weavingInstructionsForTablet: newWeavingInstructionsForTablet,
              row: 0,
            });

            newWeavingInstructionsByTablet.push(
              newWeavingInstructionsForTablet,
            );
            newPicks.push(picksForTablet);
          }

          update.patternDesign = {
            doubleFacedPatternChart: newDoubleFacedPatternChart,
          };

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
          newTwillDirectionChangeChart.splice(
            removeRowsAt / 2,
            removeNRows / 2,
          );

          // odd rows of twill charts cannot start with 'X'
          for (let i = 1; i < numberOfTablets; i += 2) {
            newTwillPatternChart[0] = [...newTwillPatternChart[0]];
            newTwillDirectionChangeChart[0] = [
              ...newTwillDirectionChangeChart[0],
            ];

            newTwillPatternChart[0][i] = '.';
            newTwillDirectionChangeChart[0][i] = '.';
          }

          // calculate weaving from removed row onwards
          for (let i = 0; i < numberOfTablets; i += 1) {
            const weavingInstructionsForTablet = [
              ...weavingInstructionsByTablet[i],
            ];

            const newWeavingInstructionsForTablet =
              buildTwillWeavingInstructionsForTablet({
                numberOfRows: newNumberOfRows,
                patternDesign: {
                  twillDirection,
                  twillPatternChart: newTwillPatternChart,
                  twillDirectionChangeChart: newTwillDirectionChangeChart,
                },
                startRow: removeRowsAt,
                tabletIndex: i,
                weavingInstructionsForTablet,
              });

            const picksForTablet = calculatePicksForTablet({
              weavingInstructionsForTablet: newWeavingInstructionsForTablet,
              row: 0,
            });

            newWeavingInstructionsByTablet.push(
              newWeavingInstructionsForTablet,
            );
            newPicks.push(picksForTablet);
          }

          update.patternDesign = {
            twillPatternChart: newTwillPatternChart,
            twillDirectionChangeChart: newTwillDirectionChangeChart,
          };

          break;

        case 'freehand':
          const { freehandChart } = patternDesign;
          const newFreehandChart = [...freehandChart];

          newFreehandChart.splice(removeRowsAt, removeNRows);

          update.patternDesign = {
            freehandChart: newFreehandChart,
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
        includeInTwist,
        numberOfRows,
        numberOfTablets,
        orientations,
        patternDesign,
        patternType,
        picks,
        tabletGuides,
        threadingByTablet,
        weavingInstructionsByTablet,
      } = state;

      const newThreadingByTablet = [...threadingByTablet];
      const newOrientations = [...orientations];
      const newNumberOfTablets = numberOfTablets + insertNTablets;

      // build update for updeep / state
      const update = {
        numberOfTablets: newNumberOfTablets,
        orientations: newOrientations,
        threadingByTablet: newThreadingByTablet,
      };

      let newWeavingInstructionsByTablet;
      let newPicks;

      // all simulation patterns
      if (patternType !== 'freehand') {
        newWeavingInstructionsByTablet = [...weavingInstructionsByTablet];
        newPicks = [...picks];

        update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
        update.picks = newPicks;

        const newIncludeInTwist = [...includeInTwist];
        for (let i = 0; i < insertNTablets; i += 1) {
          newIncludeInTwist.splice(insertTabletsAt, 0, true);
        }
        update.includeInTwist = newIncludeInTwist;
      }

      // tablet guides are the same for all pattern types
      const newTabletGuides = [...tabletGuides];
      for (let i = 0; i < insertNTablets; i += 1) {
        newTabletGuides.splice(insertTabletsAt, 0, false);
      }
      update.tabletGuides = newTabletGuides;

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

            newWeavingInstructionsByTablet.splice(
              insertTabletsAt,
              0,
              newWeavingInstructionsForTablet,
            );

            const picksForTablet = calculatePicksForTablet({
              weavingInstructionsForTablet:
                newWeavingInstructionsByTablet[insertTabletsAt],
              row: 0,
              numberOfRows,
            });

            newPicks.splice(insertTabletsAt, 0, picksForTablet);
          }
          break;

        case 'doubleFaced':
          const { doubleFacedOrientations, doubleFacedPatternChart } =
            patternDesign;
          const doubleFacedChartLength = doubleFacedPatternChart.length;
          const newDoubleFacedPatternChart = [...doubleFacedPatternChart];

          // orientations
          for (let i = 0; i < insertNTablets; i += 1) {
            // tablet orientations repeat, so the new ones can be added at the end
            const orientation = getDoubleFacedOrientation({
              doubleFacedOrientations,
              tablet: i + numberOfTablets,
            });
            newOrientations.push(orientation);
          }

          // double faced design chart
          for (let i = 0; i < insertNTablets; i += 1) {
            // insert new tablet to double faced design chart
            // these are by row, tablet
            for (let j = 0; j < doubleFacedChartLength; j += 1) {
              newDoubleFacedPatternChart[j] = [
                ...newDoubleFacedPatternChart[j],
              ];
              newDoubleFacedPatternChart[j].splice(insertTabletsAt, 0, '.');
            }
          }

          // insert the new tablets into the threading chart
          for (
            let i = insertTabletsAt;
            i < insertTabletsAt + insertNTablets;
            i += 1
          ) {
            const newThreadingForTablet = [];

            for (let j = 0; j < holes; j += 1) {
              const colorRole = DOUBLE_FACED_THREADING[j];
              newThreadingForTablet.push(
                colorRole === 'F'
                  ? DOUBLE_FACED_FOREGROUND
                  : DOUBLE_FACED_BACKGROUND,
              );
            }

            newThreadingByTablet.splice(i, 0, newThreadingForTablet);
          }

          // calculate weaving for new and subsequent tablets
          for (let i = insertTabletsAt; i < newNumberOfTablets; i += 1) {
            const newWeavingInstructions =
              buildDoubleFacedWeavingInstructionsForTablet({
                numberOfRows,
                patternDesign: {
                  doubleFacedPatternChart: newDoubleFacedPatternChart,
                },

                tabletIndex: i,
              });

            newWeavingInstructionsByTablet[i] = newWeavingInstructions;

            newPicks[i] = calculatePicksForTablet({
              weavingInstructionsForTablet: newWeavingInstructions,
              row: 0,
            });
          }

          update.patternDesign = {
            doubleFacedPatternChart: newDoubleFacedPatternChart,
          };
          break;

        case 'brokenTwill':
          const {
            twillDirection,
            twillPatternChart,
            twillDirectionChangeChart,
          } = patternDesign;
          const chartLength = twillPatternChart.length;
          const newTwillPatternChart = [...twillPatternChart];
          const newTwillDirectionChangeChart = [...twillDirectionChangeChart];

          // orientations
          for (let i = 0; i < insertNTablets; i += 1) {
            // set orientation of new tablet
            newOrientations.splice(insertTabletsAt, 0, DEFAULT_ORIENTATION);

            // insert new tablet to twill design charts
            // these are by row, tablet
            for (let j = 0; j < chartLength; j += 1) {
              newTwillPatternChart[j] = [...newTwillPatternChart[j]];
              newTwillPatternChart[j].splice(insertTabletsAt, 0, '.');

              newTwillDirectionChangeChart[j] = [
                ...newTwillDirectionChangeChart[j],
              ];
              newTwillDirectionChangeChart[j].splice(insertTabletsAt, 0, '.');
            }
          }

          // add the new tablets to threading.
          // find the foreground / background colour for each tablet from the change onwards
          const colorsForRolesByTablet = getColorsForRolesByTablet({
            holes,
            numberOfTablets,
            startAt: insertTabletsAt,
            threading: threadingByTablet,
            threadingStructure: 'byTablet',
          });

          // insert the new tablets
          for (
            let i = insertTabletsAt;
            i < insertTabletsAt + insertNTablets;
            i += 1
          ) {
            const newThreadingForTablet = [];

            for (let j = 0; j < holes; j += 1) {
              const colorRole = BROKEN_TWILL_THREADING[j][i % holes];
              newThreadingForTablet.push(
                colorRole === 'F'
                  ? BROKEN_TWILL_FOREGROUND
                  : BROKEN_TWILL_BACKGROUND,
              );
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
            const newWeavingInstructions =
              buildTwillWeavingInstructionsForTablet({
                numberOfRows,
                patternDesign: {
                  twillDirection,
                  twillPatternChart: newTwillPatternChart,
                  twillDirectionChangeChart: newTwillDirectionChangeChart,
                },
                startRow: 0, // reweave entire tablet
                tabletIndex: i,
              });

            newWeavingInstructionsByTablet[i] = newWeavingInstructions;

            newPicks[i] = calculatePicksForTablet({
              weavingInstructionsForTablet: newWeavingInstructions,
              row: 0,
            });
          }

          update.patternDesign = {
            twillPatternChart: newTwillPatternChart,
            twillDirectionChangeChart: newTwillDirectionChangeChart,
          };
          break;

        case 'freehand':
          const { freehandChart } = patternDesign;
          const newFreehandChart = [...freehandChart];

          for (let i = 0; i < insertNTablets; i += 1) {
            for (let j = 0; j < numberOfRows; j += 1) {
              const newChartCell = { ...DEFAULT_FREEHAND_CELL };
              newChartCell.threadColor = colorIndex;
              if (colorIndex === -1) {
                newChartCell.threadShape = 'forwardEmpty';
              }

              newFreehandChart[j] = [...newFreehandChart[j]];
              newFreehandChart[j].splice(insertTabletsAt, 0, newChartCell);
            }
          }

          update.patternDesign = {
            freehandChart: newFreehandChart,
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
        includeInTwist,
        numberOfRows,
        numberOfTablets,
        orientations,
        patternDesign,
        patternType,
        picks,
        tabletGuides,
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
        numberOfTablets: newNumberOfTablets,
        orientations: newOrientations,
        threadingByTablet: newThreadingByTablet,
      };

      if (patternType !== 'freehand') {
        newWeavingInstructionsByTablet = [...weavingInstructionsByTablet];
        newPicks = [...picks];

        update.weavingInstructionsByTablet = newWeavingInstructionsByTablet;
        update.picks = newPicks;

        const newIncludeInTwist = [...includeInTwist];
        newIncludeInTwist.splice(tablet, 1);
        update.includeInTwist = newIncludeInTwist;
      }

      const newTabletGuides = [...tabletGuides];
      newTabletGuides.splice(tablet, 1);
      update.tabletGuides = newTabletGuides;

      switch (patternType) {
        // each tablet is independent so just remove it
        case 'individual':
        case 'allTogether':
          newOrientations.splice(tablet, 1);
          newPicks.splice(tablet, 1);
          newWeavingInstructionsByTablet.splice(tablet, 1);
          newThreadingByTablet.splice(tablet, 1);
          break;

        case 'doubleFaced':
          const { doubleFacedPatternChart } = patternDesign;
          const doubleFacedChartLength = doubleFacedPatternChart.length;
          const newDoubleFacedPatternChart = [...doubleFacedPatternChart];

          newOrientations.pop(); // tablets alternate so simply remove the end one
          newPicks.splice(tablet, 1);
          newWeavingInstructionsByTablet.splice(tablet, 1);
          newThreadingByTablet.splice(tablet, 1);

          for (let i = 0; i < doubleFacedChartLength; i += 1) {
            newDoubleFacedPatternChart[i] = [...newDoubleFacedPatternChart[i]];
            newDoubleFacedPatternChart[i].splice(tablet, 1);
          }

          update.patternDesign = {
            doubleFacedPatternChart: newDoubleFacedPatternChart,
          };

          break;

        case 'brokenTwill':
          const {
            twillDirection,
            twillPatternChart,
            twillDirectionChangeChart,
          } = patternDesign;
          const chartLength = twillPatternChart.length;
          const newTwillPatternChart = [...twillPatternChart];
          const newTwillDirectionChangeChart = [...twillDirectionChangeChart];

          newOrientations.pop(); // all tablets have the same orientation
          newWeavingInstructionsByTablet.pop(); // this will be rewoven
          newPicks.pop(); // this will be rewoven

          // remove the tablet from threading
          // find the foreground / background colour for each tablet from the change onwards
          const colorsForRolesByTablet = getColorsForRolesByTablet({
            holes,
            numberOfTablets,
            startAt: tablet + 1,
            threading: threadingByTablet,
            threadingStructure: 'byTablet',
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

            newTwillDirectionChangeChart[i] = [
              ...newTwillDirectionChangeChart[i],
            ];
            newTwillDirectionChangeChart[i].splice(tablet, 1);
          }

          // calculate weaving from removed tablet onwards
          for (let i = tablet; i < newNumberOfTablets; i += 1) {
            newWeavingInstructionsByTablet =
              buildTwillWeavingInstructionsForTablet({
                numberOfRows,
                patternDesign: {
                  twillDirection,
                  twillPatternChart: newTwillPatternChart,
                  twillDirectionChangeChart: newTwillDirectionChangeChart,
                },
                startRow: 0, // reweave entire tablet
                tabletIndex: i,
              });

            newPicks[i] = calculatePicksForTablet({
              weavingInstructionsForTablet: newWeavingInstructionsByTablet,
              row: 0,
            });
          }

          update.patternDesign = {
            twillPatternChart: newTwillPatternChart,
            twillDirectionChangeChart: newTwillDirectionChangeChart,
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
            freehandChart: newFreehandChart,
          };

          break;

        default:
          break;
      }

      return updeep(update, state);
    }

    case SET_FILTER_IS_TWIST_NEUTRAL: {
      return updeep({ filterIsTwistNeutral: action.payload }, state);
    }

    case SET_FILTER_MAX_TABLETS: {
      return updeep({ filterMaxTablets: action.payload }, state);
    }

    case SET_FILTER_MIN_TABLETS: {
      return updeep({ filterMinTablets: action.payload }, state);
    }

    case SET_FILTER_WILL_REPEAT: {
      return updeep({ filterWillRepeat: action.payload }, state);
    }

    case REMOVE_TABLET_FILTER: {
      return updeep({ filterMaxTablets: null, filterMinTablets: null }, state);
    }

    default:
      return state;
  }
}
