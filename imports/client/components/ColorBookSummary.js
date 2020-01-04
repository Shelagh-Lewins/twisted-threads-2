import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	Button,
} from 'reactstrap';
import PropTypes from 'prop-types';
import IsPublicIndicator from './IsPublicIndicator';
import ColorBook from './ColorBook';

import { iconColors } from '../../modules/parameters';
import './ColorBookSummary.scss';

function ColorBookSummary({
	colorBook,
	dispatch,
	handleClickButtonCopy,
	handleClickButtonSelect,
	handleClickButtonRemove,
	isAuthenticated,
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
		// console.log('onSelectColor');
		// do nothing, there is no pattern palette
	};

	const canEdit = isAuthenticated && Meteor.userId() === createdBy;
	const canCopy = canCreateColorBook;

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
							isPublic={isPublic}
							onChangeIsPublic={onChangeIsPublic}
							targetId={_id}
						/>
					)}
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
	'handleClickButtonSelect': PropTypes.func.isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isSelected': PropTypes.bool.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
	'canCreateColorBook': PropTypes.bool.isRequired,
};

export default ColorBookSummary;
