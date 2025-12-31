import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './SetPreview.scss';

function SetPreview({ numberOfThumbnails, patternPreviewAddresses, patterns }) {
  // use pattern previews for the first four patterns
  const patternPreviewElms = [];

  for (let i = 0; i < numberOfThumbnails; i += 1) {
    let previewStyle = {};
    const pattern = patterns[i];

    if (pattern && patternPreviewAddresses[i]) {
      previewStyle = {
        backgroundImage: `url(${patternPreviewAddresses[i]})`,
      };
    }

    const elm = (
      <div
        key={`pattern-preview-${i}`}
        style={previewStyle}
        className='pattern-preview'
      />
    );

    patternPreviewElms.push(elm);
  }

  return <div className='pattern-previews'>{patternPreviewElms}</div>;
}

SetPreview.propTypes = {
  numberOfThumbnails: PropTypes.number.isRequired,
  patternPreviewAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
  patterns: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default SetPreview;
