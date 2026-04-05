import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import InfoButton from './InfoButton';
import { getIncludeInTwistForTablet } from '../modules/pattern';

const INCLUDE_IN_TWIST_INFO_TEXT =
  'Uncheck the "Include in twist calculations" checkbox for any tablet that you will always turn forwards. Otherwise, such tablets may prevent the pattern from being identified as twist neutral or repeating.';
const INCLUDE_IN_TWIST_INFO_TITLE =
  'Click to learn about the "Include in twist calculations" checkboxes';

export function IncludeInTwistCell(props) {
  const {
    handleChangeIncludInTwistCheckbox,
    isEditing,
    includeInTwistForTablet,
    tabletIndex,
    tabletOffset = 0,
  } = props;

  const tabletNumber = tabletOffset + tabletIndex + 1;
  const identifier = `include-in-twist-${tabletNumber}`;
  const tooltip = includeInTwistForTablet
    ? `Tablet ${tabletNumber}: included in twist calculations`
    : `Tablet ${tabletNumber}: excluded from twist calculations`;

  return (
    <span>
      <input
        checked={includeInTwistForTablet}
        disabled={!isEditing}
        type='checkbox'
        id={identifier}
        key={identifier}
        name={identifier}
        onChange={() => handleChangeIncludInTwistCheckbox(tabletIndex)}
        title={tooltip}
      />
      <label htmlFor={identifier}>{tooltip}</label>
    </span>
  );
}

IncludeInTwistCell.propTypes = {
  handleChangeIncludInTwistCheckbox: PropTypes.func,
  isEditing: PropTypes.bool.isRequired,
  includeInTwistForTablet: PropTypes.bool.isRequired,
  tabletIndex: PropTypes.number.isRequired,
  tabletOffset: PropTypes.number,
};

export function IncludeInTwistButtons({ children }) {
  return (
    <div className='include-in-twist-buttons'>
      <div className='twist-info-button'>
        <InfoButton
          message={INCLUDE_IN_TWIST_INFO_TEXT}
          title={INCLUDE_IN_TWIST_INFO_TITLE}
        />
      </div>
      <ul>{children}</ul>
    </div>
  );
}

IncludeInTwistButtons.propTypes = {
  children: PropTypes.node.isRequired,
};

function mapStateToProps(state, ownProps) {
  const { tabletIndex } = ownProps;

  return {
    includeInTwistForTablet: getIncludeInTwistForTablet(state, tabletIndex),
  };
}

// CAUTION: the default connected export uses getIncludeInTwistForTablet which reads from
// state.pattern.* and expects a main-pattern (local) tablet index.
// Always use the named export { IncludeInTwistCell } when rendering border tablets,
// supplying includeInTwistForTablet directly via props (as Threading.js does).
export default connect(mapStateToProps)(IncludeInTwistCell);
