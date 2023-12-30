import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getShowGuideForTablet } from '../modules/pattern';

function ShowGuideForTabletCell(props) {
  const {
    handleChangeShowGuideCheckbox,
    isDisabled,
    showGuideForTablet,
    tabletIndex,
  } = props;

  const identifier = `show-guide-for-tablet-${tabletIndex + 1}`;
  const tooltip = showGuideForTablet
    ? `Tablet ${tabletIndex + 1}: guide for tablet is shown`
    : `Tablet ${tabletIndex + 1}: no guide is shown for tablet`;

  return (
    <span>
      <input
        checked={showGuideForTablet}
        disabled={isDisabled}
        type='checkbox'
        id={identifier}
        key={identifier}
        name={identifier}
        onChange={(event) => handleChangeShowGuideCheckbox(event, tabletIndex)}
        title={tooltip}
      />
      <label htmlFor={identifier}>{tooltip}</label>
    </span>
  );
}

ShowGuideForTabletCell.propTypes = {
  handleChangeShowGuideCheckbox: PropTypes.func,
  isDisabled: PropTypes.bool.isRequired,
  showGuideForTablet: PropTypes.bool.isRequired,
  tabletIndex: PropTypes.number.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { tabletIndex } = ownProps;

  return {
    showGuideForTablet: getShowGuideForTablet(state, tabletIndex),
  };
}

export default connect(mapStateToProps)(ShowGuideForTabletCell);
