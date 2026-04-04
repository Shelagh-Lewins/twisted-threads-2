import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import PreviewSVG from './PreviewSVG';
import { getPreviewShouldUpdate } from '../modules/pattern';

class BorderPreviewCell extends Component {
  shouldComponentUpdate(nextProps) {
    const { componentShouldUpdate } = nextProps;
    return componentShouldUpdate;
  }

  render() {
    const {
      border,
      borderTabletIndex,
      currentRepeat,
      holes,
      numberOfRepeats,
      numberOfRows,
      palette,
      patternWillRepeat,
      rowIndex,
      showBackOfBand,
      tabletIndex,
    } = this.props;

    if (!border || !border.picks || !border.orientations || !border.threadingByTablet) {
      return null;
    }

    const orientation = border.orientations[borderTabletIndex];
    const picksForTablet = border.picks[borderTabletIndex];
    const threadingForTablet = border.threadingByTablet[borderTabletIndex];

    if (!orientation || !picksForTablet) {
      return null;
    }

    return (
      <PreviewSVG
        currentRepeat={currentRepeat}
        holes={holes}
        numberOfRepeats={numberOfRepeats}
        numberOfRows={numberOfRows}
        orientation={orientation}
        palette={palette}
        patternWillRepeat={patternWillRepeat}
        picksForTablet={picksForTablet}
        rowIndex={rowIndex}
        showBackOfBand={showBackOfBand}
        tabletIndex={tabletIndex}
        threadingForTablet={threadingForTablet}
      />
    );
  }
}

BorderPreviewCell.propTypes = {
  border: PropTypes.objectOf(PropTypes.any).isRequired,
  borderTabletIndex: PropTypes.number.isRequired,
  componentShouldUpdate: PropTypes.bool.isRequired,
  currentRepeat: PropTypes.number.isRequired,
  holes: PropTypes.number.isRequired,
  numberOfRepeats: PropTypes.number.isRequired,
  numberOfRows: PropTypes.number.isRequired,
  palette: PropTypes.arrayOf(PropTypes.any).isRequired,
  patternWillRepeat: PropTypes.bool.isRequired,
  rowIndex: PropTypes.number.isRequired,
  showBackOfBand: PropTypes.bool,
  tabletIndex: PropTypes.number.isRequired,
};

function mapStateToProps(state) {
  return {
    componentShouldUpdate: getPreviewShouldUpdate(state),
  };
}

export default connect(mapStateToProps)(BorderPreviewCell);
