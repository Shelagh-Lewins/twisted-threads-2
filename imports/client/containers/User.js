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
	setColorBookAdded,
} from '../modules/colorBook';

import {
	ColorBooks,
	PatternPreviews,
	Patterns,
	Tags,
} from '../../modules/collection';
import {
	getCanCreateColorBook,
	getCanCreatePattern,
	getIsAuthenticated,
	editTextField,
} from '../modules/auth';

import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import TabletFilterForm from '../forms/TabletFilterForm';
import PaginatedList from '../components/PaginatedList';
import PatternList from '../components/PatternList';
import PageWrapper from '../components/PageWrapper';
import ColorBookSummary from '../components/ColorBookSummary';
import AddColorBookForm from '../forms/AddColorBookForm';
import AddPatternButton from '../components/AddPatternButton';
import EditableText from '../components/EditableText';

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
			'showAddPatternForm': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleClickAddColorBookButton',
			'handleClickAddColorBook',
			'cancelAddColorBook',
			'handleClickButtonCopy',
			'handleClickSelectColorBook',
			'onClickEditableTextSave',
			'updateShowAddPatternForm',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});

		this.patternsRef = React.createRef();
	}

	componentDidMount() {
		// const { filterMinTablets, filterMaxTablets } = this.props;
		document.body.classList.add(bodyClass);
	}

	componentDidUpdate(prevProps) {
		const {
			colorBookAdded,
			currentPageNumber,
			dispatch,
			filterMinTablets,
			filterMaxTablets,
			section,
			user,
		} = this.props;

		const { gotUser, isLoading } = this.state;

		// wait for user details to load
		if (!gotUser && !isLoading && user) {
			dispatch(setPatternCountUserId(user._id));

			this.setState({
				'gotUser': true,
			});

			// give the page time to render
			setTimeout(() => {
				this.scrollPatternsIntoView();
			}, 2000);
		}

		if (section) {
			if (!prevProps.section) {
				// navigated from My patterns to My profile
				setTimeout(() => {
					this.scrollPatternsIntoView();
				}, 500);
			} else if (currentPageNumber !== prevProps.currentPageNumber) {
				// changed page within My patterns
				setTimeout(() => {
					this.scrollPatternsIntoView({ 'behavior': 'auto' });
				}, 500);
			}
			// navigated from My profile to My documents
		} else if (!section && prevProps.section) {
			this.scrollTop();
		}

		let filterChange = false;

		if (filterMaxTablets !== prevProps.filterMaxTablets) {
			filterChange = true;
		}

		if (filterMinTablets !== prevProps.filterMinTablets) {
			filterChange = true;
		}

		if (filterChange) {
			setTimeout(() => {
				this.scrollPatternsIntoView({ 'behavior': 'auto' });
			}, 500);
		}

		// automatically select a new color book
		if (prevProps.colorBookAdded === '' && colorBookAdded !== '') {
			this.setState({ // eslint-disable-line react/no-did-update-set-state
				'selectedColorBook': colorBookAdded,
			});
			dispatch(setColorBookAdded(''));
		}
	}

	componentWillUnmount() {
		const { dispatch } = this.props;
		document.body.classList.remove(bodyClass);
		dispatch(setPatternCountUserId(undefined));
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

	scrollPatternsIntoView(options = { 'behavior': 'smooth' }) {
		const { section } = this.props;
		const { behavior } = options;

		const that = this;

		if (section === 'patterns') {
			const node = that.patternsRef.current;

			node.scrollIntoView({
				behavior,
				'block': 'start',
				'inline': 'nearest',
			});
		}
	}

	scrollTop() { // eslint-disable-line class-methods-use-this
		window.scroll({
			'top': 0,
			'left': 0,
			'behavior': 'auto',
		});
	}

	// show the form to add a new color book
	handleClickAddColorBookButton() {
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

	updateShowAddPatternForm(showForm) {
		this.setState({
			'showAddPatternForm': showForm,
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
				color="primary"
				onClick={this.handleClickAddColorBookButton}
				title="Add color book"
			>
				+ New colour book
			</Button>
		);

		return (
			<>
				<Row>
					<Col lg="12">
						{!showAddColorBookForm && <h2>Colour Books</h2>}
						{canCreate && (
							<div className="add-controls">
								{!showAddColorBookForm && addButton}
								{showAddColorBookForm && (
									<AddColorBookForm
										handleCancel={this.cancelAddColorBook}
										handleSubmit={this.handleClickAddColorBook}
									/>
								)}
							</div>
						)}
					</Col>
				</Row>
				{!showAddColorBookForm && colorBooks.length === 0 && (
					<div>There are no colour books to display</div>
				)}
				{!showAddColorBookForm && colorBooks.length > 0 && (
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
				)}
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
		const { showAddPatternForm } = this.state;

		return (
			<>
				{!showAddPatternForm && (
					<>
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
				)}
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
				editButtonText="Edit description"
				fieldName="description"
				onClickSave={this.onClickEditableTextSave}
				optional={true}
				title="Profile"
				type="textarea"
				fieldValue={description}
			/>
		);
	}

	render() {
		const {
			canCreatePattern,
			dispatch,
			errors,
			history,
			isLoading,
			user,
		} = this.props;

		const { showAddPatternForm } = this.state;

		let content = <Loading />;

		if (!isLoading) {
			if (user) {
				const { _id, username } = user;
				const canCreate = canCreatePattern && Meteor.userId() === _id;
				content = (
					<>
						<Container>
							<h1>
								<span
									className={`${getUserpicStyle(_id)} icon`}
									style={{ 'backgroundImage': `url(${Meteor.absoluteUrl('/images/user_profile.png')}` }}
								/>
								{username}
							</h1>
							{this.renderDescription()}
							<hr />
							{this.renderColorBooks()}
							<hr />
							{!showAddPatternForm && (
								<Row>
									<Col lg="12">
										<h2 ref={this.patternsRef}>Patterns</h2>
									</Col>
								</Row>
							)}
							{canCreate && (
								<AddPatternButton
									dispatch={dispatch}
									history={history}
									updateShowAddPatternForm={this.updateShowAddPatternForm}
								/>
							)}
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
				<MainMenu />
				<div
					className="menu-selected-area"
					ref={this.containerRef}
				>
					{content}
				</div>
			</PageWrapper>
		);
	}
}

User.propTypes = {
	'canCreatePattern': PropTypes.bool.isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'currentPageNumber': PropTypes.number,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	// eslint doesn't realise the filters are used in Tracker
	'filterMaxTablets': PropTypes.number,
	'filterMinTablets': PropTypes.number,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isAuthenticated': PropTypes.bool.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'itemsPerPage': PropTypes.number.isRequired,
	'patternCount': PropTypes.number.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'section': PropTypes.string,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'user': PropTypes.objectOf(PropTypes.any),
	'canCreateColorBook': PropTypes.bool.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { itemsPerPage } = state.page;
	// find page number as URL query parameter, if present, in the form '/?page=1'
	let currentPageNumber = 1;
	const parsed = queryString.parse(ownProps.location.search);
	const page = parseInt(parsed.page, 10);

	if (!Number.isNaN(page)) {
		currentPageNumber = page;
	}

	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the user
		'colorBookAdded': state.colorBook.colorBookAdded,
		'canCreateColorBook': getCanCreateColorBook(state),
		'canCreatePattern': getCanCreatePattern(state),
		'currentPageNumber': currentPageNumber, // read the url parameter to find the currentPage
		'errors': state.errors,
		'filterMaxTablets': state.pattern.filterMaxTablets,
		'filterMinTablets': state.pattern.filterMinTablets,
		'isAuthenticated': getIsAuthenticated(state),
		'isLoading': state.pattern.isLoading,
		itemsPerPage,
		'pageSkip': (currentPageNumber - 1) * itemsPerPage,
		'patternCount': state.pattern.patternCount,
		'section': ownProps.match.params.section, // read the url parameter to find whether to scroll to a section
	};
}

const Tracker = withTracker((props) => {
	const {
		_id,
		dispatch,
		filterMaxTablets,
		filterMinTablets,
		itemsPerPage,
		pageSkip,
	} = props;
	const state = store.getState();
	const isLoading = getIsLoading(state);

	Meteor.subscribe('users', [_id]);
	Meteor.subscribe('colorBooks', _id);
	Meteor.subscribe('tags');

	const patterns = Patterns.find({ 'createdBy': _id }, {
		'sort': { 'nameSort': 1 },
		'limit': itemsPerPage,
	}).fetch();

	const handle = Meteor.subscribe('userPatterns', {
		filterMaxTablets,
		filterMinTablets,
		'limit': itemsPerPage,
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
		'user': Meteor.users.findOne({ _id }), // note this is undefined when subscription not ready
	};
})(User);

export default connect(mapStateToProps)(Tracker);
