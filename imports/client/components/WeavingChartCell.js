import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';

import {
  getCombinedOrientationForTablet,
  getCombinedPickForChart,
  getCombinedThreadingForTablet,
  getHoles,
  getOrientationForTablet,
  getPalette,
  getPickForChart,
  getThreadingForTablet,
} from '../modules/pattern';
import { modulus } from '../modules/weavingUtils';

export function WeavingChartCellBase(props) {
  const {
    direction,
    holes,
    numberOfTurns,
    orientation,
    palette,
    tabletIndex,
    threadingForTablet,
    totalTurns,
  } = props;

  const netTurns = modulus(totalTurns, holes);

  // if not idle, show direction
  let directionClass = '';
  if (numberOfTurns !== 0) {
    if (direction === 'F') {
      directionClass = 'forward';
    } else if (direction === 'B') {
      directionClass = 'backward';
    }
  }

  return (
    <span className={directionClass}>
      <ChartSVG
        direction={direction}
        holes={holes}
        netTurns={netTurns}
        numberOfTurns={numberOfTurns}
        orientation={orientation}
        palette={palette}
        tabletIndex={tabletIndex}
        threadingForTablet={threadingForTablet}
      />
    </span>
  );
}

WeavingChartCellBase.propTypes = {
  direction: PropTypes.string.isRequired,
  holes: PropTypes.number.isRequired,
  numberOfTurns: PropTypes.number.isRequired,
  orientation: PropTypes.string.isRequired,
  palette: PropTypes.arrayOf(PropTypes.any).isRequired,
  tabletIndex: PropTypes.number.isRequired,
  threadingForTablet: PropTypes.arrayOf(PropTypes.any).isRequired,
  totalTurns: PropTypes.number.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { combined, tabletIndex, rowIndex } = ownProps;

  const { direction, numberOfTurns, totalTurns } = combined
    ? getCombinedPickForChart(state, tabletIndex, rowIndex)
    : getPickForChart(state, tabletIndex, rowIndex);

  return {
    direction: direction,
    holes: getHoles(state),
    numberOfTurns: numberOfTurns,
    orientation: combined
      ? getCombinedOrientationForTablet(state, tabletIndex)
      : getOrientationForTablet(state, tabletIndex),
    palette: getPalette(state),
    threadingForTablet: combined
      ? getCombinedThreadingForTablet(state, tabletIndex)
      : getThreadingForTablet(state, tabletIndex),
    totalTurns: totalTurns,
  };
}

export default connect(mapStateToProps)(WeavingChartCellBase);
