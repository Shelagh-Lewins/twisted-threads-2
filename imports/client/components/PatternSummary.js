import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import DOMPurify from 'dompurify';

import { removePattern } from '../modules/pattern';
import './PatternSummary.scss';

function PatternSummary({
	name,
	_id,
	dispatch,
	patternPreview,
}) {
	const handleClickButtonRemove = function () {
		const response = confirm(`Do you want to delete the pattern "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removePattern(_id));
		}
	};

	let clean = '';
	if (patternPreview) {
		clean = DOMPurify.sanitize(patternPreview.data);
		/*patternPreviewElm = (
			<div className="pattern-preview" dangerouslySetInnerHTML={{ '__html': clean }} />
		); */
	}
	const patternPreviewElm = <div className="innertube" dangerouslySetInnerHTML={{ '__html': clean }} />;

	const patternPreviewHolder = (
		<div className="pattern-preview">
			{patternPreviewElm}
		</div>
	);

	

	const buttonRemove = (
		<Button
			type="button"
			color="danger"
			onClick={() => handleClickButtonRemove(_id)}
		>
		X
		</Button>
	);

	return (
		<div className="pattern-summary">
			<div className="main">
				<Link to={`/pattern/${_id}`}>
					<h3>{name}</h3>
					{patternPreviewHolder}
				</Link>

			</div>
			<div className="footer">
				{buttonRemove}
			</div>
		</div>
	);
}

PatternSummary.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'name': PropTypes.string.isRequired,
	'patternPreview': PropTypes.objectOf(PropTypes.any),
};

export default PatternSummary;
