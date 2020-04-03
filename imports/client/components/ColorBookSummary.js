import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	Button,
} from 'reactstrap';
import PropTypes from 'prop-types';
import { getRemoveColorBookMessage,iconColors } from '../../modules/parameters';
import { addColorBook, removeColorBook } from '../modules/colorBook';
import IsPublicIndicator from './IsPublicIndicator';
import ColorBook from './ColorBook';

import './ColorBookSummary.scss';

function ColorBookSummary({
	colorBook,
	colorBookAdded,
	dispatch,
	handleClickButtonCopy,
	handleClickButtonSelect,
	handleEditColorBook,
	isAuthenticated,
	isEditingColorBook,
	isSelected,
	onChangeIsPublic,
	canCreateColorBook,
}) {
	const {
		_id,
		createdBy,
		isPublic,
		name,
	} = colorBook;

	const onSelectColor = () => {
		// do nothing, there is no pattern palette
	};

	const handleClickRemoveColorBook = () => {
		const response = confirm(getRemoveColorBookMessage(name)); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeColorBook(_id));
		}
	};

	const canEdit = isAuthenticated && Meteor.userId() === createdBy;
	const canCopy = canCreateColorBook;

	const buttonCopy = (
		<Button
			disabled={isEditingColorBook}
			type="button"
			onClick={() => handleClickButtonCopy({ _id, name })}
			title="Copy colour book"
		>
			<FontAwesomeIcon icon={['fas', 'clone']} style={{ 'color': iconColors.default }} size="1x" />
		</Button>
	);

	const selectedButtons = (
		<div className="selected-buttons">
			<Button
				color="secondary"
				disabled={isEditingColorBook}
				onClick={() => handleEditColorBook(true)}
				title="Edit"
			>
				Edit
			</Button>
			<Button
				color="danger"
				disabled={isEditingColorBook}
				onClick={handleClickRemoveColorBook}
				title="Delete"
			>
				Delete
			</Button>
		</div>
	);

	return (
		<div className={`color-book-summary ${isSelected ? 'selected' : ''}`}>
			<Button
				className="name"
				type="button"
				color="default"
				onClick={() => handleClickButtonSelect({ _id })}
			>
				<span className="name" title="Colour book"><FontAwesomeIcon icon={['fas', 'book-open']} style={{ 'color': iconColors.default }} size="1x" /></span>
				{name}
			</Button>
			{(canEdit || canCopy) && (
				<div className="header-buttons">
					{canEdit && (
						<IsPublicIndicator
							canEdit={canEdit}
							disabled={isEditingColorBook}
							isPublic={isPublic}
							onChangeIsPublic={onChangeIsPublic}
							targetId={_id}
						/>
					)}
					{canCopy && buttonCopy}
				</div>
			)}
			{isSelected && canEdit && selectedButtons}
			{isSelected && (
				<ColorBook
					canEdit={canEdit}
					colorBook={colorBook}
					colorBookAdded={colorBookAdded}
					context="user"
					dispatch={dispatch}
					handleEditColorBook={handleEditColorBook}
					isEditing={isEditingColorBook}
					onSelectColor={onSelectColor}
				/>
			)}
		</div>
	);
}

ColorBookSummary.propTypes = {
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBook': PropTypes.objectOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'handleClickButtonCopy': PropTypes.func.isRequired,
	'handleClickButtonRemove': PropTypes.func.isRequired,
	'handleClickButtonSelect': PropTypes.func.isRequired,
	'handleEditColorBook': PropTypes.func.isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isEditingColorBook': PropTypes.bool.isRequired,
	'isSelected': PropTypes.bool.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
	'canCreateColorBook': PropTypes.bool.isRequired,
};

export default ColorBookSummary;
