import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { addPattern, getPatternCount, setIsLoading } from '../modules/pattern';

import Patterns from '../../collection';
import Loading from '../components/Loading';
import PatternList from '../components/PatternList';
import AddPatternForm from '../components/AddPatternForm';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';

import { ITEMS_PER_PAGE } from '../../parameters';
import './Home.scss';

const queryString = require('query-string');

class Home extends Component {
	constructor(props) {
		super(props);

		this.state = {};
	}

	componentDidMount() {
		this.clearErrors();
	}

	onCloseFlashMessage() {
		this.clearErrors();
	}

	handleSubmit = ({ name }, { resetForm }) => {
		const { dispatch } = this.props;

		dispatch(addPattern(name));
		resetForm();
	}

	clearErrors() {
		const { dispatch } = this.props;

		dispatch(clearErrors());
	}

	render() {
		const {
			currentPageNumber,
			dispatch,
			errors,
			history,
			isLoading,
			patternCount,
			patterns,
		} = this.props;
		return (
			<div>
				<Container>
					{!isEmpty(errors) && (
						<Row>
							<Col lg="12">
								<FlashMessage
									message={formatErrorMessages(errors)}
									type="error"
									onClick={this.onCloseFlashMessage}
								/>
							</Col>
						</Row>
					)}
					{isLoading && <Loading />}
					<Row>
						<Col lg="12">
							<h1>Home</h1>
							<AddPatternForm
								handleSubmit={this.handleSubmit}
							/>
							<hr />
						</Col>
					</Row>
					<PatternList
						currentPageNumber={currentPageNumber}
						dispatch={dispatch}
						history={history}
						patternCount={patternCount}
						patterns={patterns}
					/>
				</Container>
			</div>
		);
	}
}

Home.defaultProps = {
	'currentPageNumber': 1,
};

Home.propTypes = {
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
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
		'isLoading': state.pattern.isLoading,
		'pageSkip': (currentPageNumber - 1) * ITEMS_PER_PAGE,
		'patternCount': state.pattern.patternCount,
	};
}

const Tracker = withTracker(({ pageSkip, dispatch }) => {
	dispatch(setIsLoading(true));

	Meteor.subscribe('patterns', pageSkip, ITEMS_PER_PAGE, {
		'onReady': () => {
			dispatch(getPatternCount());
			dispatch(setIsLoading(false));
		},
	});

	return {
		'patterns': Patterns.find({}, {
			'sort': { 'name_sort': 1 },
			'limit': ITEMS_PER_PAGE,
		}).fetch(),
		/* 'patterns': Patterns.find({}, { 'limit': ITEMS_PER_PAGE }).fetch().sort((a, b) => {
			if (a.name_sort < b.name_sort) {
				return -1;
			}
			if (a.name_sort > b.name_sort) {
				return 1;
			}
			return 0;
		}), */
	};
})(Home);

export default connect(mapStateToProps)(Tracker);
