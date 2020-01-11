import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
	getSelectedMainMenuItem,
	setSelectedMainMenuItem,
} from '../modules/page';

function MainMenu(props) {
	const {
		dispatch,
		selectedMainMenuItem,
	} = props;

	const history = useHistory();

	const handleClickMenuItem = ({ value, url }) => {
		dispatch(setSelectedMainMenuItem(value));
		history.push(url);
	};

	const renderMenuItem = ({ value, name, url }) => (
		<li
			className={selectedMainMenuItem === value ? 'selected' : ''}
			onClick={() => handleClickMenuItem({ value, url })}
			onKeyPress={() => handleClickMenuItem({ value, url })}
			role="menuitem"
			tabIndex="0"
		>
			{name}
		</li>
	);

	const menuItems = [
		{
			'value': 'home',
			'name': 'Home',
			'url': '/',
		},
		{
			'value': 'recentlyViewed',
			'name': 'Recently viewed',
			'url': '/recently-viewed',
		},
		{
			'value': 'newPatterns',
			'name': 'New patterns',
			'url': '/new-patterns',
		},
		{
			'value': 'myPatterns',
			'name': 'My patterns',
			'url': '/my-patterns',
		},
		{
			'value': 'allPatterns',
			'name': 'All patterns',
			'url': '/all-patterns',
		},
		{
			'value': 'people',
			'name': 'People',
			'url': '/people',
		},
	];

	return (
		<ul className="main-menu">
			{menuItems.map((menuItem) => renderMenuItem(menuItem))}
		</ul>
	);
}

MainMenu.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	//'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'selectedMainMenuItem': PropTypes.string.isRequired,
};

function mapStateToProps(state) {
	return {
		'selectedMainMenuItem': getSelectedMainMenuItem(state),
	};
}

export default connect(mapStateToProps)(MainMenu);
