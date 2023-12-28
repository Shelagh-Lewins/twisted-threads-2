import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import './VerticalGuides.scss';

function VerticalGuides(props) {
  const verticalGuideInterval = 4;
  const { numberOfTablets, reduceContrast, showVerticalGuides } = props;
  const cellWidth = 33;
  const numberOfSections = numberOfTablets / verticalGuideInterval;
  const centreGuideIndex =
    numberOfSections % 2 === 0 ? numberOfSections / 2 : undefined;
  // with an even number of sections, AND no partial sections, one of the section guides will be in the centre

  const verticalGuides = [];
  for (let i = 0; i < numberOfSections - 1; i += 1) {
    const left = i * verticalGuideInterval * cellWidth + 5;
    const width = verticalGuideInterval * cellWidth;

    verticalGuides.push(
      <div
        className={`vertical-guide ${
          i + 1 === centreGuideIndex ? 'center' : ''
        }`}
        style={{
          left,
          width,
        }}
        key={`guide-${i}`}
      />,
    );
  }

  // we need to add a guide for the centre
  if (centreGuideIndex === undefined) {
    const center = (cellWidth * (numberOfTablets - 1)) / 2;

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
  showVerticalGuides: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
  return {
    showVerticalGuides: state.pattern.showVerticalGuides,
  };
}

export default connect(mapStateToProps)(VerticalGuides);
