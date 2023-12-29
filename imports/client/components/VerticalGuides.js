import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './VerticalGuides.scss';

function VerticalGuides(props) {
  const verticalGuideInterval = 4;
  const { numberOfTablets, reduceContrast, showTabletGuides, showCenterGuide } =
    props;
  const showVerticalGuides = showTabletGuides || showCenterGuide;
  const cellWidth = 33;
  const numberOfSections = numberOfTablets / verticalGuideInterval;
  //const centreGuideIndex =
  //numberOfSections % 2 === 0 ? numberOfSections / 2 : undefined;
  // with an even number of sections, AND no partial sections, one of the section guides will be in the centre
  console.log('tablets', numberOfTablets);
  console.log('show tablet guides', showTabletGuides);
  const verticalGuides = [];
  if (showTabletGuides) {
    for (let i = 0; i < numberOfSections - 1; i += 1) {
      const left = i * verticalGuideInterval * cellWidth + 5;
      const width = verticalGuideInterval * cellWidth;

      verticalGuides.push(
        <div
          className='vertical-guide'
          style={{
            left,
            width,
          }}
          key={`guide-${i}`}
        />,
      );
    }
  }

  // we need to add a guide for the centre
  if (showCenterGuide) {
    const center = Math.floor((cellWidth * (numberOfTablets - 1)) / 2);
    console.log('center', center);
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
};

function mapStateToProps(state) {
  return {
    showTabletGuides: state.pattern.showTabletGuides,
    showCenterGuide: state.pattern.showCenterGuide,
  };
}

export default connect(mapStateToProps)(VerticalGuides);
