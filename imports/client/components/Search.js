import React from 'react';
import { Combobox } from 'react-widgets';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './Search.scss';
import { searchStart, setSearchTerm } from '../modules/search';
import 'react-widgets/dist/css/react-widgets.css';

function Search(props) {
	const {
		dispatch,
		isSearching,
		searchResults,
		searchTerm,
	} = props;

	const onChange = (value) => {
		clearTimeout(global.searchTimeout);

		if (typeof value !== 'object') {
			// user has entered a search term
			// don't fire if they've selected a search result
			global.searchTimeout = setTimeout(() => {
				dispatch(searchStart(value));
			}, 500);
		}
	};

	const onSelect = (value) => {
		console.log('select', value);
	};

	const GroupHeading = ({ item }) => {
		// note 'item' here is actually the group property
		let text;

		switch (item) {
			case 'pattern':
				text = 'Patterns';
				break;

			case 'user':
				text = 'Users';
				break;

			default:
				break;
		}

		return <span className="group-header">{text}</span>;
	};

	const ListItem = ({ item }) => {
		const {
			_id,
			createdBy,
			name,
			numberOfTablets,
			username,
			type,
		} = item;

		let element;

		switch (type) {
			case 'pattern':
				element = (
					<Link to={`/pattern/${_id}`} className="search-result-pattern">
						<span className="main-icon" />
						<div>
							<span className="name">{name}</span>
							<span className="tablets-count" title={`${numberOfTablets} tablets`}>
								<span className="icon" />
								{numberOfTablets}
							</span>
							<span className="created-by" title="Created by {createdBy}"><span className="icon" />{createdBy}</span>
						</div>
					</Link>
				);
				break;

			case 'user':
				element = (
					<Link to={`/user/${_id}`} className="search-result-user">
						<span className="main-icon" />
						<div>
							<span className="name">{username}</span>
						</div>
					</Link>
				);
				break;

			default:
				break;
		}
		return element;
	};
//TO DO hide dropdown when empty input or searching
	let message = 'Enter a search term...';

	if (isSearching) {
		message = 'Searching...';
	} else if (searchTerm && searchTerm !== '') {
		message = `no results found for ${searchTerm}`;
	}

	return (
		<div className="search">
			<Combobox
			open={true}
				busy={isSearching}
				data={searchResults}
				groupBy="type"
				groupComponent={GroupHeading}
				itemComponent={ListItem}
				messages={{
					'emptyList': message,
				}}
				onChange={onChange}
				onSelect={onSelect}
				textField="name"
				valueField="_id"
			/>
		</div>
	);
}

Search.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'isSearching': PropTypes.bool.isRequired,
	'searchResults': PropTypes.arrayOf(PropTypes.any).isRequired,
	'searchTerm': PropTypes.string.isRequired,
};

export default Search;
