import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input } from 'reactstrap';
import { Combobox } from 'react-widgets';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import './Search.scss';
import { ReactiveVar } from 'meteor/reactive-var';
import store from '../modules/store';
import {
	getPatternSearchLimit,
	getSearchTerm,
	getUserSearchLimit,
	searchStart,
	setIsSearching,
	showMorePatterns,
	showMoreUsers,
} from '../modules/search';
import 'react-widgets/dist/css/react-widgets.css';
import { PatternsIndex, UsersIndex } from '../../modules/collection';
import { iconColors, SEARCH_MORE } from '../../modules/parameters';

class Search extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'open': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickOutside',
			'onChangeInput',
			'onSelect',
			'toggleOpen',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.handleClickOutside);
	}

	componentDidUpdate(prevProps) {
		const { isSearching, searchTerm } = this.props;
		const { open } = this.state;

		if (prevProps.isSearching
			&& !isSearching
			&& searchTerm !== ''
			&& !open) {
			// allow search results to appear
			// avoiding 'no results for' showing briefly
			setTimeout(() => this.toggleOpen(), 100);
		}
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.handleClickOutside);
	}

	toggleOpen = () => {
		const { open } = this.state;

		this.setState({ 'open': !open });
	}

	onChangeInput = (event) => {
		const {
			dispatch,
		} = this.props;
		const { value } = event.target;

		clearTimeout(global.searchTimeout);

		global.searchTimeout = setTimeout(() => {
			dispatch(searchStart(value));
		}, 500);
	};

	onSelect = (value) => {
		const {
			dispatch,
			history,
		} = this.props;

		const { '__originalId': _id, type } = value;
		let url;

		switch (type) {
			case 'pattern':
				this.toggleOpen();
				url = `/pattern/${_id}`;
				break;

			case 'user':
				this.toggleOpen();
				url = `/user/${_id}`;
				break;

			case 'showMorePatterns':
				dispatch(showMorePatterns());
				Search.updateMe.set(true);
				break;

			case 'showMoreUsers':
				dispatch(showMoreUsers());
				Search.updateMe.set(true);
				break;

			default:
				break;
		}
		history.push(url);
	};

	handleClickOutside(event) {
		// only way I could think of to find the list inside the Combobox component
		const node = ReactDOM.findDOMNode(this); // eslint-disable-line react/no-find-dom-node
		const listNode = node.querySelector('.rw-list');
		const toggleNode = node.querySelector('.toggle-results');

		// if the user clicks outside the toggle button
		// and the results list
		// close the search results
		if (listNode
			&& !toggleNode.contains(event.target)
			&& !listNode.contains(event.target)) {
			this.setState({ 'open': false });
		}
	}

	// custom input and button prevents the selected item from being written to the input
	renderSearchInput = () => {
		const { isSearching } = this.props;
		const iconClass = isSearching ? 'fa-spin' : '';
		const iconName = isSearching ? 'spinner' : 'search';

		return (
			<div className="search-controls">
				<Input
					onChange={this.onChangeInput}
					type="text"
				/>
				<Button
					className="toggle-results"
					onClick={this.toggleOpen}
					title="toggle results"
				>
					<FontAwesomeIcon
						className={iconClass}
						icon={['fas', iconName]}
						style={{ 'color': iconColors.default }}
						size="1x"
					/>
				</Button>
			</div>
		);
	}

	render() {
		const {
			isSearching,
			searchResults,
			searchTerm,
		} = this.props;
		const { open } = this.state;

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
							<span
								className="main-icon"
								style={{ 'backgroundImage': `url(${Meteor.absoluteUrl('/images/search_pattern.png')}` }}
							/>
							<div>
								<span className="name" title={name}>{name}</span>
								<span className="tablets-count" title={`${numberOfTablets} tablets`}>
									<span
										className="icon"
										style={{ 'backgroundImage': `url(${Meteor.absoluteUrl('/images/tablet_count.svg')}` }}
									/>
									{numberOfTablets}
								</span>
								<span className="created-by" title={`Created by ${createdBy}`}>
									<span
										className="icon"
										style={{ 'backgroundImage': `url(${Meteor.absoluteUrl('/images/created_by.png')}` }}
									/>{username}
								</span>
							</div>
						</span>
					);
					break;

				case 'user':
					element = (
						<span className="search-result-user">
							<span
								className="main-icon"
								style={{ 'backgroundImage': `url(${Meteor.absoluteUrl('/images/search_user.png')}` }}
							/>
							<div>
								<span className="name">{name}</span>
							</div>
						</span>
					);
					break;

				case 'showMorePatterns':
					element = (
						<span className="show-more-patterns">
							<FontAwesomeIcon icon={['fas', 'search']} style={{ 'color': iconColors.default }} size="1x" />
							Show more patterns...
						</span>
					);
					break;

				case 'showMoreUsers':
					element = (
						<span className="show-more-users">
							<FontAwesomeIcon icon={['fas', 'search']} style={{ 'color': iconColors.default }} size="1x" />
							Show more users...
						</span>
					);
					break;

				default:
					element = <span className="default">{name}</span>;
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
			<div className="search-box">
				{this.renderSearchInput()}
				<Combobox
					busy={isSearching}
					data={searchResults}
					groupBy="type"
					groupComponent={GroupHeading}
					itemComponent={ListItem}
					messages={{
						'emptyList': message,
					}}
					onChange={() => {}}
					open={open}
					onSelect={this.onSelect}
					onToggle={() => {}}
					textField="name"
					valueField="_id"
				/>
			</div>
		);
	}
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

const Tracker = withTracker(({ dispatch }) => {
	// force the results list to update when the user clicks "more..."
	const trigger = Search.updateMe.get();

	const state = store.getState();
	const searchTerm = getSearchTerm(state);
	const patternSearchLimit = getPatternSearchLimit(state);
	const userSearchLimit = getUserSearchLimit(state);
	let patternsResults = [];
	let usersResults = [];

	if (searchTerm) {
		// search for patterns
		// server returns extra results so the client knows if 'show more' should be shown
		const patternsCursor = PatternsIndex.search(searchTerm, { 'limit': patternSearchLimit + SEARCH_MORE }); // search is a reactive data source

		patternsResults = patternsCursor.fetch();

		// hide the 'more' results'
		patternsResults = patternsResults.slice(0, patternSearchLimit);

		if (patternsResults.length < patternsCursor.count()) {
			patternsResults.push({
				'name': 'Show more patterns',
				'type': 'showMorePatterns',
			});
		}

		// search for users
		// server returns extra results so the client knows if 'show more' should be shown
		const usersCursor = UsersIndex.search(searchTerm, { 'limit': userSearchLimit + SEARCH_MORE }); // search is a reactive data source
		usersResults = usersCursor.fetch();

		// hide the 'more' results'
		usersResults = usersResults.slice(0, userSearchLimit);

		if (usersResults.length < usersCursor.count()) {
			usersResults.push({
				'name': 'Show more users',
				'type': 'showMoreUsers',
			});
		}

		dispatch(setIsSearching(false));
	}
	Search.updateMe.set('false');

	return {
		'searchResults': patternsResults.concat(usersResults),
	};
})(Search);

export default connect()(Tracker);
