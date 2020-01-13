import React from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import './UserSummary.scss';

import { iconColors } from '../../modules/parameters';

function UserSummary(props) {
	const {
		'user':
			{
				_id,
				description,
				numberOfPublicPatterns,
				username,
			},
	} = props;
//TO DO user graphic, patterns graphic
// TO DO description?
	return (
		<div className="user-summary">
			<div className="main">
				<Link to={`/user/${_id}`}>
					<h3>{username}</h3>
					<div className="info">
						<div className="description">{description}</div>
						<div className="public-patterns">
							{numberOfPublicPatterns}
						</div>
					</div>
				</Link>

			</div>
		</div>
	);
}

UserSummary.propTypes = {
	'user': PropTypes.objectOf(PropTypes.any),
};

export default UserSummary;
