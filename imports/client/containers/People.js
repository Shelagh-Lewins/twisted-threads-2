import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
	Col,
	Container,
	Row,
} from 'reactstrap';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import {
	getIsLoading,
	getUserCount,
	getUsersForPage,
	setIsLoading,
} from '../modules/auth';
import UserSummary from '../components/UserSummary';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PaginatedList from '../components/PaginatedList';

import { ITEMS_PER_PAGE } from '../../modules/parameters';
import './Home.scss';

const queryString = require('query-string');

const bodyClass = 'people';

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
		const { dispatch, pageSkip } = this.props;

		document.body.classList.add(bodyClass);

		dispatch(getUserCount());
		dispatch(getUsersForPage({
			'skip': pageSkip,
			'limit': ITEMS_PER_PAGE,
		}));

		setTimeout(() => dispatch(setIsLoading(false)), 100); // give time for user list to load
	}

	componentDidUpdate(prevProps) {
		const { currentPageNumber, dispatch, pageSkip } = this.props;

		if (currentPageNumber !== prevProps.currentPageNumber) {
			dispatch(getUserCount());
			dispatch(getUsersForPage({
				'skip': pageSkip,
				'limit': ITEMS_PER_PAGE,
			}));
		}
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	renderUsers() {
		const {
			users,
		} = this.props;

		if (users.length === 0) {
			return (
				<div className="empty">There are no people to display</div>
			);
		}

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
				<div
					className="menu-selected-area"
				>
					{isLoading && <Loading />}
					<Container>
						<Row>
							<Col lg="12">
								<h1>People</h1>
							</Col>
						</Row>
					</Container>
					{!isLoading && (
						<PaginatedList
							currentPageNumber={currentPageNumber}
							dispatch={dispatch}
							history={history}
							itemCount={userCount}
						>
							{this.renderUsers()}
						</PaginatedList>
					)}
				</div>
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
	'pageSkip': PropTypes.number.isRequired,
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
		'users': state.auth.usersForPage,
	};
}

export default connect(mapStateToProps)(People);
