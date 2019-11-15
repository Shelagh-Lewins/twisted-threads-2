import React from 'react';
import PropTypes from 'prop-types';
import './Palette.scss';

function Palette(props) {
	const { children } = props;

	return (
		<div className="palette">
			<h3>Palette</h3>
			{children}
		</div>
	);
}


Palette.propTypes = {
	'children': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default Palette;
