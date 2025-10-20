// functions used to calculate weaving chart from pattern design
// import { createSelector } from 'reselect';
import {
  BROKEN_TWILL_SEQUENCE,
  DOUBLE_FACED_SEQUENCE,
  EMPTY_HOLE_COLOR,
  MAX_PICKS_IN_REPEAT,
} from '../../modules/parameters';

const tinycolor = require('tinycolor2');

// /////////////////////////
// utilities
// calculate the effect of turning a tablet to weave one pick

// direction: 'F', 'B'
// number of turns: how many times the tablet has been turned this pick - 0, 1, 2, 3
// totalTurns: total number of turns the tablet has been given, including this pick
export const turnTablet = ({ direction, numberOfTurns, totalTurns = 0 }) => ({
  direction,
  numberOfTurns,
  totalTurns:
    direction === 'F' ? totalTurns + numberOfTurns : totalTurns - numberOfTurns,
});

// find n modulus m
// handles negative numbers
// e.g. -5 mod 4 returns 3
export const modulus = (n, m) => ((n % m) + m) % m;

// ///////////////////////////
// provide weaving data to components
// const getPattern = (pattern) => pattern || {};

export const getWeavingInstructionsForTablet = (pattern, tabletIndex) =>
  pattern.weavingInstructionsByTablet[tabletIndex];

// recast threading by tablet, row
// better for getting data per tablet
export const getThreadingByTablet = (pattern) => {
  const { holes, numberOfTablets, threading } = pattern;

  const threadingByTablet = [];

  for (let i = 0; i < numberOfTablets; i += 1) {
    const threadingForTablet = [];

    for (let j = 0; j < holes; j += 1) {
      threadingForTablet.push(threading[j][i]);
    }
    threadingByTablet.push(threadingForTablet);
  }

  return threadingByTablet;
};

// calculate picks for the tablet
// from scratch, or
// from the row of a change onward
export const calculatePicksForTablet = ({
  currentPicks,
  weavingInstructionsForTablet,
  row,
}) => {
  let picks = []; // build picks from scratch

  if (currentPicks) {
    // rebuild picks from row onwards
    picks = [...currentPicks].slice(0, row);
  }

  const numberOfRows = weavingInstructionsForTablet.length;

  for (let i = row; i < numberOfRows; i += 1) {
    const { direction, numberOfTurns } = weavingInstructionsForTablet[i];

    let adjustedDirection = direction;

    // idle tablet
    if (numberOfTurns === 0) {
      if (i === 0) {
        // first row: take direction from the following pick
        // because idle, forward is the same as forward, idle
        // will fail if pattern starts with two idles
        // but that doesn't seem a common scenario
        adjustedDirection = weavingInstructionsForTablet[i + 1].direction;
      } else {
        // use direction of previous row
        adjustedDirection = picks[i - 1].direction;
      }
    }

    picks[i] = turnTablet({
      direction: adjustedDirection,
      numberOfTurns,
      totalTurns: i === 0 ? 0 : picks[i - 1].totalTurns,
    });
  }

  return picks;
};

export const calculateAllPicks = ({
  numberOfRows,
  numberOfTablets,
  weavingInstructionsByTablet,
}) => {
  // weave by tablet instead of by row
  // so that an individual tablet can be rewoven
  // without recalculating other tablets
  const picks = [];

  for (let i = 0; i < numberOfTablets; i += 1) {
    const picksForTablet = calculatePicksForTablet({
      weavingInstructionsForTablet: weavingInstructionsByTablet[i],
      row: 0,
      numberOfRows,
    });

    picks.push(picksForTablet);
  }

  return picks;
};

// a tablet to be deleted has its colorIndex temporarily set to a marker value which causes an error in threading and weaving charts
export const isValidColorIndex = (colorIndex) => typeof colorIndex === 'number';

// set a text color that will show up against a background
export const contrastingColor = (color) =>
  tinycolor(color).isLight() ? '#000' : '#fff';

// find the color of a previous thread
// offset 1 means last thread
// offset 2 means last but one thread...
export const getPrevColor = ({
  direction,
  holes,
  holeToShow,
  offset,
  palette,
  threadingForTablet,
}) => {
  let prevHoleIndex =
    direction === 'F' ? holeToShow + offset : holeToShow - offset;
  prevHoleIndex = modulus(prevHoleIndex, holes);

  const colorIndex = threadingForTablet[prevHoleIndex];

  if (colorIndex === -1) {
    return EMPTY_HOLE_COLOR;
  }

  return palette[colorIndex];
};

export const getTotalTurnsForTablet = ({
  numberOfRows,
  patternDesign,
  patternType,
  picksForTablet,
}) => {
  let startTurns = 0;

  if (patternType === 'brokenTwill') {
    const { weavingStartRow } = patternDesign;

    if (weavingStartRow > 1) {
      startTurns = picksForTablet[weavingStartRow - 2].totalTurns;
    }
  }

  return picksForTablet[numberOfRows - 1].totalTurns - startTurns;
};

export const findPatternTwist = ({
  holes,
  includeInTwist,
  numberOfRows,
  numberOfTablets,
  patternDesign,
  patternType,
  picks,
}) => {
  const { weavingStartRow } = patternDesign; // broken twill may have offset weaving start row
  const rowsAtStartPosition = []; // rows where the tablets have returned to the start position
  let patternWillRepeat = false;
  let patternIsTwistNeutral = false;

  if (includeInTwist) {
    // all patterns that calculate twist should have includeInTwist. At present this is everything except 'freehand'.
    if (picks[0]) {
      // check the final row for twist neutral and will repeat
      patternWillRepeat = true;
      patternIsTwistNeutral = true;

      // check all rows to see if row is at start position
      for (let i = 0; i < numberOfRows; i += 1) {
        let rowAtStartPosition = true;

        for (let j = 0; j < numberOfTablets; j += 1) {
          const totalTurns = getTotalTurnsForTablet({
            numberOfRows: i + 1,
            patternDesign,
            patternType,
            picksForTablet: picks[j],
          });

          const startPosition = modulus(totalTurns, holes) === 0; // tablet is back at start position

          if (!startPosition && includeInTwist[j]) {
            rowAtStartPosition = false;

            // check final row for start position of overall pattern
            if (i === numberOfRows - 1) {
              patternWillRepeat = false;
              patternIsTwistNeutral = false;
            }

            break;
          }

          // check final row for twist neutral of overall pattern
          if (i === numberOfRows - 1) {
            if (totalTurns !== 0 && includeInTwist[j]) {
              patternIsTwistNeutral = false;
            }
          }
        }

        if (rowAtStartPosition) {
          if (weavingStartRow) {
            rowsAtStartPosition.push(i - weavingStartRow + 1);
          } else {
            rowsAtStartPosition.push(i);
          }
        }
      }
    }
  }

  return {
    patternWillRepeat,
    patternIsTwistNeutral,
    rowsAtStartPosition,
  };
};

export const getNumberOfRepeats = (numberOfRows) => {
  if (numberOfRows <= MAX_PICKS_IN_REPEAT) {
    return Math.floor((2 * MAX_PICKS_IN_REPEAT) / numberOfRows);
  }
  return 1;
};

// find the thread to show for a particular pick
export const getThread = ({
  direction,
  emptyHoleColor,
  holes,
  netTurns,
  orientation,
  palette,
  showBackOfBand,
  threadingForTablet,
}) => {
  let holeToShow;

  // I'm not sure if this is right or whether an idling first row should be adjusted, as in the commented-out code below. This seems to work for Cambridge Diamonds, so leave as is for now.
  // idle first row: tablet has not yet turned.
  // so go back one hole
  if (direction === 'F' || holes === 2) {
    // not first row, or not idle
    // show thread in position A
    // for two-hole tablets, the top hole is always the one that shows
    // whether turning forwards or backwards
    holeToShow = modulus(holes - netTurns, holes);
  } else {
    // show thread in position D
    // for four-hole tablets, when turning backwards, the top back hole is the one that shows
    // I'm not sure how it works for 6-hole tablets plus there is the question of how you orient the tablets, so for now I am not adding a special case
    holeToShow = modulus(holes - netTurns - 1, holes);
  }

  let threadAngle = '/'; // which way does the thread twist?

  if (direction === 'F') {
    if (orientation === '\\') {
      threadAngle = '\\';
    }
  } else if (orientation === '/') {
    threadAngle = '\\';
  }

  if (showBackOfBand && holes % 2 === 0) {
    // number of holes must be even to show the back of the band
    holeToShow = modulus(holeToShow + holes / 2, holes); // the hole showing is the diagonally opposite hole
  }

  const colorIndex = threadingForTablet[holeToShow];

  if (!isValidColorIndex(colorIndex)) {
    return null;
  }

  let threadColor = emptyHoleColor;
  if (colorIndex !== -1) {
    // not empty, there is a thread
    threadColor = palette[colorIndex];
  }

  return {
    colorIndex,
    holeToShow,
    threadAngle,
    threadColor,
  };
};

// each row of raw pattern design charts corresponds to two picks, offset alternately
// so build expanded charts that correspond to single picks
// and recast by tablet
export const buildDoubleFacedDoubledChartsForTablet = ({
  tabletIndex,
  doubleFacedPatternChart,
}) => {
  const doubledPatternChart = [];
  const designChartRows = doubleFacedPatternChart.length;

  for (let i = 0; i < designChartRows; i += 1) {
    // pattern chart
    // even row (note chart starts with 0, even)
    doubledPatternChart.push(doubleFacedPatternChart[i][tabletIndex]);

    // odd row
    doubledPatternChart.push(doubleFacedPatternChart[i][tabletIndex]);
  }

  return {
    doubledPatternChart,
  };
};

// each row of raw pattern design charts corresponds to two picks, offset alternately
// so build expanded charts that correspond to single picks
// and recast by tablet
export const buildTwillDoubledChartsForTablet = ({
  tabletIndex,
  twillPatternChart,
  twillDirectionChangeChart,
}) => {
  const doubledChangeChart = [];
  const doubledPatternChart = [];
  const designChartRows = twillPatternChart.length; // the charts have an extra row because of offset

  for (let i = 0; i < designChartRows; i += 1) {
    // pattern chart
    // even row (note chart starts with 0, even)
    doubledPatternChart.push(twillPatternChart[i][tabletIndex]);
    const rowIndex = 2 * i; // row index in doubled chart

    // odd row
    if (i === designChartRows - 1) {
      // last row of Data
      doubledPatternChart.push(twillPatternChart[i][tabletIndex]);
    } else if (tabletIndex % 2 === 0) {
      doubledPatternChart.push(twillPatternChart[i][tabletIndex]);
    } else {
      doubledPatternChart.push(twillPatternChart[i + 1][tabletIndex]);
    }

    // change chart
    // even row
    doubledChangeChart.push(twillDirectionChangeChart[i][tabletIndex]);

    // chart cells are alternately offset, so this finds the second pick in a pair
    // replace X with Y in second row so we can identify first and second row of changed twill
    if (tabletIndex % 2 === 1) {
      if (doubledChangeChart[rowIndex] === 'X') {
        doubledChangeChart[rowIndex] = 'Y';
      }
    }

    // odd row
    if (i === designChartRows - 1) {
      // last row of twill direction change chart
      doubledChangeChart.push(twillDirectionChangeChart[i][tabletIndex]);
    } else if (tabletIndex % 2 === 0) {
      doubledChangeChart.push(twillDirectionChangeChart[i][tabletIndex]);
    } else {
      doubledChangeChart.push(twillDirectionChangeChart[i + 1][tabletIndex]);
    }

    // replace X with Y in second row so we can identify first and second row of long float
    if (tabletIndex % 2 === 0) {
      if (doubledChangeChart[rowIndex + 1] === 'X') {
        doubledChangeChart[rowIndex + 1] = 'Y';
      }
    }
  }

  return {
    doubledChangeChart,
    doubledPatternChart,
  };
};

export const buildIndividualWeavingInstructionsByTablet = ({
  numberOfRows,
  numberOfTablets,
  patternDesign,
}) => {
  const weavingInstructionsByTablet = [];

  for (let i = 0; i < numberOfTablets; i += 1) {
    const weavingInstructionsForTablet = [];

    for (let j = 0; j < numberOfRows; j += 1) {
      weavingInstructionsForTablet.push(
        patternDesign.weavingInstructions[j][i],
      );
    }

    weavingInstructionsByTablet.push(weavingInstructionsForTablet);
  }

  return weavingInstructionsByTablet;
};

export const buildAllTogetherWeavingInstructionsByTablet = ({
  numberOfRows,
  numberOfTablets,
  patternDesign,
}) => {
  const weavingInstructionsByTablet = [];

  for (let i = 0; i < numberOfTablets; i += 1) {
    const weavingInstructionsForTablet = [];

    // pattern design gives direction of turn for the entire row
    // always 1 turn
    for (let j = 0; j < numberOfRows; j += 1) {
      const instruction = {
        direction: patternDesign.weavingInstructions[j],
        numberOfTurns: 1,
      };

      weavingInstructionsForTablet.push(instruction);
    }

    weavingInstructionsByTablet.push(weavingInstructionsForTablet);
  }

  return weavingInstructionsByTablet;
};

// This is the magic function that defines double faced weaving
// double faced patterns are defined by one chart
// build the weaving instructions for a tablet
// from the specified row
export const buildDoubleFacedWeavingInstructionsForTablet = ({
  numberOfRows,
  patternDesign,
  tabletIndex,
  weavingInstructionsForTablet,
}) => {
  const { doubleFacedPatternChart } = patternDesign;

  const weavingInstructions = weavingInstructionsForTablet || [];
  let position = -1;

  const { doubledPatternChart } = buildDoubleFacedDoubledChartsForTablet({
    tabletIndex,
    doubleFacedPatternChart,
  });

  for (let i = 0; i < numberOfRows; i += 1) {
    // read the pattern chart for colour change
    // '.' is background colour
    // 'X' is foreground colour

    const currentColor = doubledPatternChart[i];
    let nextColor = currentColor;
    let prevColor = '.';
    let colorChange = false;

    if (i < numberOfRows - 1) {
      // last row has no next row
      nextColor = doubledPatternChart[i + 1];
    }

    if (i > 0) {
      prevColor = doubledPatternChart[i - 1];
    }

    // color change if either previous or next color is different
    if (nextColor !== currentColor) {
      colorChange = true;
    }

    if (prevColor !== currentColor) {
      colorChange = true;
      if (i === 0) {
        // tablet starts with foreground color
        position = (position + 3) % 4; // go back an extra turn
      }
    }

    if (!colorChange) {
      // if there is a color change, just keep turning the same way, otherwise advance in twill sequence
      position = (position + 1) % 4;
    }

    const direction = DOUBLE_FACED_SEQUENCE[position];

    weavingInstructions[i] = {
      direction,
      position,
      numberOfTurns: 1,
    };
  }

  return weavingInstructions;
};

// This is the magic function that defines 3/1 broken twill weaving
// 3/1 broken twill patterns are defined by two charts
// note that twill direction change is the TWT name for GTT's long floats
// build the weaving instructions for a tablet
// from the specified row
export const buildTwillWeavingInstructionsForTablet = ({
  numberOfRows,
  patternDesign,
  startRow, // this is weaving chart row, not pattern chart row
  tabletIndex,
  weavingInstructionsForTablet,
}) => {
  const { twillDirection, twillPatternChart, twillDirectionChangeChart } =
    patternDesign;

  let weavingInstructions = [];

  if (weavingInstructionsForTablet) {
    weavingInstructions = weavingInstructionsForTablet.slice(0, numberOfRows);
  } // if rows are removed, instructions will become shorter

  let position;

  const { doubledChangeChart, doubledPatternChart } =
    buildTwillDoubledChartsForTablet({
      tabletIndex,
      twillDirectionChangeChart,
      twillPatternChart,
    });

  // look back two rows further to make sure of correct position
  const safeStartRow = startRow > 1 ? startRow - 2 : startRow;

  if (safeStartRow === 0) {
    // set the tablet's start position
    switch (twillDirection) {
      case 'S':
        position = (tabletIndex + 3) % 4;
        break;

      case 'Z':
        position = 3 - ((tabletIndex + 0) % 4);
        break;

      default:
        console.log(`Error: unknown twill direction: ${twillDirection}`);
        break;
    }
  } else {
    position = weavingInstructions[safeStartRow - 1].position % 4;
  }

  for (let i = safeStartRow; i < numberOfRows; i += 1) {
    // read the pattern chart for colour change
    // '.' is background colour
    // 'X' is foreground colour

    const currentColor = doubledPatternChart[i];
    let nextColor = currentColor;
    let prevColor = '.';
    let colorChange = false;

    if (i < numberOfRows - 1) {
      // last row has no next row
      nextColor = doubledPatternChart[i + 1];
    }

    if (i > 0) {
      prevColor = doubledPatternChart[i - 1];
    }

    // color change if either previous or next color is different
    if (nextColor !== currentColor) {
      colorChange = true;
    }

    if (prevColor !== currentColor) {
      colorChange = true;
      if (i === 0) {
        // tablet starts with foreground color
        position = (position + 3) % 4; // go back an extra turn
      }
    }

    const twillChange = doubledChangeChart[i]; // read the change chart for twill direction change
    // '.' is no change
    // 'X' is first pick of change, 'Y' is second pick of change

    if (!colorChange) {
      // if there is a color change, just keep turning the same way, otherwise advance in twill sequence
      position = (position + 1) % 4;
    }

    if (twillChange === 'Y') {
      // second pick of twill direction change
      position = (position + 2) % 4;
    }

    const direction = BROKEN_TWILL_SEQUENCE[position];

    weavingInstructions[i] = {
      direction,
      position,
      numberOfTurns: 1,
    };
  }

  return weavingInstructions;
};

export const buildDoubleFacedWeavingInstructionsByTablet = ({
  numberOfRows,
  numberOfTablets,
  patternDesign,
}) => {
  // build the weaving instructions
  const weavingInstructionsByTablet = [];

  for (let i = 0; i < numberOfTablets; i += 1) {
    const weavingInstructionsForTablet =
      buildDoubleFacedWeavingInstructionsForTablet({
        numberOfRows,
        patternDesign,
        startRow: 0,
        tabletIndex: i,
      });

    weavingInstructionsByTablet.push(weavingInstructionsForTablet);
  }

  return weavingInstructionsByTablet;
};

export const buildTwillWeavingInstructionsByTablet = ({
  numberOfRows,
  numberOfTablets,
  patternDesign,
}) => {
  // build the weaving instructions
  const weavingInstructionsByTablet = [];

  for (let i = 0; i < numberOfTablets; i += 1) {
    const weavingInstructionsForTablet = buildTwillWeavingInstructionsForTablet(
      {
        numberOfRows,
        patternDesign,
        startRow: 0,
        tabletIndex: i,
      },
    );

    weavingInstructionsByTablet.push(weavingInstructionsForTablet);
  }

  return weavingInstructionsByTablet;
};

export const buildWeavingInstructionsByTablet = ({
  numberOfRows,
  numberOfTablets,
  patternDesign,
  patternType,
}) => {
  // build weaving instructions from pattern design
  // recast to be by tablet, row
  // which is better for manipulating weaving instructions
  // instead of the more human-readable row, tablet
  // that is saved in the database
  let weavingInstructionsByTablet;

  switch (patternType) {
    case 'individual':
      weavingInstructionsByTablet = buildIndividualWeavingInstructionsByTablet({
        numberOfRows,
        numberOfTablets,
        patternDesign,
      });
      break;

    case 'allTogether':
      weavingInstructionsByTablet = buildAllTogetherWeavingInstructionsByTablet(
        {
          numberOfRows,
          numberOfTablets,
          patternDesign,
        },
      );
      break;

    case 'doubleFaced':
      weavingInstructionsByTablet = buildDoubleFacedWeavingInstructionsByTablet(
        {
          numberOfRows,
          numberOfTablets,
          patternDesign,
        },
      );
      break;

    case 'brokenTwill':
      weavingInstructionsByTablet = buildTwillWeavingInstructionsByTablet({
        numberOfRows,
        numberOfTablets,
        patternDesign,
      });
      break;

    default:
      break;
  }

  return weavingInstructionsByTablet;
};

export const buildOffsetThreadingForTablet = ({
  currentRow,
  holes,
  picksForTablet,
  threadingForTablet,
}) => {
  const offsetThreadingForTablet = [];
  let tabletOffset = 0;
  const chartRow = currentRow - 1; // humans count from row 1 but picks array starts with row 0

  if (chartRow > 0) {
    // offset if not on first row
    tabletOffset = picksForTablet[chartRow - 1].totalTurns;
    // pick 0 gives totalTurns after that pick
    // previous pick shows threading before this pick is woven
  }

  for (let j = 0; j < holes; j += 1) {
    offsetThreadingForTablet.push(
      threadingForTablet[modulus(j - tabletOffset, holes)],
    ); // threading runs D -> A because web pages are drawn from the top downwards, so offset goes the other way from what you might expect
  }

  return offsetThreadingForTablet;
};

export const buildOffsetThreading = ({
  currentRow,
  holes,
  numberOfTablets,
  picks,
  threadingByTablet,
}) => {
  // no offset, so no recalculation required
  if (currentRow === 1) {
    return threadingByTablet;
  }

  const offsetThreadingByTablet = [];

  for (let i = 0; i < numberOfTablets; i += 1) {
    offsetThreadingByTablet.push(
      buildOffsetThreadingForTablet({
        holes,
        picksForTablet: picks[i],
        threadingForTablet: threadingByTablet[i],
        currentRow,
      }),
    );
  }

  return offsetThreadingByTablet;
};
