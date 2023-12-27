import React from 'react';
import PropTypes from 'prop-types';

import './VerticalGuides.scss';

function VerticalGuides(props) {
  const verticalGuideInterval = 4;

  const { numberOfRows, numberOfTablets } = props;
  const cellWidth = 33;
  const numberOfSections = numberOfTablets / verticalGuideInterval;

  const centreGuideIndex =
    numberOfSections % 2 === 0 ? numberOfSections / 2 : undefined;
  // with an even number of sections, AND no partial sections, one of the section guides will be in the centre

  const verticalGuides = [];
  for (let i = 0; i < numberOfSections - 1; i += 1) {
    const left = i * verticalGuideInterval * cellWidth;
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
    const center = (cellWidth * numberOfTablets) / 2;

    verticalGuides.push(
      <div
        className='vertical-guide center'
        style={{
          left: center - 5,
        }}
      />,
    );
  }

  return (
    <div className='vertical-guides' style={{ height: numberOfRows * 33 }}>
      {verticalGuides}
    </div>
  );
}

// known bug that eslint does not reliably detect props inside functions in a functional component
// https://github.com/yannickcr/eslint-plugin-react/issues/885
VerticalGuides.propTypes = {
  numberOfRows: PropTypes.number.isRequired,
  numberOfTablets: PropTypes.number.isRequired,
};

export default VerticalGuides;
