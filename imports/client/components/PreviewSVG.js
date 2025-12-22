// return the correct SVG for a pick in the pattern preview

import React from 'react';
import PropTypes from 'prop-types';
import {
  PathBackwardWarp,
  PathBackwardWarp2,
  PathBackwardWarp3,
  PathForwardWarp,
  PathForwardWarp2,
  PathForwardWarp3,
  PathTriangleLeft,
  PathTriangleLeft2,
  PathTriangleLeft3,
  PathTriangleRight,
  PathTriangleRight2,
  PathTriangleRight3,
} from '../modules/previewPaths';
import { getPrevColor, getThread, modulus } from '../modules/weavingUtils';

export default function PreviewSVG({
  holes,
  numberOfRows,
  orientation,
  palette,
  patternWillRepeat,
  picksForTablet,
  rowIndex,
  showBackOfBand,
  tabletIndex,
  threadingForTablet,
}) {
  // picksByTablet are calculated after the pattern data has loaded so can be blank
  if (!picksForTablet) {
    return;
  }

  const { direction, numberOfTurns, totalTurns } = picksForTablet[rowIndex];

  const netTurns = modulus(totalTurns, holes);
  const emptyHoleColor = 'transparent'; // transparent to show weft
  const borderColor = '#444';

  let reversal = false;

  // check for reversal
  let previousPick;

  if (rowIndex !== 0) {
    // there is a previous row
    previousPick = picksForTablet[rowIndex - 1];
  } else if (patternWillRepeat) {
    previousPick = picksForTablet[numberOfRows - 1];
  }

  if (previousPick && direction !== previousPick.direction) {
    reversal = true;
  }

  // however if reversing after idle
  // the reversal wil have been handled by the idle
  if (previousPick?.numberOfTurns === 0) {
    let pickBeforeLast;

    if (rowIndex !== 0) {
      // there is a previous row
      pickBeforeLast = picksForTablet[rowIndex - 2];
    } else if (patternWillRepeat) {
      pickBeforeLast = picksForTablet[numberOfRows - 2];
    }

    if (pickBeforeLast && direction !== pickBeforeLast.direction) {
      reversal = false; // we don't need to show a triangle
    }
  }

  // idle will reverse on next pick?
  if (numberOfTurns === 0) {
    let nextPick;

    if (rowIndex !== numberOfRows - 1) {
      // there is a next row
      nextPick = picksForTablet[rowIndex + 1];
    } else if (patternWillRepeat) {
      nextPick = picksForTablet[0];
    }

    if (
      nextPick &&
      previousPick &&
      nextPick.direction !== previousPick?.direction
    ) {
      reversal = true;
    }
  }

  const { holeToShow, threadAngle, threadColor } = getThread({
    direction,
    emptyHoleColor,
    holes,
    netTurns,
    orientation,
    palette,
    showBackOfBand,
    threadingForTablet,
  });

  let svg;

  // idle or single turn, just show current thread
  if (numberOfTurns === 0 || numberOfTurns === 1) {
    svg =
      threadAngle === '\\' ? (
        <PathBackwardWarp fill={threadColor} stroke={borderColor} />
      ) : (
        <PathForwardWarp fill={threadColor} stroke={borderColor} />
      );

    if (reversal) {
      // If tablet is turning, we base it on current direction
      let effectiveThreadAngle = threadAngle;

      // If tablet is idling but will reverse next turn
      // we base it on next turn's direction to prepare
      if (numberOfTurns === 0) {
        if (rowIndex !== 0) {
          // when idling in the first row
          // we dont need to do this
          effectiveThreadAngle = threadAngle === '\\' ? '//' : '\\';
        }
      }

      svg =
        effectiveThreadAngle === '\\' ? (
          <PathTriangleRight fill={threadColor} stroke={borderColor} />
        ) : (
          <PathTriangleLeft fill={threadColor} stroke={borderColor} />
        );
    }
  } else if (numberOfTurns === 2) {
    const prevThreadColor1 = getPrevColor({
      direction,
      holes,
      holeToShow,
      offset: 1,
      palette,
      tabletIndex,
      threadingForTablet,
    });
    svg =
      threadAngle === '\\' ? (
        <PathBackwardWarp2
          fill1={prevThreadColor1}
          fill2={threadColor}
          stroke={borderColor}
        />
      ) : (
        <PathForwardWarp2
          fill1={prevThreadColor1}
          fill2={threadColor}
          stroke={borderColor}
        />
      );

    if (reversal) {
      svg =
        threadAngle === '\\' ? (
          <PathTriangleRight2
            fill1={prevThreadColor1}
            fill2={threadColor}
            stroke={borderColor}
          />
        ) : (
          <PathTriangleLeft2
            fill1={prevThreadColor1}
            fill2={threadColor}
            stroke={borderColor}
          />
        );
    }
  } else if (numberOfTurns === 3) {
    const prevThreadColor1 = getPrevColor({
      direction,
      holes,
      holeToShow,
      offset: 1,
      palette,
      tabletIndex,
      threadingForTablet,
    });
    const prevThreadColor2 = getPrevColor({
      direction,
      holes,
      holeToShow,
      offset: 2,
      palette,
      tabletIndex,
      threadingForTablet,
    });

    svg =
      threadAngle === '\\' ? (
        <PathBackwardWarp3
          fill1={prevThreadColor2}
          fill2={prevThreadColor1}
          fill3={threadColor}
          stroke={borderColor}
        />
      ) : (
        <PathForwardWarp3
          fill1={prevThreadColor2}
          fill2={prevThreadColor1}
          fill3={threadColor}
          stroke={borderColor}
        />
      );

    if (reversal) {
      svg =
        threadAngle === '\\' ? (
          <PathTriangleRight3
            fill1={prevThreadColor2}
            fill2={prevThreadColor1}
            fill3={threadColor}
            stroke={borderColor}
          />
        ) : (
          <PathTriangleLeft3
            fill1={prevThreadColor2}
            fill2={prevThreadColor1}
            fill3={threadColor}
            stroke={borderColor}
          />
        );
    }
  }

  return svg;
}

PreviewSVG.propTypes = {
  currentRepeat: PropTypes.number.isRequired,
  numberOfRepeats: PropTypes.number.isRequired,
  numberOfRows: PropTypes.number.isRequired,
  patternWillRepeat: PropTypes.bool.isRequired,
  picksForTablet: PropTypes.arrayOf(PropTypes.any).isRequired,
  rowIndex: PropTypes.number.isRequired,
  showBackOfBand: PropTypes.bool,
  tabletIndex: PropTypes.number.isRequired,
};
