import React from 'react';
import PropTypes from 'prop-types';
import { editPreviewOrientation } from '../modules/pattern';
import { ALLOWED_PREVIEW_ORIENTATIONS } from '../../modules/parameters';

import './PreviewOrientation.scss';

export default function PreviewOrientation(props) {
	const { _id, disabled, dispatch, previewOrientation } = props;
	const handleChangeOrientation = (event) => {
		dispatch(editPreviewOrientation({ _id, orientation: event.target.value }));
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
		<div className='preview-orientation'>
			<label htmlFor='previewOrientation'>
				<span className='text'>Orientation of woven band:</span>
				<select
					className='form-control'
					disabled={disabled}
					id='previewOrientation'
					name='previewOrientation'
					onChange={handleChangeOrientation}
					value={previewOrientation}
				>
					{optionElms}
				</select>
			</label>
		</div>
	);
}

PreviewOrientation.propTypes = {
	_id: PropTypes.string.isRequired,
	disabled: PropTypes.string.isRequired,
	dispatch: PropTypes.func.isRequired,
	previewOrientation: PropTypes.string.isRequired,
};
