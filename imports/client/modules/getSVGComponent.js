// allow svg name to be specified as a string
// used for freehand pattern chart

import {
	// reused from simulation patterns
	SVGBackwardEmpty,
	SVGForwardEmpty,
	SVGBackwardWarp,
	SVGBackwardWarp2,
	SVGBackwardWarp3,
	SVGForwardWarp,
	SVGForwardWarp2,
	SVGForwardWarp3,
	SVGIdle,
	// freehand only
	SVGVerticalLeftWarp,
	SVGVerticalCenterWarp,
	SVGVerticalRightWarp,
	SVGBlock,
} from './svg';

const getSVGComponent = (name) => {
	switch (name) {
		case 'backwardEmpty':
			return SVGBackwardEmpty;

		case 'forwardEmpty':
			return SVGForwardEmpty;

		case 'backwardWarp':
			return SVGBackwardWarp;

		case 'backwardWarp2':
			return SVGBackwardWarp2;

		case 'backwardWarp3':
			return SVGBackwardWarp3;

		case 'forwardWarp':
			return SVGForwardWarp;

		case 'forwardWarp2':
			return SVGForwardWarp2;

		case 'forwardWarp3':
			return SVGForwardWarp3;

		case 'idle':
			return SVGIdle;

		case 'verticalLeftWarp':
			return SVGVerticalLeftWarp;

		case 'verticalCenterWarp':
			return SVGVerticalCenterWarp;

		case 'verticalRightWarp':
			return SVGVerticalRightWarp;

		case 'block':
			return SVGBlock;

		default:
			break;
	}
};

export default getSVGComponent;
