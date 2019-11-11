import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { removePattern } from '../modules/pattern';
import './PatternSummary.scss';

function PatternSummary({ name, _id, dispatch }) {
	return (
		<div className="pattern-summary">
			<Link to={`/pattern/${_id}`}>
				{name}
			</Link>
			<Button
				type="button"
				color="danger"
				onClick={() => {
					dispatch(removePattern(_id));
				}}
			>
			X
			</Button>
		</div>
	);
}

PatternSummary.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'name': PropTypes.string.isRequired,
};

export default PatternSummary;
