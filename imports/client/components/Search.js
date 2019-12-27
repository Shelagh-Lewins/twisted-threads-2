import React from 'react';
import { Combobox } from 'react-widgets';
import PropTypes from 'prop-types';
import './Search.scss';
import { searchStart } from '../modules/search';
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
		global.searchTimeout = setTimeout(() => {
			dispatch(searchStart(value));
		}, 500);
	};
//TO DO don't show dropdown while searching
	const onSelect = (value) => {
		console.log('select', value);
	};

	let message = 'Enter a search term...';

	if (isSearching) {
		message = 'Searching...';
	} else if (searchTerm && searchTerm !== '') {
		message = `no results found for ${searchTerm}`;
	}

	return (
		<div className="search">
			<Combobox
				busy={isSearching}
				data={searchResults}
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
