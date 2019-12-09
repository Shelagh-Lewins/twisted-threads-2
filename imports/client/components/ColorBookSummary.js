import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	Button,
} from 'reactstrap';
import PropTypes from 'prop-types';
import IsPublicIndicator from './IsPublicIndicator';
import ColorBook from './ColorBook';
import { getIsAuthenticated, getIsVerified } from '../modules/auth';

import { iconColors } from '../../modules/parameters';
import './ColorBookSummary.scss';

// isPublic, edit, delete, details, copy

function ColorBookSummary({
	colorBook,
	dispatch,
	handleClickButtonCopy,
	handleClickButtonEdit,
	handleClickButtonRemove,
	isSelected,
	onChangeIsPublic,
}) {
	const {
		_id,
		createdBy,
		isPublic,
		name,
	} = colorBook;

	const onSelectColor = () => {
		// console.log('onSelectColor');
		// do nothing, there is no pattern palette
	};

	const canEdit = getIsAuthenticated() && Meteor.userId() === createdBy;
	const canCopy = getIsVerified();

	const buttonRemove = (
		<Button
			type="button"
			onClick={() => handleClickButtonRemove({ _id, name })}
			title="Remove colour book"
		>
			<FontAwesomeIcon icon={['fas', 'trash']} style={{ 'color': iconColors.default }} size="1x" />
		</Button>
	);

	const buttonCopy = (
		<Button
			type="button"
			onClick={() => handleClickButtonCopy({ _id, name })}
			title="Copy colour book"
		>
			<FontAwesomeIcon icon={['fas', 'clone']} style={{ 'color': iconColors.default }} size="1x" />
		</Button>
	);

	return (
		<div className={`color-book-summary ${isSelected ? 'selected' : ''}`}>
			<Button
				className="name"
				type="button"
				color="default"
				onClick={() => handleClickButtonEdit({ _id })}
			>
				<span className="name" title="Colour book"><FontAwesomeIcon icon={['fas', 'book-open']} style={{ 'color': iconColors.default }} size="1x" /></span>
				{name}
			</Button>
			{(canEdit || canCopy) && (
				<div className="header-buttons">
					{canEdit && (
						<IsPublicIndicator
							canEdit={canEdit}
							isPublic={isPublic}
							onChangeIsPublic={onChangeIsPublic}
							targetId={_id}
						/>
					)}
					{canEdit && buttonRemove}
					{canCopy && buttonCopy}
				</div>
			)}
			{isSelected && (
				<ColorBook
					canEdit={canEdit}
					colorBook={colorBook}
					context="user"
					dispatch={dispatch}
					handleClickRemoveColorBook={handleClickButtonRemove}
					onSelectColor={onSelectColor}
				/>
			)}
		</div>
	);
}

ColorBookSummary.propTypes = {
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleClickButtonCopy': PropTypes.func.isRequired,
	'handleClickButtonRemove': PropTypes.func.isRequired,
	'handleClickButtonEdit': PropTypes.func.isRequired,
	'isSelected': PropTypes.bool.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
};

export default ColorBookSummary;
