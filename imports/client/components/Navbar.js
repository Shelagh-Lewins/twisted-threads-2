// Navbar.js

import React, { Component } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link, matchPath, withRouter } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { copyPattern, removePattern } from '../modules/pattern';
import { Patterns } from '../../modules/collection';

import './Navbar.scss';

import { getIsAuthenticated, getIsVerified, getUser } from '../modules/auth';
import { iconColors } from '../../modules/parameters';

class Navbar extends Component {
	constructor(props) {
		super(props);
		this.state = {
			'showDropdown': false,
		};
	}

	handleClickButtonRemove = ({ _id }) => {
		const { dispatch, history, pattern } = this.props;
		const response = confirm(`Do you want to delete the pattern ${pattern.name}?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removePattern(_id, history));
		}
	};

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
			createdBy,
			// gotUser,
			isAuthenticated,
			// 'pattern': { createdBy },
			patternId,
			username,
			verified,
		} = this.props;
// console.log('**patternId', patternId);
		let isOwner = false;
// console.log('gotUser', gotUser);
		if (patternId && Meteor.user()) {
			// console.log('createdBy', createdBy);
			isOwner = createdBy === Meteor.user()._id;
		}
// console.log('isOwner', isOwner);
		const showPatternMenu = patternId && (verified || isOwner);
		let patternMenu;

		if (showPatternMenu) {
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
					onClick={() => this.handleClickButtonRemove({ '_id': patternId })}
					title="Delete pattern"
				>
					<FontAwesomeIcon icon={['fas', 'trash']} style={{ 'color': iconColors.contrast }} size="1x" />
					<span className="d-inline d-sm-none button-text nav-link">Delete pattern</span>
				</Button>
			);

			patternMenu = (
				<ul className="pattern-menu navbar-nav ml-auto">
					<li className="nav-item">{buttonCopy}</li>
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
			<nav className="navbar navbar-expand-sm navbar-dark">
				<Link className="navbar-brand" to="/">Twisted Threads</Link>
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

Navbar.propTypes = {
	'createdBy': PropTypes.string, // force update on id change e.g. if copy pattern
	'dispatch': PropTypes.func.isRequired,
	// 'gotUser': PropTypes.bool.isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any),
	'patternId': PropTypes.string, // force update on id change e.g. if copy pattern
	'username': PropTypes.string,
	'verified': PropTypes.bool.isRequired,
};

const mapStateToProps = (state, ownProps) => ({
	'location': ownProps.location,
	'verified': getIsVerified(),
});

// withTracker makes checks of user status reactive
const Tracker = withTracker(({ location }) => {
	// props.match is not global. Instead we have to use matchPath to find url and params in Navbar
	console.log('*** location', location);
	const match = matchPath(location.pathname, {
		'path': '/pattern/:id',
		'exact': false,
		'strict': false,
	});
console.log('*** match', match);
	let pattern = {};
	let createdBy;
	let patternIdParam;
	// let gotUser = false;

	if (match) {
		patternIdParam = match.params.id;

		if (patternIdParam) {
			Meteor.subscribe('pattern', patternIdParam, {
				'onReady': () => {
					pattern = Patterns.findOne({ '_id': patternIdParam }) || {}; // in case pattern doesn't exist or cannot be viewed
					createdBy = pattern.createdBy;
					Meteor.subscribe('users', [createdBy]);
				},
			});
		}
	}
	// console.log('gotUser in tracker', gotUser);

	return {
		// 'gotUser': gotUser,
		'isAuthenticated': getIsAuthenticated(),
		'pattern': pattern,
		'createdBy': createdBy,
		'patternId': pattern._id,
		'username': getUser().username,
	};
})(Navbar);

export default withRouter(connect(mapStateToProps)(Tracker));
