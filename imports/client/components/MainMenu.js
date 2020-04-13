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

import './MainMenu.scss';

class MainMenu extends Component {
	mainMenuItems = [
		{
			'value': 'home',
			'name': 'Home',
			'url': '/',
			'loginRequired': false,
		},
		{
			'value': 'myProfile',
			'name': 'My profile',
			'url': `/user/${Meteor.userId()}`,
			'loginRequired': true,
		},
		{
			'value': 'myAccount',
			'name': 'My account',
			'url': '/account',
			'loginRequired': true,
			'sectionBreak': true,
		},
		{
			'value': 'recentPatterns',
			'name': 'Recently viewed',
			'url': '/recent-patterns',
			'loginRequired': false,
		},
		{
			'value': 'newPatterns',
			'name': 'New patterns',
			'url': '/new-patterns',
			'loginRequired': false,
		},
		{
			'value': 'myPatterns',
			'name': 'My patterns',
			'url': `/user/${Meteor.userId()}/patterns`,
			'loginRequired': true,
		},
		{
			'value': 'allPatterns',
			'name': 'All patterns',
			'url': '/all-patterns',
			'loginRequired': false,
			'sectionBreak': true,
		},
		{
			'value': 'people',
			'name': 'People',
			'url': '/people',
			'loginRequired': false,
		},
		{
			'value': 'about',
			'name': 'About',
			'url': '/about',
			'loginRequired': false,
		},
		{
			'value': 'faq',
			'name': 'FAQ',
			'url': '/faq',
			'loginRequired': false,
		},
	];

	componentDidMount() {
		this.setMainMenuItem();
	}

	componentDidUpdate(prevProps) {
		const {
			location,
		} = this.props;

		if (location !== prevProps.location) {
			this.setMainMenuItem();
		}
	}

	setMainMenuItem() {
		const {
			dispatch,
			location,
		} = this.props;

		if (location) {
			const { pathname } = location;
			this.mainMenuItems.map((menuItem) => {
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
			history,
			isAuthenticated,
			selectedMainMenuItem,
		} = this.props;

		const handleClickMenuItem = ({ url }) => {
			history.push(url);
		};

		const renderMenuItem = ({
			name,
			sectionBreak,
			url,
			value,
		}) => {
			let className = '';
			if (selectedMainMenuItem === value) {
				className = 'selected';
			}

			if (sectionBreak) {
				className += ' section-break';
			}

			return (
				<li
					className={className}
					key={value}
					onClick={() => handleClickMenuItem({ value, url })}
					onKeyPress={() => handleClickMenuItem({ value, url })}
					role="menuitem"
					tabIndex="0"
				>
					{name}
				</li>
			);
		};

		const renderMenuItems = () => {
			const menuItems = [];

			this.mainMenuItems.forEach((menuItem) => {
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
