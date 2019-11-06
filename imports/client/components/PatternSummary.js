import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { removePattern } from '../modules/pattern';

function PatternSummary({ name, _id, dispatch }) {
	return (
		<div>
			<Link to={`/pattern/${_id}`}>
				<div className="pattern-name">
					<div>{name}</div>
				</div>
			</Link>
			<button
				type="button"
				onClick={() => {
					dispatch(removePattern(_id));
				}}
			>
			X
			</button>
		</div>
	);
}

PatternSummary.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'name': PropTypes.string.isRequired,
};

export default PatternSummary;
