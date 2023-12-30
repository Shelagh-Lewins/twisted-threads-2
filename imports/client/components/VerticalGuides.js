import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './VerticalGuides.scss';

function VerticalGuides(props) {
  const {
    numberOfTablets,
    reduceContrast,
    showTabletGuides,
    showCenterGuide,
    tabletGuides,
  } = props;
  const showVerticalGuides = showTabletGuides || showCenterGuide;
  const cellWidth = 33;
  const verticalGuides = [];

  if (showTabletGuides) {
    tabletGuides.forEach((tabletGuide, tabletIndex) => {
      const left = tabletIndex * cellWidth + 5;

      if (tabletGuide) {
        verticalGuides.push(
          <div
            className='vertical-guide'
            style={{
              left,
            }}
            key={`guide-${tabletIndex}`}
          />,
        );
      }
    });
  }

  if (showCenterGuide) {
    const center = Math.floor((cellWidth * (numberOfTablets - 1)) / 2);

    verticalGuides.push(
      <div
        className='vertical-guide center'
        style={{
          left: center,
          width: 33,
        }}
        key='guide-center'
      />,
    );
  }

  return showVerticalGuides ? (
    <div
      className={`vertical-guides ${reduceContrast ? 'reduce-contrast' : ''}`}
    >
      {verticalGuides}
    </div>
  ) : null;
}

VerticalGuides.propTypes = {
  numberOfTablets: PropTypes.number.isRequired,
  reduceContrast: PropTypes.bool,
  showTabletGuides: PropTypes.bool.isRequired,
  showCenterGuide: PropTypes.bool.isRequired,
  tabletGuides: PropTypes.arrayOf(PropTypes.bool),
};

function mapStateToProps(state) {
  return {
    showTabletGuides: state.pattern.showTabletGuides,
    showCenterGuide: state.pattern.showCenterGuide,
    tabletGuides: state.pattern.tabletGuides,
  };
}

export default connect(mapStateToProps)(VerticalGuides);
