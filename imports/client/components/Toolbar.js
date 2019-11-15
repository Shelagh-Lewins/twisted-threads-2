// Toolbar used when editing threading or pattern
import React from 'react';
import PropTypes from 'prop-types';
import Palette from './Palette';
import './Toolbar.scss';

function Toolbar(props) {
	// context: 'threading', 'weaving', maybe 'palette'
	// nested props
	const { context, handleClickPaletteCell, palette } = props;

	let content;

	switch (context) {
		case 'threading':
			content = (
				<Palette
					handleClickPaletteCell={handleClickPaletteCell}
				>
					{palette.map((color, index) => (
						<span
							className="color"
							key={`palette-color-${index}`} // eslint-disable-line react/no-array-index-key
						>
							{color}
						</span>
					))}
				</Palette>
			);
			break;

		default:
			break;
	}

	return (
		<div className="toolbar">
			<h2>Toolbar</h2>
			{content}
		</div>
	);
}

Toolbar.propTypes = {
	'context': PropTypes.string.isRequired,
	'handleClickPaletteCell': PropTypes.func,
	'palette': PropTypes.arrayOf(PropTypes.any),
};

export default Toolbar;
