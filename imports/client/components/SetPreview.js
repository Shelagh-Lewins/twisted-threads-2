import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './SetPreview.scss';
import { NUMBER_OF_THUMBNAILS_IN_SET } from '../../modules/parameters';

function SetPreview({ patternPreviewAddresses, patterns }) {
  // use pattern previews for the first four patterns
  const patternPreviewElms = [];

  for (let i = 0; i < NUMBER_OF_THUMBNAILS_IN_SET; i += 1) {
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

  return <div className='set-preview'>{patternPreviewElms}</div>;
}

SetPreview.propTypes = {
  patternPreviewAddresses: PropTypes.arrayOf(PropTypes.string).isRequired,
  patterns: PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default SetPreview;
