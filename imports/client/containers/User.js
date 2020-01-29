// detail of a single user

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
import store from '../modules/store';
import {
	getIsLoading,
	getPatternCount,
	setIsLoading,
	setPatternCountUserId,
} from '../modules/pattern';
import {
	addColorBook,
	copyColorBook,
	editIsPublic,
	removeColorBook,
} from '../modules/colorBook';

import {
	ColorBooks,
	PatternPreviews,
	Patterns,
	Tags,
} from '../../modules/collection';
import {
	getCanCreateColorBook,
	getIsAuthenticated,
	editTextField,
} from '../modules/auth';

import Loading from '../components/Loading';
import TabletFilterForm from '../forms/TabletFilterForm';
import PaginatedList from '../components/PaginatedList';
import PatternList from '../components/PatternList';
import PageWrapper from '../components/PageWrapper';
import ColorBookSummary from '../components/ColorBookSummary';
import AddColorBookForm from '../forms/AddColorBookForm';
import EditableText from '../components/EditableText';

import { ITEMS_PER_PAGE } from '../../modules/parameters';
import getUserpicStyle from '../modules/getUserpicStyle';

import './User.scss';
import '../components/Userpic.scss';

const queryString = require('query-string');

const bodyClass = 'user';

class User extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'gotUser': false,
			'selectedColorBook': null,
			'showAddColorBookForm': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickAddButton',
			'handleClickAddColorBook',
			'handleClickButtonCopy',
			'onClickEditableTextSave',
			'handleClickSelectColorBook',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentDidUpdate() {
		const { dispatch, user } = this.props;
		const { gotUser, isLoading } = this.state;

		// wait for user details to load
		if (!gotUser && !isLoading && user) {
			dispatch(setPatternCountUserId(user._id));

			this.setState({
				'gotUser': true,
			});
		}
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	onChangeColorBookIsPublic = ({ _id, isPublic }) => {
		const { dispatch } = this.props;

		dispatch(editIsPublic({ _id, isPublic }));
	};

	onClickEditableTextSave({ fieldValue, fieldName }) {
		const {
			dispatch,
			'user': {
				_id,
			},
		} = this.props;

		dispatch(editTextField({ _id, fieldValue, fieldName }));
	}

	handleClickButtonRemoveColorBook = ({ _id, name }) => {
		const { dispatch } = this.props;

		const response = confirm(`Do you want to delete the colour book "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeColorBook(_id));
		}
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
			canCreateColorBook,
			colorBooks,
			dispatch,
			isAuthenticated,
			'user': { _id },
		} = this.props;
		const { selectedColorBook, showAddColorBookForm } = this.state;

		const canCreate = canCreateColorBook && Meteor.userId() === _id;

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
								canCreateColorBook={canCreateColorBook}
								colorBook={colorBook}
								dispatch={dispatch}
								handleClickButtonCopy={this.handleClickButtonCopy}
								handleClickButtonRemove={this.handleClickButtonRemoveColorBook}
								handleClickButtonSelect={this.handleClickSelectColorBook}
								isAuthenticated={isAuthenticated}
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

	renderPatternsList() {
		const {
			currentPageNumber,
			dispatch,
			history,
			patterns,
			patternPreviews,
			patternCount,
			tags,
			user,
		} = this.props;

		return (
			<>
				<Row>
					<Col lg="12">
						<h2>Patterns</h2>
					</Col>
				</Row>
				<TabletFilterForm />
				<PaginatedList
					currentPageNumber={currentPageNumber}
					dispatch={dispatch}
					history={history}
					itemCount={patternCount}
				>
					<PatternList
						dispatch={dispatch}
						patternPreviews={patternPreviews}
						patterns={patterns}
						tags={tags}
						users={[user]}
					/>
				</PaginatedList>
			</>
		);
	}

	renderDescription() {
		const {
			'user': {
				_id,
				description,
			},
		} = this.props;
		const canEdit = _id === Meteor.userId();

		return (
			<EditableText
				canEdit={canEdit}
				fieldName="description"
				onClickSave={this.onClickEditableTextSave}
				optional={true}
				title="Description"
				type="textarea"
				fieldValue={description}
			/>
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
				console.log('render has user', user);
				content = (
					<>
						<Container>
							<h1
								className={getUserpicStyle(user._id)}
							>
								{user.username}
							</h1>
							{this.renderDescription()}
							{this.renderColorBooks()}
						</Container>
						<Container className="pattern-list-holder">
							{this.renderPatternsList()}
						</Container>
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
				{content}
			</PageWrapper>
		);
	}
}

User.propTypes = {
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'filterMaxTablets': PropTypes.number,
	'filterMinTablets': PropTypes.number,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'patternCount': PropTypes.number.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'user': PropTypes.objectOf(PropTypes.any).isRequired,
	'canCreateColorBook': PropTypes.bool.isRequired,
};

function mapStateToProps(state, ownProps) {
	console.log('mapStateToProps', ownProps);
	// find page number as URL query parameter, if present, in the form '/?page=1'
	let currentPageNumber = 1;
	const parsed = queryString.parse(ownProps.location.search);
	const page = parseInt(parsed.page, 10);

	if (!Number.isNaN(page)) {
		currentPageNumber = page;
	}

	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
		'canCreateColorBook': getCanCreateColorBook(state),
		'currentPageNumber': currentPageNumber, // read the url parameter to find the currentPage
		'errors': state.errors,
		'filterMaxTablets': state.pattern.filterMaxTablets,
		'filterMinTablets': state.pattern.filterMinTablets,
		'isAuthenticated': getIsAuthenticated(state),
		'isLoading': state.pattern.isLoading,
		'pageSkip': (currentPageNumber - 1) * ITEMS_PER_PAGE,
		'patternCount': state.pattern.patternCount,
	};
}

const Tracker = withTracker((props) => {
	const {
		_id,
		dispatch,
		filterMaxTablets,
		filterMinTablets,
		pageSkip,
	} = props;
	const state = store.getState();
	const isLoading = getIsLoading(state);

	Meteor.subscribe('users', [_id]);
	Meteor.subscribe('colorBooks', _id);

	const patterns = Patterns.find({ 'createdBy': _id }, {
		'sort': { 'nameSort': 1 },
		'limit': ITEMS_PER_PAGE,
	}).fetch();

	const handle = Meteor.subscribe('userPatterns', {
		filterMaxTablets,
		filterMinTablets,
		'limit': ITEMS_PER_PAGE,
		'skip': pageSkip,
		'userId': _id,
	}, {
		'onReady': () => {
			const patternIds = patterns.map((pattern) => pattern._id);

			Meteor.subscribe('patternPreviews', { patternIds }, _id);
		},
	});

	if (isLoading && handle.ready()) {
		dispatch(getPatternCount(_id));
		setTimeout(() => dispatch(setIsLoading(false)), 50);
	} else if (!isLoading && !handle.ready()) {
		dispatch(setIsLoading(true));
	}

	// pass database data as props
	return {
		'colorBooks': ColorBooks.find({ 'createdBy': _id }, {
			'sort': { 'nameSort': 1 },
		}).fetch(),
		patterns,
		'patternPreviews': PatternPreviews.find().fetch(),
		'tags': Tags.find().fetch(),
		'user': Meteor.users.findOne({ _id }), // to avoid error when subscription not ready
	};
})(User);

export default connect(mapStateToProps)(Tracker);
