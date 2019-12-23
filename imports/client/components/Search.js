import React from 'react';
import { Combobox } from 'react-widgets';
import PropTypes from 'prop-types';
import './Search.scss';
import { searchStart } from '../modules/search';
import 'react-widgets/dist/css/react-widgets.css';

function Search(props) {
	const { dispatch, searchResults } = props;

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

	const data = [
		{
			'_id': '1',
			'name': 'bob',
		},
		{
			'_id': '2',
			'name': 'alice',
		},
	];

	return (
		<div className="search">
			<Combobox
				data={searchResults}
				messages={{ 'emptyList': 'nothing found' }}
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
	'searchResults': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default Search;
