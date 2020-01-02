import React from 'react';
import { connect } from 'react-redux';
import { Combobox } from 'react-widgets';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import './Search.scss';
import store from '../modules/store';
import {
	getSearchTerm,
	searchStart,
	setIsSearching,
} from '../modules/search';
import 'react-widgets/dist/css/react-widgets.css';
import { PatternsIndex } from '../../modules/collection';

function Search(props) {
	const {
		dispatch,
		history,
		isSearching,
		searchResults,
		searchTerm,
	} = props;

	const onChange = (value) => {
		clearTimeout(global.searchTimeout);

		if (typeof value !== 'object' && value.length >= 2) {
		//if (typeof value !== 'object') {
			// user has entered a search term
			// at least 2 characters
			// don't fire if they've selected a search result
			global.searchTimeout = setTimeout(() => {
				dispatch(searchStart(value));
			}, 500);
		}
	};

	const onSelect = (value) => {
		const { _id, type } = value;
		let url;

		switch (type) {
			case 'pattern':
				url = `/pattern/${_id}`;
				break;

			case 'user':
				url = `/user/${_id}`;
				break;

			default:
				break;
		}
		history.push(url);
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
					<span className="search-result-pattern">
						<span className="main-icon" />
						<div>
							<span className="name">{name}</span>
							<span className="tablets-count" title={`${numberOfTablets} tablets`}>
								<span className="icon" />
								{numberOfTablets}
							</span>
							<span className="created-by" title="Created by {createdBy}"><span className="icon" />{username}</span>
						</div>
					</span>
				);
				break;

			case 'user':
				element = (
					<span className="search-result-user">
						<span className="main-icon" />
						<div>
							<span className="name">{name}</span>
						</div>
					</span>
				);
				break;

			default:
			//TO DO review this, it is a fallback in case type not present
				element = <span className="name">{name}</span>;
				break;
		}
		return element;
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
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isSearching': PropTypes.bool.isRequired,
	'searchResults': PropTypes.arrayOf(PropTypes.any).isRequired,
	'searchTerm': PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
	};
}

const Tracker = withTracker(({ dispatch }) => {
	const state = store.getState();
	const searchTerm = getSearchTerm(state);
	let results = [];

	if (searchTerm) {
		const cursor = PatternsIndex.search(searchTerm); // search is a reactive data source
		// console.log('*** PatternsIndex', PatternsIndex);
		results = cursor.fetch();
		console.log('*** cursor count', cursor.count());
		dispatch(setIsSearching(false));
	}

	return {
		'searchResults': results,
	};
})(Search);

export default connect(mapStateToProps)(Tracker);
