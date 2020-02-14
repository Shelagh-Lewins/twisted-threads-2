// return the correct SVG for a pick in the pattern preview

import React from 'react';
import PropTypes from 'prop-types';
import {
	PathBackwardWarp,
	PathBackwardWarp2,
	PathBackwardWarp3,
	PathBlock,
	PathForwardWarp,
	PathForwardWarp2,
	PathForwardWarp3,
	PathTriangleLeft,
	PathTriangleLeft2,
	PathTriangleLeft3,
	PathTriangleRight,
	PathTriangleRight2,
	PathTriangleRight3,
	PathVerticalCenterWarp,
	PathVerticalLeftWarp,
	PathVerticalRightWarp,
} from '../modules/previewPaths';
import {
	getPrevColor,
	getThread,
	modulus,
} from '../modules/weavingUtils';

export default function FreehandPreviewSVG({
	holes,
	numberOfRows,
	orientation,
	palette,
	patternWillRepeat,
	picksForTablet,
	rowIndex,
	tabletIndex,
	threadingForTablet,
}) {

	let svg;
	const borderColor = '#444';
	const threadColor = 'FF0000';

	svg = <PathForwardWarp fill={threadColor} stroke={borderColor}	/>;

	

	return svg;
}

FreehandPreviewSVG.propTypes = {
	//'currentRepeat': PropTypes.number.isRequired,
	//'numberOfRepeats': PropTypes.number.isRequired,
	//'numberOfRows': PropTypes.number.isRequired,
	//'patternWillRepeat': PropTypes.bool.isRequired,
	//'picksForTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'rowIndex': PropTypes.number.isRequired,
	'tabletIndex': PropTypes.number.isRequired,
};
