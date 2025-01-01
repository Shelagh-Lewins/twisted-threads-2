// short list of patterns of a particular type
// displayed on home page
import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { Button } from 'reactstrap';

import UserSummary from './UserSummary';
import './ItemListPreview.scss';

import getListPreviewDimensions from '../modules/getListPreviewDimensions';


const UserListPreview = (props) => {
	const {
		listName,
		url,
		users,
		width,
	} = props;

	const { divWidth, numberToShow } = getListPreviewDimensions(width);

	const usersToShow = users.slice(0, numberToShow);

	return (
		<div
			className="item-list-preview"
			style={{ 'width': divWidth }}
		>
			<h1>{listName}</h1>
			{usersToShow.length === 0 && (
				<div className="clearing">No people in list</div>
			)}
			{usersToShow.length > 0 && (
				<>
					<Button
						className="more"
						color="secondary"
						tag={Link}
						to={url}
					>
						More...
					</Button>
					<ul>
						{usersToShow.map((user) => {
							const { _id } = user;

							return (
								<div key={`user-summary-${url}-${_id}`}>
									<UserSummary
										user={user}
									/>
								</div>
							);
						})}
					</ul>
				</>
			)}
		</div>
	);
};

UserListPreview.propTypes = {
	'listName': PropTypes.string.isRequired,
	'url': PropTypes.string.isRequired,
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
	'width': PropTypes.number.isRequired,
};

export default UserListPreview;
