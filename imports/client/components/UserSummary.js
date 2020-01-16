import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './UserSummary.scss';

function UserSummary(props) {
	const {
		'user':
			{
				_id,
				description,
				publicPatternsCount,
				username,
			},
	} = props;

	const backgroundColor = () => {
	// quick way to give users different coloured backgrounds
		const num = _id.charCodeAt(0);

		switch (true) {
			case (num < 55):
				return '#FFFFCC';

			case (num < 75):
				return '#99FFCC';

			case (num < 90):
				return '#CC99CC';

			case (num < 105):
				return '#99CCFF';

			default:
				return '#CC9900';
		}
	};

	return (
		<div className="user-summary">
			<div className="main">
				<Link to={`/user/${_id}`}>
					<h3>
						<span
							className="icon"
							style={{ 'backgroundColor': backgroundColor() }}
						/>
						{username}
					</h3>
					<div className="info">
						<div className="description">{description}</div>
						<div
							className="public-patterns"
							title="Number of published patterns"
						>
							<span className="icon" />
							{publicPatternsCount}
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
