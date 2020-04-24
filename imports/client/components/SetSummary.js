import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { removeSet } from '../modules/sets';

import './SetSummary.scss';

import { iconColors } from '../../modules/parameters';

function SetSummary(props) {
	const {
		dispatch,
		'set':
			{
				_id,
				createdBy,
				description,
				name,
			},
		patterns,
		patternPreviews,
		user,
	} = props;

	let username = '';
	if (user) {
		username = user.username;
	}

	const handleClickButtonRemove = () => {
		const response = confirm(`Do you want to delete the set "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeSet(_id));
		}
	};

	const canEdit = Meteor.userId() === createdBy;

	// use pattern previews for the first four patterns
	const patternPreviewElms = [];

	for (let i = 0; i < 4; i += 1) {
		let previewStyle = {};
		const pattern = patterns[i];

		if (pattern) {
			const patternPreview = patternPreviews.find((preview) => pattern._id === preview.patternId);

			if (patternPreview) {
				previewStyle = { 'backgroundImage': `url(${patternPreview.uri})` };
			}
		}

		const elm = (
			<div
				key={`pattern-preview-${i}`}
				style={previewStyle}
				className="pattern-preview"
			/>
		);

		patternPreviewElms.push(elm);
	}

	const patternPreviewElm = (
		<div className="pattern-previews">
			{patternPreviewElms}
		</div>
	);

	const buttonRemove = (
		<Button
			type="button"
			onClick={() => handleClickButtonRemove()}
			title="Delete set"
		>
			<FontAwesomeIcon icon={['fas', 'trash']} style={{ 'color': iconColors.default }} size="1x" />
		</Button>
	);

	// if no description, concatenate pattern names instead
	let text = description;

	if (!description && patterns) {
		text = patterns.reduce((workingString, pattern, index) => workingString
			+ (pattern ? pattern.name : '')
			+ (index === patterns.length - 1 ? '' : ', '), '');
	}

	return (
		<div className="set-summary">
			<div className="main">
				<Link to={`/set/${_id}`}>
					<h3>{name}</h3>
					<div className="description">{text}</div>
					<div className="info">
						<div className="number-of-patterns">
							<span
								className="icon"
								style={{ 'backgroundImage': `url(${Meteor.absoluteUrl('/images/logo.png')}` }}
								title="Number of patterns"
							/>
							{patterns.length}
						</div>
					</div>

					{patternPreviewElm}
				</Link>

			</div>
			<div className="footer">
				<Link to={`/user/${createdBy}`} className="created-by">
					<span
						className="icon"
						style={{ 'backgroundImage': `url(${Meteor.absoluteUrl('/images/created_by.png')}` }}
					/>
					{username}
				</Link>
				{canEdit && (
					<div className="controls">
						{buttonRemove}
					</div>
				)}
			</div>
		</div>
	);
}

SetSummary.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any),
	'patternPreviews': PropTypes.arrayOf(PropTypes.any),
	'set': PropTypes.objectOf(PropTypes.any),
	'user': PropTypes.objectOf(PropTypes.any),
};

export default SetSummary;
