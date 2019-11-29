import React from 'react';
import PropTypes from 'prop-types';

import './PatternPreview.scss';

export default function PatternPreview({ picksByTablet }) {
	return (
		<div className="pattern-preview">
			Pattern preview
		</div>
	);
}

PatternPreview.propTypes = {
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
};
