// Set whether a topTenList or reusableItem is public
// Note how the isPublic is updated without making this into a React Component with state.
// By using props to populate the UI, we enable time travel and a direct connection with the store.

import React from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	getCanPublish,
} from '../modules/auth';
import './IsPublicIndicator.scss';

import { iconColors } from '../../modules/parameters';

const IsPublicIndicator = (props) => {
	const {
		canPublish,
		disabled,
		isPublic,
		targetId,
	} = props;
	const isPublicData = isPublic ? 'public' : 'private';
	const iconName = isPublic ? 'lock-open' : 'lock';
	const tooltip = isPublic ? 'Public: click to make it private' : 'Private: click to make it public';

	function onChangeIsPublic(e) {
		if (!canPublish) {
			alert('To change the privacy of patterns or colour books, please verify your email address');
		} else {
		// map from button data to true / false
			const value = (e.target.dataset.ispublic === 'public');
			props.onChangeIsPublic({ '_id': e.target.dataset.targetid, 'isPublic': !value });
		}
	}

	return (
		<div className="is-public">
			<Button
				disabled={disabled}
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
	'canPublish': PropTypes.bool.isRequired,
	'disabled': PropTypes.bool,
	'isPublic': PropTypes.bool.isRequired,
	'onChangeIsPublic': PropTypes.func.isRequired,
	'targetId': PropTypes.string.isRequired,
};

function mapStateToProps(state) {
	return {
		'canPublish': getCanPublish(state),
	};
}

export default connect(mapStateToProps)(IsPublicIndicator);
