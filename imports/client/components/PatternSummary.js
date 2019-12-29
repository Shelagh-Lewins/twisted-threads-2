import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './PatternSummary.scss';
import IsPublicIndicator from './IsPublicIndicator';

import { iconColors } from '../../modules/parameters';

function PatternSummary(props) {
	const {
		handleClickButtonRemove,
		'pattern':
			{
				_id,
				createdBy,
				description,
				name,
				numberOfTablets,
				isPublic,
			},
		onChangeIsPublic,
		patternPreview,
		tagTexts,
		user,
	} = props;

	let username = '';
	if (user) {
		username = user.username;
	}

	const canEdit = Meteor.userId() === createdBy;

	// import the preview
	let previewStyle = {};

	if (patternPreview) {
		previewStyle = { 'backgroundImage': `url(${patternPreview.uri})` };
	}
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

	const tags = tagTexts.map((text) => (
		<span className="tag">{text}</span>
	));

	return (
		<div className="pattern-summary">
			<div className="main">
				<Link to={`/pattern/${_id}`}>
					<h3>{name}</h3>
					<div className="description">{description}</div>
					<div className="info">
						<div className="tags">
							{tags}
						</div>
						<div className="tablets">
							<span className="icon" />
							{numberOfTablets}
						</div>
					</div>
					{patternPreviewHolder}
				</Link>

			</div>
			<div className="footer">
				<Link to={`/user/${createdBy}`} className="created-by">
					{username}
				</Link>
				{canEdit && (
					<div className="controls">
						<IsPublicIndicator
							canEdit={canEdit}
							isPublic={isPublic}
							onChangeIsPublic={onChangeIsPublic}
							targetId={_id}
						/>
						{buttonRemove}
					</div>
				)}
			</div>
		</div>
	);
}

PatternSummary.propTypes = {
	'handleClickButtonRemove': PropTypes.func.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any),
	'patternPreview': PropTypes.objectOf(PropTypes.any),
	'tagTexts': PropTypes.arrayOf(PropTypes.any),
	'user': PropTypes.objectOf(PropTypes.any),
};

export default PatternSummary;
