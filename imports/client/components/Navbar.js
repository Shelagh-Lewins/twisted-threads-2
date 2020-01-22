// Navbar.js

import React, { Component } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
	getCanCreatePattern,
	getIsAuthenticated,
	getUsername,
} from '../modules/auth';
import {
	copyPattern,
	downloadPattern,
	removePattern,
} from '../modules/pattern';
import AppContext from '../modules/appContext';
import Search from './Search';
import './Navbar.scss';
import { iconColors } from '../../modules/parameters';

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			'showDropdown': false,
		};
	}

	handleClickButtonRemove = ({ _id, name }) => {
		const { dispatch, history } = this.props;
		const response = confirm(`Do you want to delete the pattern ${name}?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removePattern(_id, history));
		}
	};

	handleClickButtonDownload({ _id }) {
		const { dispatch } = this.props;
		const {
			pattern,
		} = this.context;

		dispatch(downloadPattern(_id, pattern));
	}

	handleClickButtonCopy({ _id }) {
		const { dispatch, history } = this.props;

		dispatch(copyPattern(_id, history));
	}

	showDropdown(e) {
		e.preventDefault();
		this.setState((prevState) => ({
			'showDropdown': !prevState.showDropdown,
		}));
	}

	render() {
		const {
			canCreatePattern,
			dispatch,
			history,
			isAuthenticated,
			isLoading,
			isSearching,
			searchTerm,
			username,
		} = this.props;

		const {
			pattern,
			patternId,
		} = this.context;

		let isOwner = false;

		if (patternId && pattern && Meteor.user()) {
			isOwner = pattern.createdBy === Meteor.user()._id;
		}

		const showPatternMenu = !isLoading && patternId && (canCreatePattern || isOwner);

		let patternMenu;
		let myPatternsLink;

		if (showPatternMenu) {
			myPatternsLink = (
				<Link to="/my-patterns" className="nav-link">My patterns</Link>
			);

			const buttonDownload = (
				<Button
					type="button"
					onClick={() => this.handleClickButtonDownload({ '_id': patternId })}
					title="Download pattern"
				>
					<FontAwesomeIcon icon={['fas', 'file-download']} style={{ 'color': iconColors.contrast }} size="1x" />
					<span className="d-inline d-sm-none button-text nav-link">Download pattern</span>
				</Button>
			);

			const buttonCopy = (
				<Button
					type="button"
					onClick={() => this.handleClickButtonCopy({ '_id': patternId })}
					title="Copy pattern"
				>
					<FontAwesomeIcon icon={['fas', 'clone']} style={{ 'color': iconColors.contrast }} size="1x" />
					<span className="d-inline d-sm-none button-text nav-link">Copy pattern</span>
				</Button>
			);

			const buttonRemove = (
				<Button
					type="button"
					onClick={() => this.handleClickButtonRemove({ '_id': patternId, 'name': pattern.name })}
					title="Delete pattern"
				>
					<FontAwesomeIcon icon={['fas', 'trash']} style={{ 'color': iconColors.contrast }} size="1x" />
					<span className="d-inline d-sm-none button-text nav-link">Delete pattern</span>
				</Button>
			);

			patternMenu = (
				<ul className="pattern-menu navbar-nav ml-auto">
					<li className="nav-item">{buttonDownload}</li>
					{canCreatePattern && <li className="nav-item">{buttonCopy}</li>}
					{isOwner && <li className="nav-item">{buttonRemove}</li>}
				</ul>
			);
		}

		const { showDropdown } = this.state;
		const authLinks = (
			<ul className="navbar-nav ml-auto">
				<li className="nav-item"><Link to="/account" className="nav-link">{username}</Link></li>
			</ul>
		);
		const guestLinks = (
			<ul className="navbar-nav ml-auto">
				<li className="nav-item">
					<Link className="nav-link" to="/register">Register</Link>
				</li>
				<li className="nav-item">
					<Link className="nav-link" to="/login">Login</Link>
				</li>
			</ul>
		);

		return (
			<nav className="navbar navbar-expand-md navbar-dark">
				<Link className="navbar-brand" to="/"><span className="logo" />Twisted Threads</Link>
				<Search
					dispatch={dispatch}
					history={history}
					isSearching={isSearching}
					searchTerm={searchTerm}
				/>
				{myPatternsLink}
				<button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation" onClick={(e) => { this.showDropdown(e); }}>
					<span className="navbar-toggler-icon" />
				</button>
				<div className={`collapse navbar-collapse ${showDropdown ? 'show' : ''}`} id="navbarSupportedContent">
					{showPatternMenu && patternMenu}
					{isAuthenticated ? authLinks : guestLinks}
				</div>
			</nav>
		);
	}
}

Navbar.contextType = AppContext;

Navbar.propTypes = {
	'canCreatePattern': PropTypes.bool.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'isSearching': PropTypes.bool.isRequired,
	'searchTerm': PropTypes.string.isRequired,
	'username': PropTypes.string,
};

const mapStateToProps = (state, ownProps) => ({
	'canCreatePattern': getCanCreatePattern(state),
	'isAuthenticated': getIsAuthenticated(state),
	'isLoading': state.pattern.isLoading,
	'isSearching': state.search.isSearching,
	'searchTerm': state.search.searchTerm,
	'username': getUsername(state),
});

export default withRouter(connect(mapStateToProps)(Navbar));
