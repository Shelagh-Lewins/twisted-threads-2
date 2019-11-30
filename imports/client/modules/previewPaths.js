// svg paths used to construct pattern preview

import React from 'react';
import PropTypes from 'prop-types';

// ////////////////////////
// Single turn, no reversal
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

// ///////////////////////////
// forward 2 turns
export function PathForwardWarp2(props) {
	const { fill1, fill2, stroke } = props;

	return (
		<>
			<path d="m0.36291 112 40.839-54.951v-27.538l-40.839 54.947z" stroke={stroke} strokeWidth="1.015" fill={fill1} />
			<path d="m0.36291 83.917 40.839-54.947v-27.538l-40.839 54.947z" stroke={stroke} strokeWidth="1.015" fill={fill2} />
		</>
	);
}

PathForwardWarp2.propTypes = {
	'fill1': PropTypes.string.isRequired,
	'fill2': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

// backward 2 turns
export function PathBackwardWarp2(props) {
	const { fill1, fill2, stroke } = props;

	return (
		<>
			<path d="m41.202 112-40.839-54.951v-27.538l40.839 54.947" stroke={stroke} strokeWidth="1.015" fill={fill1} />
			<path d="m41.202 83.917-40.839-54.947v-27.538l40.839 54.947z" stroke={stroke} strokeWidth="1.015" fill={fill2} />
		</>
	);
}

PathBackwardWarp2.propTypes = {
	'fill1': PropTypes.string.isRequired,
	'fill2': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

// ///////////////////
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

// /////////////////////////
// reversal
// 1 turn
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

// 2 turns
export function PathTriangleRight2(props) {
	const { fill1, fill2, stroke } = props;

	return (
		<>
			<path d="m 0.3518,28.260067 -4.5e-4,83.399003 30.741,-41.699003 z" stroke={stroke} strokeWidth="1.015" fill={fill1} />
			<path d="m 0.50225,0.98106746 40.839,54.94699954 0,0.09961 -10.156,13.777 -30.683,-41.286 0,-27.53799954 z" stroke={stroke} strokeWidth="1.015" fill={fill2} />
		</>
	);
}

PathTriangleRight2.propTypes = {
	'fill1': PropTypes.string.isRequired,
	'fill2': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function PathTriangleLeft2(props) {
	const { fill1, fill2, stroke } = props;

	return (
		<>
			<path d="m 0.3518,28.260067 -4.5e-4,83.399003 30.741,-41.699003 z" stroke={stroke} strokeWidth="1.015" fill={fill1} />
			<path d="m 0.50225,0.98106746 40.839,54.94699954 0,0.09961 -10.156,13.777 -30.683,-41.286 0,-27.53799954 z" stroke={stroke} strokeWidth="1.015" fill={fill2} />
		</>
	);
}

PathTriangleLeft2.propTypes = {
	'fill1': PropTypes.string.isRequired,
	'fill2': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

// 3 turns
export function PathTriangleRight3(props) {
	const {
		fill1,
		fill2,
		fill3,
		stroke,
	} = props;

	return (
		<>
			<path d="m0.5062 35.905-0.002 75.905 28.005-37.987-28.003-37.917z" stroke={stroke} strokeWidth="1.015" fill={fill1} />
			<path d="m0.45703 18.938v18.957l27.406 37.107 6.994-9.488-34.4-46.576z" stroke={stroke} strokeWidth="1.015" fill={fill2} />
			<path d="m0.45703 0.66797v18.957l34.147 46.232 6.812-9.24v-0.492l-40.959-55.457z" stroke={stroke} strokeWidth="1.015" fill={fill3} />
		</>
	);
}

PathTriangleRight3.propTypes = {
	'fill1': PropTypes.string.isRequired,
	'fill2': PropTypes.string.isRequired,
	'fill3': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function PathTriangleLeft3(props) {
	const {
		fill1,
		fill2,
		fill3,
		stroke,
	} = props;

	return (
		<>
			<path d="m40.954 35.905 0.002 75.905-28.005-37.987 28.003-37.917z" stroke={stroke} strokeWidth="1.015" fill={fill1} />
			<path d="m41.003 18.936v18.958l-27.407 37.108-6.9946-9.488 34.402-46.578z" stroke={stroke} strokeWidth="1.015" fill={fill2} />
			<path d="m41.003 0.66617v18.958l-34.147 46.234-6.8127-9.2405v-0.4922l40.96-55.46z" stroke={stroke} strokeWidth="1.015" fill={fill3} />
		</>
	);
}

PathTriangleLeft3.propTypes = {
	'fill1': PropTypes.string.isRequired,
	'fill2': PropTypes.string.isRequired,
	'fill3': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

// /////////////////////////
// freehand
export function PathBlock(props) {
	const { fill, stroke } = props;

	return (
		<path d="m41.05 85.54h-40.545v-54.999h40.545z" stroke={stroke} strokeWidth="1.015" fill={fill} />
	);
}

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
