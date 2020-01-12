import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
	getIsAuthenticated,
} from '../modules/auth';
import {
	getSelectedMainMenuItem,
	setSelectedMainMenuItem,
} from '../modules/page';
import { MAIN_MENU_ITEMS } from '../../modules/parameters';

function MainMenu(props) {
	const {
		dispatch,
		isAuthenticated,
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
			key={value}
			onClick={() => handleClickMenuItem({ value, url })}
			onKeyPress={() => handleClickMenuItem({ value, url })}
			role="menuitem"
			tabIndex="0"
		>
			{name}
		</li>
	);

	const renderMenuItems = () => {
		const menuItems = [];

		MAIN_MENU_ITEMS.forEach((menuItem) => {
			const { loginRequired } = menuItem;
			if (!loginRequired || (loginRequired && isAuthenticated)) {
				menuItems.push(renderMenuItem(menuItem));
			}
		});

		return menuItems;
	};

	return (
		<ul className="main-menu">
			{renderMenuItems()}
		</ul>
	);
}

MainMenu.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'selectedMainMenuItem': PropTypes.string.isRequired,
};

function mapStateToProps(state) {
	return {
		'isAuthenticated': getIsAuthenticated(state),
		'selectedMainMenuItem': getSelectedMainMenuItem(state),
	};
}

export default connect(mapStateToProps)(MainMenu);
