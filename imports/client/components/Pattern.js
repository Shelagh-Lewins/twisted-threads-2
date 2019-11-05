import React from 'react';
import PropTypes from 'prop-types';
import { removePattern } from '../modules/pattern';

function Pattern({ name, _id, dispatch }) {
	return (
		<div>
			Name: {name}
			<button
				type="button"
				onClick={() => {
					dispatch(removePattern(_id));
				}}
			>
			Remove Pattern
			</button>
		</div>
	);
}

Pattern.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'name': PropTypes.string.isRequired,
};

export default Pattern;
