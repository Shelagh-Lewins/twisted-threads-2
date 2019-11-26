// svg elements used for palette, threading and weaving chart

import React from 'react';
import PropTypes from 'prop-types';

// ////////////////////////
// Used in both threading and weaving charts
export function SVGForwardWarp(props) {
	const { fill, stroke } = props;

	return (
		<svg
			className="forward-warp"
			viewBox="0 0 256 256"
			style={{ 'fill': fill, 'stroke': stroke }}
		>
			<g><ellipse rx="140.42" transform="rotate(-45)" ry="70.214" cy="180.72" cx="-.33336" strokeWidth="9.9099" /></g>
		</svg>
	);
}

SVGForwardWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function SVGBackwardWarp(props) {
	const { fill, stroke } = props;

	return (
		<svg
			className="backward-warp"
			viewBox="0 0 256 256"
			style={{ 'fill': fill, 'stroke': stroke }}
		>
			<g><ellipse rx="140.42" transform="matrix(-.70711 -.70711 -.70711 .70711 0 0)" ry="70.214" cy=".33336" cx="-180.72" strokeWidth="9.9099" /></g>
		</svg>
	);
}

SVGBackwardWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function SVGForwardEmpty() {
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
}

// /////////////////////////
// Palette only
export function SVGPaletteEmpty(props) {
	const { stroke } = props;
	// xmlns causes a namespace error. It may be unnecessary.
	/* return (
		<svg xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns="http://www.w3.org/2000/svg" height="256" viewBox="0 0 256 256" width="256" version="1.1" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/">
			<path id="path4136" d="m2.4708 2.7978 252.56 250.71h0.62053" stroke="#000" strokeWidth="10" fill="none" />
			<path id="path4136-0" d="m254.43 2.803-252.55 250.71h-0.62053" stroke="#000" strokeWidth="10" fill="none" />
		</svg>
	);
	*/
	return (
		<svg
			className="palette-empty"
			viewBox="0 0 256 256"
			style={{ 'stroke': stroke }}
		>
			<path d="m2.4708 2.7978 252.56 250.71h0.62053" strokeWidth="10" fill="none" />
			<path d="m254.43 2.803-252.55 250.71h-0.62053" strokeWidth="10" fill="none" />
		</svg>
	);
}

SVGPaletteEmpty.propTypes = {
	'stroke': PropTypes.string.isRequired,
};

// /////////////////////////
// Weaving chart only
export function SVGVerticalLeftWarp(props) {
	const { fill, stroke } = props;

	return (
		<svg
			className="v-left-warp"
			viewBox="0 0 256 256"
			style={{ 'fill': fill, 'stroke': stroke }}
		>
			<g><ellipse rx="116.44" ry="70.643" transform="matrix(0,-1,-1,0,0,0)" cy="-82.313" cx="-127.41" strokeWidth="9.0518" /></g>
		</svg>
	);
}

SVGVerticalLeftWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function SVGVerticalCenterWarp(props) {
	const { fill, stroke } = props;

	return (
		<svg
			className="v-center-warp"
			viewBox="0 0 256 256"
			style={{ 'fill': fill, 'stroke': stroke }}
		>
			<g><ellipse rx="116.44" ry="70.643" transform="matrix(0,-1,-1,0,0,0)" cy="-126.31" cx="-127.41" strokeWidth="9.0518" /></g>
		</svg>
	);
}

SVGVerticalCenterWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

export function SVGVerticalRightWarp(props) {
	const { fill, stroke } = props;

	return (
		<svg
			className="v-center-warp"
			viewBox="0 0 256 256"
			style={{ 'fill': fill, 'stroke': stroke }}
		>
			<g><ellipse rx="116.44" ry="70.643" transform="matrix(0,-1,-1,0,0,0)" cy="-174.31" cx="-127.41" strokeWidth="9.0518" /></g>
		</svg>
	);
}

SVGVerticalRightWarp.propTypes = {
	'fill': PropTypes.string.isRequired,
	'stroke': PropTypes.string.isRequired,
};

// ///////////////////////////
// 0, 2, 3 turns
// idle
export function SVGIdle() {
	return (
		<svg
			viewBox="0 0 256 256"
		>
			<ellipse rx="71.994" ry="72.748" stroke="#000" cy="124.23" cx="130.11" strokeWidth="11.706" fill="none" />
		</svg>
	);
}

// forward 2
export function SVGForward2() {
	return (
		<svg
			viewBox="0 0 256 256"
		>
			<ellipse rx="140.42" transform="rotate(-45)" stroke="#000" ry="70.214" cy="180.72" cx="-.33336" strokeWidth="9.9099" fill="#fff" />
			<text fontSize="121.92px" xmlSpace="preserve" style={{ 'wordSpacing': '0px', 'letterSpacing': '0px' }} line-height="125%" y="166.81104" x="95.967377" fontFamily="sans-serif" fill="#000000"><tspan id="tspan4182-6-2" y="166.81104" x="95.967377">2</tspan></text>
		</svg>
	);
}

// forward 3

// backward 2
export function SVGBackward2() {
	return (
		<svg
			viewBox="0 0 256 256"
		>
			<ellipse rx="140.42" transform="matrix(-.70711 -.70711 -.70711 .70711 0 0)" stroke="#000" ry="70.214" cy=".33336" cx="-180.72" strokeWidth="9.9099" fill="#fff" />
			<text fontSize="121.92px" xmlSpace="preserve" style={{ 'wordSpacing': '0px', 'letterSpacing': '0px' }} line-height="125%" y="166.81104" x="95.967377" fontFamily="sans-serif" fill="#000000"><tspan id="tspan4182-6-2" y="166.81104" x="95.967377">2</tspan></text>
		</svg>
	);
}

// backward 3
