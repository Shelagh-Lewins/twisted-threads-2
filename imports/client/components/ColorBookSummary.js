import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	Button,
} from 'reactstrap';
import PropTypes from 'prop-types';
import IsPublicIndicator from './IsPublicIndicator';

import { iconColors } from '../../modules/parameters';
import './ColorBookSummary.scss';

// isPublic, edit, delete, details, copy

function ColorBookSummary({
	colorBook,
	dispatch,
	handleClickButtonRemove,
	onChangeIsPublic,
}) {
	const {
		_id,
		createdBy,
		isPublic,
		name,
	} = colorBook;
	const canEdit = Meteor.userId() === createdBy;

	const buttonRemove = (
		<Button
			type="button"
			onClick={() => handleClickButtonRemove({ _id, name })}
		>
			<FontAwesomeIcon icon={['fas', 'trash']} style={{ 'color': iconColors.default }} size="1x" />
		</Button>
	);

	return (
		<div className="color-book-summary">
			<FontAwesomeIcon icon={['fas', 'book-open']} style={{ 'color': iconColors.default }} size="1x" />
			{name}
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
	);
}

ColorBookSummary.propTypes = {
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleClickButtonRemove': PropTypes.func.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
};

export default ColorBookSummary;
