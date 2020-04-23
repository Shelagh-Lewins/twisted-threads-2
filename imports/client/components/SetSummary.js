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

	/* const onChangeIsPublic = () => {
		dispatch(editIsPublic({ _id, 'isPublic': !isPublic }));
	}; */

	const handleClickButtonRemove = () => {
		const response = confirm(`Do you want to delete the set "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeSet(_id));
		}
	};
console.log('*** patterns in this set', patterns);
	const canEdit = Meteor.userId() === createdBy;

	// import the preview
	let previewStyle = {};
	const coverPatterns = [];

	// show previews of the first four patterns in the set
	for (let i = 0; i < 4; i += 1) {
		if (patterns[i]) {
			coverPatterns.push(patterns[i]._id);
		}
	}

	const previews = coverPatterns.map((patternId) => {
		return patternPreviews.find((preview) => {
			return patternId === preview.patternId;
		});
	});
	console.log('** previews', previews);
	//TODO pattern previews
	/*if (patternPreview) {
		previewStyle = { 'backgroundImage': `url(${patternPreview.uri})` };
	} */

	const patternPreviewHolder = <div style={previewStyle} className="pattern-preview" />;

	const buttonRemove = (
		<Button
			type="button"
			onClick={() => handleClickButtonRemove({ _id, name })}
			title="Delete pattern"
		>
			<FontAwesomeIcon icon={['fas', 'trash']} style={{ 'color': iconColors.default }} size="1x" />
		</Button>
	);

	return (
		<div className="set-summary">
			<div className="main">
				<Link to={`/set/${_id}`}>
					<h3>{name}</h3>
					<div className="description">{description}</div>
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
					{patternPreviewHolder}
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
