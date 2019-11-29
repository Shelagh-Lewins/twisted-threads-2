// svg paths used to construct pattern preview
// TO DO add freehand styles - block, v_left, v_right, v_center

import React from 'react';
import PropTypes from 'prop-types';

// ////////////////////////
// Used in both threading and weaving charts
export function PathForwardWarp(props) {
	const { fill, stroke } = props;

	return (
		<path d="m0.51 111.54 40.545-55v-55l-40.545 55z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

PathForwardWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function PathBackwardWarp(props) {
	const { fill, stroke } = props;

	return (
		<path d="m41.05 111.54-40.545-55v-55l40.545 55z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

PathBackwardWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function PathTriangleRight(props) {
	const { fill, stroke } = props;

	return (
		<path d="m0.51 1.54-0.0006 110 40.545-55z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

PathTriangleRight.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function PathTriangleLeft(props) {
	const { fill, stroke } = props;

	return (
		<path d="m41.18 1.54 0.0006 110-40.545-55z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

PathTriangleLeft.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

/* export function SVGForwardEmpty() {
	return (
		<svg
			className="forward-empty"
			viewBox="0 0 256 256"
			style={{ 'fill': '#fff', 'stroke': '#000' }}
		>
			<g><path strokeWidth="10" d="m254.43 2.803-252.55 250.71h-0.62053" /></g>
		</svg>
	);
}

export function SVGBackwardEmpty() {
	return (
		<svg
			className="backward-empty"
			viewBox="0 0 256 256"
			style={{ 'fill': '#fff', 'stroke': '#000' }}
		>
			<g><path strokeWidth="10" d="m2.4708 2.7978 252.56 250.71h0.62053" /></g>
		</svg>
	);
} */

export function PathBlock(props) {
	const { fill, stroke } = props;

	return (
		<path d="m41.05 85.54h-40.545v-54.999h40.545z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

// freehand
PathBlock.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function PathVerticalLeftWarp(props) {
	const { fill, stroke } = props;

	return (
		<path d="m29.922 85.614h-29.491v-55.147h29.491z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

PathVerticalLeftWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function PathVerticalRightWarp(props) {
	const { fill, stroke } = props;

	return (
		<path d="m41.121 85.614h-29.491v-55.147h29.491z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

PathVerticalRightWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function PathVerticalCenterWarp(props) {
	const { fill, stroke } = props;

	return (
		<path d="m35.721 85.614h-29.491v-55.147h29.491z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

PathVerticalCenterWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

// ///////////////////////////
// 2, 3 turns
// forward 2 turns
export function PathForwardWarp2(props) {
	const { fill, stroke } = props;

	return (
		<>
			<path d="m0.36291 112 40.839-54.951v-27.538l-40.839 54.947z" stroke={stroke} strokeWidth="1.015" fill={stroke} />
			<path d="m0.36291 83.917 40.839-54.947v-27.538l-40.839 54.947z" stroke={fill} strokeWidth="1.015" fill={fill} />
		</>
	);
}

PathForwardWarp2.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

// forward 3 turns
export function PathForwardWarp3(props) {
	const { fill, stroke1, stroke2 } = props;

	return (
		<>
			<path d="m0.45734 112.16 40.961-55.463v-18.957l-40.961 55.458z" stroke="#444" strokeWidth="1.015" fill={stroke2} />
			<path d="m0.45734 93.351 40.961-55.458v-18.957l-40.961 55.458z" stroke="#444" strokeWidth="1.015" fill={stroke1} />
			<path d="m0.45734 75.08 40.961-55.457v-18.957l-40.961 55.458z" stroke="#444" strokeWidth="1.015" fill={fill} />
		</>
	);
}

PathForwardWarp3.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke1': PropTypes.string.isRequired,
	'stroke2': PropTypes.string.isRequired,
};

// backward 2 turns
export function PathBackwardWarp2(props) {
	const { fill, stroke } = props;

	return (
		<>
			<path d="m41.202 112-40.839-54.951v-27.538l40.839 54.947" stroke={stroke} strokeWidth="1.015" fill={stroke} />
			<path d="m41.202 83.917-40.839-54.947v-27.538l40.839 54.947z" stroke={fill} strokeWidth="1.015" fill={fill} />
		</>
	);
}

PathBackwardWarp2.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

// backward 3 turns
export function PathBackwardWarp3(props) {
	const { fill, stroke1, stroke2 } = props;

	return (
		<>
			<path d="m41.418 112.16-40.961-55.463v-18.957l40.961 55.458z" stroke="#444" strokeWidth="1.015" fill={stroke2} />
			<path d="m41.418 93.351-40.961-55.458v-18.957l40.961 55.458z" stroke="#444" strokeWidth="1.015" fill={stroke1} />
			<path d="m41.418 75.08-40.961-55.457v-18.957l40.961 55.458z" stroke="#444" strokeWidth="1.015" fill={fill} />
		</>
	);
}

PathBackwardWarp3.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke1': PropTypes.string.isRequired,
	'stroke2': PropTypes.string.isRequired,
};
