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
import PropTypes from 'prop-types';
import { getPatternCount, setIsLoading } from '../modules/pattern';
import {
	addColorBook,
	copyColorBook,
	editIsPublic,
	removeColorBook,
} from '../modules/colorBook';
import { getIsVerified } from '../modules/auth';
import { ColorBooks, PatternPreviews, Patterns } from '../../modules/collection';

import Loading from '../components/Loading';
import PatternList from '../components/PatternList';
import PageWrapper from '../components/PageWrapper';
import ColorBookSummary from '../components/ColorBookSummary';
import AddColorBookForm from '../forms/AddColorBookForm';

import { ITEMS_PER_PAGE } from '../../modules/parameters';

import './User.scss';

const queryString = require('query-string');

const bodyClass = 'user';

class User extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'selectedColorBook': null,
			'showAddColorBookForm': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickAddButton',
			'handleClickAddColorBook',
			'handleClickButtonCopy',
			'handleClickSelectColorBook',
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

	onChangeColorBookIsPublic = ({ _id, isPublic }) => {
		const { dispatch } = this.props;

		dispatch(editIsPublic({ _id, isPublic }));
	};

	handleClickButtonCopy = ({ _id }) => {
		const { colorBooks, dispatch, history } = this.props;
		const thisColorBook = colorBooks.find((colorBook) => colorBook._id === _id);

		if (thisColorBook) {
			const response = confirm(`Do you want to make a copy of the color book "${thisColorBook.name}"?`); // eslint-disable-line no-restricted-globals

			if (response === true) {
				dispatch(copyColorBook(_id, history));
			}
		}
	};

	handleClickButtonRemoveColorBook = ({ _id, name }) => {
		const { dispatch } = this.props;

		const response = confirm(`Do you want to delete the colour book "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeColorBook(_id));
		}
	};

	// show the form to add a new color book
	handleClickAddButton() {
		this.setState({
			'showAddColorBookForm': true,
		});
	}

	// actually add a new color book
	handleClickAddColorBook({ name }) {
		const { dispatch } = this.props;

		dispatch(addColorBook(name));
		this.setState({
			'showAddColorBookForm': false,
		});
	}

	// hide the add color book form and take no action
	cancelAddColorBook() {
		this.setState({
			'showAddColorBookForm': false,
		});
	}

	handleClickSelectColorBook({ _id }) {
		const { selectedColorBook } = this.state;

		let newColorBook;

		if (_id !== selectedColorBook) {
			newColorBook = _id; // select new color book
		} else {
			newColorBook = selectedColorBook ? null : _id;
		}

		this.setState({
			'selectedColorBook': newColorBook,
		});
	}

	renderColorBooks() {
		const {
			colorBooks,
			dispatch,
		} = this.props;
		const { selectedColorBook, showAddColorBookForm } = this.state;

		const canCreate = getIsVerified();

		const addButton = (
			<Button
				className="add"
				color="secondary"
				onClick={this.handleClickAddButton}
				title="Add color book"
			>
				+ New
			</Button>
		);

		return (
			<>
				<Row>
					<Col lg="12">
						<h2>Colour Books</h2>
						<div className="add-controls">
							{canCreate && !showAddColorBookForm && addButton}
							{canCreate && showAddColorBookForm && (
								<AddColorBookForm
									handleCancel={this.cancelAddColorBook}
									handleSubmit={this.handleClickAddColorBook}
								/>
							)}
						</div>
					</Col>
				</Row>
				{colorBooks.length === 0 && (
					<div>There are no colour books to display</div>
				)}
				<Row>
					<Col md="12" className="color-books-user">
						{colorBooks.length > 0
						&& colorBooks.map((colorBook) => (
							<ColorBookSummary
								colorBook={colorBook}
								dispatch={dispatch}
								handleClickButtonCopy={this.handleClickButtonCopy}
								handleClickButtonRemove={this.handleClickButtonRemoveColorBook}
								handleClickButtonSelect={this.handleClickSelectColorBook}
								isSelected={colorBook._id === selectedColorBook}
								key={`color-book-${colorBook._id}`}
								onChangeIsPublic={this.onChangeColorBookIsPublic}
							/>
						))}
					</Col>
				</Row>
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
			dispatch,
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
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<Container>
					{content}
				</Container>
			</PageWrapper>
		);
	}
}

User.propTypes = {
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
	Meteor.subscribe('colorBooks', _id);

	const patterns = Patterns.find({ 'createdBy': _id }, {
		'sort': { 'nameSort': 1 },
		'limit': ITEMS_PER_PAGE,
	}).fetch();

	Meteor.subscribe('patterns', pageSkip, ITEMS_PER_PAGE, {
		'onReady': () => {
			dispatch(getPatternCount(_id));
			dispatch(setIsLoading(false));

			const patternIds = patterns.map((pattern) => pattern._id);

			Meteor.subscribe('patternPreviews', { patternIds }, _id);
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
