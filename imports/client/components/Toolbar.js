// Toolbar used when editing threading or pattern
import React from 'react';
import PropTypes from 'prop-types';
import './Toolbar.scss';

function Toolbar(props) {
	const { children } = props;
	console.log('children', children);

	return (
		<div className="toolbar">
			<h2>Toolbar</h2>
			{children}
		</div>
	);
}

Toolbar.propTypes = {
	'children': PropTypes.node.isRequired,
};

export default Toolbar;
