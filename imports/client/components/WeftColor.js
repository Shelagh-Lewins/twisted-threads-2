import React from 'react';
import PropTypes from 'prop-types';
import './WeftColor.scss';

export default function WeftColor({ dispatch, weftColor }) {
	return (
		<div className="set-weft-folor">
		{weftColor}
		</div>
	);
}

WeftColor.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'weftColor': PropTypes.string.isRequired,
};
