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
	handleClickButtonEdit,
	handleClickButtonRemove,
	onChangeIsPublic,
}) {
	const {
		_id,
		createdBy,
		isEditing,
		isPublic,
		name,
	} = colorBook;
	const canEdit = Meteor.userId() === createdBy;
console.log('isEditing', isEditing);
	const buttonEdit = (
		<Button
			type="button"
			onClick={() => handleClickButtonEdit({ _id })}
			title="Edit colour book"
		>
			<FontAwesomeIcon icon={['fas', 'pencil-alt']} style={{ 'color': iconColors.default }} size="1x" />
		</Button>
	);

	const buttonRemove = (
		<Button
			type="button"
			onClick={() => handleClickButtonRemove({ _id, name })}
			title="Remove colour book"
		>
			<FontAwesomeIcon icon={['fas', 'trash']} style={{ 'color': iconColors.default }} size="1x" />
		</Button>
	);

	return (
		<div className={`color-book-summary ${isEditing ? 'editing' : ''}`}>
			<span className="name" title="Color book"><FontAwesomeIcon icon={['fas', 'book-open']} style={{ 'color': iconColors.default }} size="1x" /></span>
			{name}
			{canEdit && (
				<div className="controls">
					<IsPublicIndicator
						canEdit={canEdit}
						isPublic={isPublic}
						onChangeIsPublic={onChangeIsPublic}
						targetId={_id}
					/>
					{buttonEdit}
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
	'handleClickButtonEdit': PropTypes.func.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
};

export default ColorBookSummary;
