import React from 'react';
import { connect } from 'react-redux';
import { Combobox } from 'react-widgets';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import './Search.scss';
import { ReactiveVar } from 'meteor/reactive-var';
import store from '../modules/store';
import {
	getPatternSearchLimit,
	getSearchTerm,
	searchStart,
	setIsSearching,
	showMorePatterns,
} from '../modules/search';
import 'react-widgets/dist/css/react-widgets.css';
import { PatternsIndex, UsersIndex } from '../../modules/collection';
import { SEARCH_MORE } from '../../modules/parameters';
import ReactDOM from "react-dom";

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
			// user has entered a search term
			// at least 2 characters
			// don't fire if they've selected a search result
			global.searchTimeout = setTimeout(() => {
				dispatch(searchStart(value));
			}, 500);
		}
	};

	const onSelect = (value) => {
		const { '__originalId': _id, type } = value;
		let url;

		switch (type) {
			case 'pattern':
				url = `/pattern/${_id}`;
				break;

			case 'user':
				url = `/user/${_id}`;
				break;

			case 'showMorePatterns':
				dispatch(showMorePatterns());
				Search.updateMe.set(true);
				Search._combobox._values.open = true; // keep the list open
				//Search._combobox.inner.handleSelect('');
				break;

			default:
				break;
		}
		history.push(url);

		console.log('*** ref', Search._combobox);
		console.log('state', Search._combobox.inner.state);
		//Search._combobox._values.value = '';
		//Search._combobox.inner.state.accessors.text('');
		/* console.log('*** ref ***', Search._combobox._values.value);

		const node = ReactDOM.findDOMNode(Search._combobox);
		console.log('node', node);

		setTimeout(() => {
			const input1 = node.getElementsByTagName('input')[0];
			console.log('input', input1.value);
			input1.setAttribute('value', searchTerm);
			const input2 = node.getElementsByTagName('input')[0];
			console.log('input2', input2.value);
		}, 2000); */
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
							<span className="created-by" title={`Created by ${createdBy}`}><span className="icon" />{username}</span>
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

			case 'showMorePatterns':
				element = <span className="show-more-patterns">Show more patterns</span>;
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
				ref={(c) => Search._combobox = c}
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

// force withTracker to update when 'show more' is clicked
Search.updateMe = new ReactiveVar(false);

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
	console.log('updateMe', Search.updateMe.get());
	const state = store.getState();
	const searchTerm = getSearchTerm(state);
	const patternSearchLimit = getPatternSearchLimit(state);
	let patternsResults = [];
	let usersResults = [];

	console.log('*** tracker. patternSeachLimit', patternSearchLimit);

	if (searchTerm) {
		// search for patterns
		const patternsCursor = PatternsIndex.search(searchTerm, { 'limit': patternSearchLimit + SEARCH_MORE }); // search is a reactive data source
		// server returns extra results for 'show more'
		patternsResults = patternsCursor.fetch();
		console.log('*** patternCursor count', patternsCursor.count());
		// hide the 'more' results'
		patternsResults = patternsResults.slice(0, patternSearchLimit);

		if (patternsResults.length < patternsCursor.count()) {
			patternsResults.push({
				'name': 'Show more patterns',
				'type': 'showMorePatterns',
			});
		}

		// search for users
		const usersCursor = UsersIndex.search(searchTerm, { 'limit': 10 }); // search is a reactive data source
		usersResults = usersCursor.fetch();
		console.log('*** usersCursor count', usersCursor.count());

		dispatch(setIsSearching(false));
	}
	Search.updateMe.set('false');

	return {
		'searchResults': patternsResults.concat(usersResults),
	};
})(Search);

export default connect(mapStateToProps)(Tracker);
