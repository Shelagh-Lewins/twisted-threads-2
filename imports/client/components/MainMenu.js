import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	matchPath,
	withRouter,
} from 'react-router-dom';
import PropTypes from 'prop-types';
import {
	getIsAuthenticated,
} from '../modules/auth';
import {
	getSelectedMainMenuItem,
	setSelectedMainMenuItem,
} from '../modules/page';
import { MAIN_MENU_ITEMS } from '../../modules/parameters';

import './MainMenu.scss';

class MainMenu extends Component {
	componentDidMount() {
		const {
			dispatch,
			location,
		} = this.props;

		if (location) {
			const { pathname } = location;
			MAIN_MENU_ITEMS.map((menuItem) => {
				if (matchPath(pathname, {
					'path': menuItem.url,
					'exact': true,
					'strict': false,
				})) {
					dispatch(setSelectedMainMenuItem(menuItem.value));
				}
			});
		}
	}

	render() {
		const {
			dispatch,
			history,
			isAuthenticated,
			selectedMainMenuItem,
		} = this.props;

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
}

MainMenu.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'location': PropTypes.objectOf(PropTypes.any),
	'selectedMainMenuItem': PropTypes.string.isRequired,
};

function mapStateToProps(state) {
	return {
		'isAuthenticated': getIsAuthenticated(state),
		'selectedMainMenuItem': getSelectedMainMenuItem(state),
	};
}


export default withRouter(connect(mapStateToProps)(MainMenu));
