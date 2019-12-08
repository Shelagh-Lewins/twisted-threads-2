// detail of a single pattern

import React, { PureComponent } from 'react';
import {
	Button,
	Col,
	Container,
	Row,
} from 'reactstrap';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { getPatternCount, setIsLoading } from '../modules/pattern';
import { editIsPublic, removeColorBook } from '../modules/colorBook';

import { ColorBooks, PatternPreviews, Patterns } from '../../modules/collection';
import Loading from '../components/Loading';
import PatternList from '../components/PatternList';
import isEmpty from '../modules/isEmpty';
import { clearErrors } from '../modules/errors';
import formatErrorMessages from '../modules/formatErrorMessages';
import FlashMessage from '../components/FlashMessage';
import ColorBookSummary from '../components/ColorBookSummary';

import { ITEMS_PER_PAGE } from '../../modules/parameters';

import './Pattern.scss';

const queryString = require('query-string');

const bodyClass = 'user';

class User extends PureComponent {
	constructor(props) {
		super(props);

		// bind onClick functions to provide context
		const functionsToBind = [];

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

	onChangeColorBookIsPublic = ({ _id, isPublic }) => {
		const { dispatch } = this.props;

		dispatch(editIsPublic({ _id, isPublic }));
	};

	handleClickButtonRemoveColorBook = ({ _id, name }) => {
		const { dispatch } = this.props;
		const response = confirm(`Do you want to delete the color book "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeColorBook(_id));
		}
	};

	renderColorBooks() {
		const {
			colorBooks,
			dispatch,
		} = this.props;

		return (
			<>
				<Row>
					<Col lg="12">
						<h2>Colour Books</h2>
					</Col>
				</Row>
				{colorBooks.length === 0 && (
					<div>There are no colour books to display</div>
				)}
				{colorBooks.length > 0
				&& colorBooks.map((colorBook) => (
					<ColorBookSummary
						colorBook={colorBook}
						dispatch={dispatch}
						handleClickButtonRemove={this.handleClickButtonRemoveColorBook}
						key={`color-book${colorBook.id}`}
						onChangeIsPublic={this.onChangeColorBookIsPublic}
					/>
				))}
			</>
		);
	}

	renderPatterns() {
		const {
			currentPageNumber,
			dispatch,
			history,
			isLoading,
			patterns,
			patternCount,
			patternPreviews,
			user,
		} = this.props;

		return (
			<>
				{!isLoading && (
					<>
						<Row>
							<Col lg="12">
								<h2>Patterns</h2>
							</Col>
						</Row>
						{patternCount === 0 && (
							<div>There are no patterns to display</div>
						)}
						{patternCount > 0 && (
							<PatternList
								currentPageNumber={currentPageNumber}
								dispatch={dispatch}
								history={history}
								patternCount={patternCount}
								patterns={patterns}
								patternPreviews={patternPreviews}
								users={[user]}
							/>
						)}
					</>
				)}
			</>
		);
	}

	render() {
		const {
			errors,
			isLoading,
			user,
		} = this.props;

		let content = <Loading />;

		if (!isLoading) {
			if (user) {
				content = (
					<>
						<h1>{user.username}</h1>
						{this.renderColorBooks()}
						{this.renderPatterns()}
					</>
				);
			} else {
				content = <p>Either this user does not exist or you do not have permission to view their details</p>;
			}
		}

		return (
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
				{content}
			</Container>
		);
	}
}

User.propTypes = {
	// '_id': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'patternCount': PropTypes.number.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'user': PropTypes.objectOf(PropTypes.any).isRequired,
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
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
		'currentPageNumber': currentPageNumber, // read the url parameter to find the currentPage
		'errors': state.errors,
		'isLoading': state.pattern.isLoading,
		'pageSkip': (currentPageNumber - 1) * ITEMS_PER_PAGE,
		'patternCount': state.pattern.patternCount,
	};
}

const Tracker = withTracker((props) => {
	const { _id, dispatch, pageSkip } = props;
	dispatch(setIsLoading(true));

	Meteor.subscribe('users', [_id]);

	Meteor.subscribe('colorBooks');

	const patterns = Patterns.find({ 'createdBy': _id }, {
		'sort': { 'nameSort': 1 },
		'limit': ITEMS_PER_PAGE,
	}).fetch();

	Meteor.subscribe('patterns', pageSkip, ITEMS_PER_PAGE, {
		'onReady': () => {
			dispatch(getPatternCount(_id));
			dispatch(setIsLoading(false));

			const patternIds = patterns.map((pattern) => pattern._id);

			Meteor.subscribe('patternPreviews', { patternIds });
		},
	});

	// pass database data as props
	return {
		'colorBooks': ColorBooks.find({}, {
			'sort': { 'nameSort': 1 },
		}).fetch(),
		patterns,
		'patternPreviews': PatternPreviews.find().fetch(),
		'user': Meteor.users.findOne({ _id }) || {}, // to avoid error when subscription not ready
	};
})(User);

export default connect(mapStateToProps)(Tracker);
