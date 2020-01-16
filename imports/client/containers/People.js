import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Col,
	Container,
	Row,
} from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import store from '../modules/store';
import {
	getIsLoading,
	getUserCount,
	setIsLoading,
} from '../modules/auth';
import UserSummary from '../components/UserSummary';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PaginatedList from '../components/PaginatedList';

import { ITEMS_PER_PAGE } from '../../modules/parameters';
import './Home.scss';

const queryString = require('query-string');

const bodyClass = 'my-patterns';

class People extends Component {
	constructor(props) {
		super(props);

		// bind onClick functions to provide context
		const functionsToBind = [
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	renderUsers() {
		const {
			users,
		} = this.props;

		return users.map((user) => {
			const { _id } = user;

			return (
				<div key={`user-summary-${_id}`}>
					<UserSummary
						user={user}
					/>
				</div>
			);
		});
	}

	render() {
		const {
			currentPageNumber,
			dispatch,
			errors,
			history,
			isLoading,
			userCount,
		} = this.props;

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<MainMenu />
				<Container
					className="menu-selected-area"
				>
					{isLoading && <Loading />}
					<Row>
						<Col lg="12">
							<h1>People</h1>
						</Col>
					</Row>
					{!isLoading
						&& userCount > 0
						&& (
							<PaginatedList
								currentPageNumber={currentPageNumber}
								dispatch={dispatch}
								history={history}
								itemCount={userCount}
							>
								{this.renderUsers()}
							</PaginatedList>
						)}
				</Container>
			</PageWrapper>
		);
	}
}

People.defaultProps = {
	'currentPageNumber': 1,
};

People.propTypes = {
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'userCount': PropTypes.number.isRequired,
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	// find page number as URL query parameter, if present, in the form '/?page=1'
	let currentPageNumber = 1;
	const parsed = queryString.parse(ownProps.location.search);
	const page = parseInt(parsed.page, 10);

	if (!Number.isNaN(page)) {
		currentPageNumber = page;
	}

	return {
		'currentPageNumber': currentPageNumber, // read the url parameter to find the currentPage
		'errors': state.errors,
		'isLoading': getIsLoading(state),
		'pageSkip': (currentPageNumber - 1) * ITEMS_PER_PAGE,
		'userCount': state.auth.userCount,
	};
}

const Tracker = withTracker(({ pageSkip, dispatch }) => {
	const state = store.getState();
	const isLoading = getIsLoading(state);

	const users = Meteor.users.find(
		{},
		{
			'sort': { 'username': 1 },
			'limit': ITEMS_PER_PAGE,
		},
	).fetch();

	const handle = Meteor.subscribe('allUsers', pageSkip, ITEMS_PER_PAGE);

	if (isLoading && handle.ready()) {
		dispatch(getUserCount());
		dispatch(setIsLoading(false));
	} else if (!isLoading && !handle.ready()) {
		dispatch(setIsLoading(true));
	}

	return {
		users,
	};
})(People);

export default connect(mapStateToProps)(Tracker);
