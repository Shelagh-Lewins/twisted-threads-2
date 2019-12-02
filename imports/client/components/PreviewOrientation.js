import React from 'react';
import PropTypes from 'prop-types';
import { editPreviewOrientation } from '../modules/pattern';
import { ALLOWED_PREVIEW_ORIENTATIONS } from '../../modules/parameters';

import './PreviewOrientation.scss';


export default function PreviewOrientation({ _id, dispatch, previewOrientation }) {
	const handleChangeOrientation = (event) => {
		dispatch(editPreviewOrientation({ _id, 'orientation': event.target.value }));
	};

	const optionElms = ALLOWED_PREVIEW_ORIENTATIONS.map((option) => (
		<option
			key={`preview-orientation-${option.value}`}
			value={option.value}
		>
			{option.text}
		</option>
	));

	return (
		<label htmlFor="previewOrientation" className="preview-orientation">
			<span className="text">Orientation:</span>
			<select
				className="form-control"
				id="previewOrientation"
				name="previewOrientation"
				onChange={handleChangeOrientation}
				value={previewOrientation}
			>
				{optionElms}
			</select>
		</label>
	);
}

PreviewOrientation.propTypes = {
	'_id': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'previewOrientation': PropTypes.string.isRequired,
};
