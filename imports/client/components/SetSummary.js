import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { editIsPublic, removePattern } from '../modules/pattern';

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
				patterns,
				//numberOfTablets,
				//isPublic,
			},
		//patternPreview,
		tagTexts,
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
		const response = confirm(`Do you want to delete the pattern "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			//dispatch(removePattern(_id));
			//TODO delete set
		}
	};

	const canEdit = Meteor.userId() === createdBy;
	//const canAddToSet = Meteor.userId();

	// import the preview
	let previewStyle = {};
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

	/* const tags = tagTexts.map((text, index) => (
		<span
			className="tag"
			key={`tag-${index}`} // eslint-disable-line react/no-array-index-key
		>
			{text}
		</span>
	)); */

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
	//'pattern': PropTypes.objectOf(PropTypes.any),
	//'patternPreview': PropTypes.objectOf(PropTypes.any),
	'set': PropTypes.objectOf(PropTypes.any),
	//'tagTexts': PropTypes.arrayOf(PropTypes.any),
	'user': PropTypes.objectOf(PropTypes.any),
};

export default SetSummary;
