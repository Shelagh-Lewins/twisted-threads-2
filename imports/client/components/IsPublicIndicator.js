// Set whether a topTenList or reusableItem is public
// Note how the isPublic is updated without making this into a React Component with state.
// By using props to populate the UI, we enable time travel and a direct connection with the store.

import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import './IsPublicIndicator.scss';

import { iconColors } from '../../modules/parameters';

const IsPublicIndicator = (props) => {
	const { isPublic, targetId } = props;
	const isPublicData = isPublic ? 'public' : 'private';
	const iconName = isPublic ? 'lock-open' : 'lock';
	const tooltip = isPublic ? 'Public pattern: click to make it private' : 'Private pattern: click to make it public';

	function onChangeIsPublic(e) {
		// map from button data to true / false
		const value = (e.target.dataset.ispublic === 'public');
		props.onChangeIsPublic({ '_id': e.target.dataset.targetid, 'isPublic': !value });
	}

	return (
		<div className="is-public">
			<Button
				type="button"
				onClick={onChangeIsPublic}
				data-targetid={targetId}
				data-ispublic={isPublicData}
				className={`${isPublicData} btn btn-default`}
				title={tooltip}
			>
				<FontAwesomeIcon icon={['fas', iconName]} style={{ 'color': iconColors.default }} size="1x" />
			</Button>
		</div>
	);
};

IsPublicIndicator.propTypes = {
	'canEdit': PropTypes.bool.isRequired,
	'isPublic': PropTypes.bool.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
	'targetId': PropTypes.string.isRequired,
};

export default IsPublicIndicator;
