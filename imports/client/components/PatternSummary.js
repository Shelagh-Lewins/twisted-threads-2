import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import './PatternSummary.scss';
import IsPublicIndicator from './IsPublicIndicator';

class PatternSummary extends PureComponent {
	render() {
		const {
			handleClickButtonRemove,
			'pattern':
				{
					_id,
					createdBy,
					name,
					isPublic,
				},
			onChangeIsPublic,
			patternPreview,
			user,
		} = this.props;

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
				color="danger"
				onClick={() => handleClickButtonRemove({ _id, name })}
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
					<Link to={`/user/${createdBy}`} className="created-by">
						{username}
					</Link>
					<div className="controls">
						<IsPublicIndicator
							canEdit={canEdit}
							isPublic={isPublic}
							onChangeIsPublic={onChangeIsPublic}
							targetId={_id}
						/>
						{canEdit && buttonRemove}
					</div>
				</div>
			</div>
		);
	}
}

PatternSummary.propTypes = {
	'handleClickButtonRemove': PropTypes.func.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any),
	'patternPreview': PropTypes.objectOf(PropTypes.any),
	'user': PropTypes.objectOf(PropTypes.any),
};

export default PatternSummary;
