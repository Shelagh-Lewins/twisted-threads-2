import React from 'react';
import PropTypes from 'prop-types';
import getSVGComponent from '../modules/getSVGComponent';

export default function FreehandSVG(props) {
	const {
		'chartCell': { threadColor, threadShape },
		palette,
	} = props;

	const Svgname = getSVGComponent(threadShape);
	const threadColorValue = palette[threadColor];
	const strokeColor = '#000000';

	let svg;

	switch (threadShape) {
		case 'idle':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		case 'backwardEmpty':
			svg = (
				<Svgname />
			);
			break;

		case 'forwardEmpty':
			svg = (
				<Svgname />
			);
			break;

		case 'backwardWarp':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		case 'backwardWarp2':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		case 'backwardWarp3':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke1={strokeColor}
					stroke2={strokeColor}
				/>
			);
			break;

		case 'forwardWarp':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		case 'forwardWarp2':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		case 'forwardWarp3':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke1={strokeColor}
					stroke2={strokeColor}
				/>
			);
			break;

		case 'verticalLeftWarp':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		case 'verticalCenterWarp':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		case 'verticalRightWarp':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		case 'block':
			svg = (
				<Svgname
					fill={threadColorValue}
					stroke={strokeColor}
				/>
			);
			break;

		default:
			break;
	}

	return svg;
}

FreehandSVG.propTypes = {
	'chartCell': PropTypes.objectOf(PropTypes.any).isRequired,
	'palette': PropTypes.arrayOf(PropTypes.any).isRequired,
};
