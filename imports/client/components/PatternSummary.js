import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { removePattern } from '../modules/pattern';
import './PatternSummary.scss';

function PatternSummary({ name, _id, dispatch }) {
	const buttonRemove = (
		<Button
			type="button"
			color="danger"
			onClick={() => {
				const response = confirm(`Do you want to delete the pattern "${name}"?`); // eslint-disable-line no-restricted-globals

				if (response === true) {
					dispatch(removePattern(_id));
				}
			}}
		>
		X
		</Button>
	);

	return (
		<div className="pattern-summary">
			<Link to={`/pattern/${_id}`}>
				{name}
			</Link>
			{buttonRemove}
		</div>
	);
}

PatternSummary.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'name': PropTypes.string.isRequired,
};

export default PatternSummary;
