import React from 'react';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
	getSelectedMainMenuItem,
	setSelectedMainMenuItem,
} from '../modules/page';
import { MAIN_MENU_ITEMS } from '../../modules/parameters';

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
			key={value}
			onClick={() => handleClickMenuItem({ value, url })}
			onKeyPress={() => handleClickMenuItem({ value, url })}
			role="menuitem"
			tabIndex="0"
		>
			{name}
		</li>
	);

	return (
		<ul className="main-menu">
			{MAIN_MENU_ITEMS.map((menuItem) => renderMenuItem(menuItem))}
		</ul>
	);
}

MainMenu.propTypes = {
	'dispatch': PropTypes.func.isRequired,
	'selectedMainMenuItem': PropTypes.string.isRequired,
};

function mapStateToProps(state) {
	return {
		'selectedMainMenuItem': getSelectedMainMenuItem(state),
	};
}

export default connect(mapStateToProps)(MainMenu);
