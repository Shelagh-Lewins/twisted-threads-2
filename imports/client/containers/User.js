// detail of a single user

import React, { PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Col, Container, Row } from 'reactstrap';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import store from '../modules/store';
import {
	getIsLoading,
	setIsLoading,
	updatePatternCountUserId,
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
	Sets,
	Tags,
} from '../../modules/collection';
import {
	getCanCreateColorBook,
	getCanCreatePattern,
	getIsAuthenticated,
	editTextField,
} from '../modules/auth';
import secondaryPatternSubscriptions from '../modules/secondaryPatternSubscriptions';

import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PatternFilterForm from '../forms/PatternFilterForm';
import PaginatedList from '../components/PaginatedList';
import PatternList from '../components/PatternList';
import PageWrapper from '../components/PageWrapper';
import ColorBookSummary from '../components/ColorBookSummary';
import AddColorBookForm from '../forms/AddColorBookForm';
import AddPatternButton from '../components/AddPatternButton';
import EditableText from '../components/EditableText';
import SetSummary from '../components/SetSummary';

import getUserpicStyle from '../modules/getUserpicStyle';

import './User.scss';
import './MainTabs.scss';
import '../components/Userpic.scss';
import queryString from 'query-string';

const bodyClass = 'user';

class User extends PureComponent {
	constructor(props) {
		super(props);

		const { _id, dispatch } = props;

		this.state = {
			gotUser: false,
			isEditingColorBook: false,
			selectedColorBook: null,
			showAddColorBookForm: false,
			showAddPatternForm: false,
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

		dispatch(updatePatternCountUserId(_id));
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentDidUpdate(prevProps) {
		const { _id, colorBookAdded, dispatch, user } = this.props;
		const { gotUser, isLoading } = this.state;

		// wait for user details to load
		if (!gotUser && !isLoading && user) {
			this.setState({
				gotUser: true,
			});
		}

		if (gotUser && _id !== prevProps._id) {
			dispatch(updatePatternCountUserId(_id));
		}

		// automatically select a new color book
		if (prevProps.colorBookAdded === '' && colorBookAdded !== '') {
			this.setState({
				// eslint-disable-line react/no-did-update-set-state
				selectedColorBook: colorBookAdded,
			});
		}
	}

	componentWillUnmount() {
		const { dispatch } = this.props;
		document.body.classList.remove(bodyClass);
		dispatch(updatePatternCountUserId());
	}

	onChangeColorBookIsPublic = ({ _id, isPublic }) => {
		const { dispatch } = this.props;

		dispatch(editIsPublic({ _id, isPublic }));
	};

	onClickEditableTextSave({ fieldValue, fieldName }) {
		const {
			dispatch,
			user: { _id },
		} = this.props;

		dispatch(editTextField({ _id, fieldValue, fieldName }));
	}

	handleClickButtonRemoveColorBook = ({ _id, name }) => {
		const { dispatch } = this.props;

		const response = confirm(
			`Do you want to delete the colour book "${name}"?`
		); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeColorBook(_id));
		}
	};

	handleClickButtonCopy = ({ _id }) => {
		const { colorBooks, dispatch, history } = this.props;
		const thisColorBook = colorBooks.find((colorBook) => colorBook._id === _id);

		if (thisColorBook) {
			const response = confirm(
				`Do you want to make a copy of the color book "${thisColorBook.name}"?`
			); // eslint-disable-line no-restricted-globals

			if (response === true) {
				dispatch(copyColorBook(_id, history));
			}
		}
	};

	handleEditColorBook = (isEditingColorBook) => {
		this.setState({
			isEditingColorBook,
		});
	};

	// show the form to add a new color book
	handleClickAddColorBookButton() {
		this.setState({
			showAddColorBookForm: true,
		});
	}

	// actually add a new color book
	handleClickAddColorBook({ colors, name }) {
		const { dispatch } = this.props;

		dispatch(addColorBook({ colors, name }));
		this.setState({
			showAddColorBookForm: false,
		});
	}

	// hide the add color book form and take no action
	cancelAddColorBook() {
		this.setState({
			showAddColorBookForm: false,
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
			selectedColorBook: newColorBook,
		});
	}

	updateShowAddPatternForm(showForm) {
		this.setState({
			showAddPatternForm: showForm,
		});
	}

	renderColorBooks() {
		const {
			canCreateColorBook,
			colorBookAdded,
			colorBooks,
			dispatch,
			isAuthenticated,
			user: { _id },
		} = this.props;
		const { isEditingColorBook, selectedColorBook, showAddColorBookForm } =
			this.state;

		const canCreate = canCreateColorBook && Meteor.userId() === _id;

		const addButton = (
			<Button
				className='add'
				color='primary'
				onClick={this.handleClickAddColorBookButton}
				title='Add color book'
			>
				+ New colour book
			</Button>
		);

		return (
			<>
				<Row>
					<Col lg='12'>
						{canCreate && (
							<div className='add-controls'>
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
						<Col
							md='12'
							className='color-books-user'
						>
							{colorBooks.length > 0 &&
								colorBooks.map((colorBook) => (
									<ColorBookSummary
										canCreateColorBook={canCreateColorBook}
										colorBook={colorBook}
										colorBookAdded={colorBookAdded}
										dispatch={dispatch}
										handleClickButtonCopy={this.handleClickButtonCopy}
										handleClickButtonRemove={
											this.handleClickButtonRemoveColorBook
										}
										handleClickButtonSelect={this.handleClickSelectColorBook}
										handleEditColorBook={this.handleEditColorBook}
										isAuthenticated={isAuthenticated}
										isEditingColorBook={isEditingColorBook}
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
						<PatternFilterForm />
						<PaginatedList
							currentPageNumber={currentPageNumber}
							dispatch={dispatch}
							handlePaginationUpdate={() => {}}
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
			user: { _id, description },
		} = this.props;
		const canEdit = _id === Meteor.userId();

		if (_id !== Meteor.userId()) {
			if (!description) {
				return <p>This user has not yet created a profile</p>;
			}
		}

		return (
			<EditableText
				canEdit={canEdit}
				editButtonText='Edit description'
				fieldName='description'
				onClickSave={this.onClickEditableTextSave}
				optional={true}
				title='Profile'
				type='textarea'
				fieldValue={description}
			/>
		);
	}

	renderTabs() {
		const {
			tab,
			user: { _id },
		} = this.props;

		return (
			<Container className='main-tabs'>
				<ul>
					<li className={`profile ${tab === 'profile' ? 'selected' : ''}`}>
						<Link to={`/user/${_id}/profile`}>Profile</Link>
					</li>
					<li className={`sets ${tab === 'sets' ? 'selected' : ''}`}>
						<Link to={`/user/${_id}/sets`}>Sets</Link>
					</li>
					<li className={`patterns ${tab === 'patterns' ? 'selected' : ''}`}>
						<Link to={`/user/${_id}/patterns`}>Patterns</Link>
					</li>
					<li
						className={`colorbooks ${tab === 'colorbooks' ? 'selected' : ''}`}
					>
						<Link to={`/user/${_id}/colorbooks`}>Colour books</Link>
					</li>
				</ul>
			</Container>
		);
	}

	renderProfileTab() {
		return <Container>{this.renderDescription()}</Container>;
	}

	renderPatternsTab() {
		const { canCreatePattern, dispatch, history, user } = this.props;

		const { _id } = user;
		const canCreate = canCreatePattern && Meteor.userId() === _id;

		return (
			<>
				<Container>
					{canCreate && (
						<AddPatternButton
							dispatch={dispatch}
							history={history}
							updateShowAddPatternForm={this.updateShowAddPatternForm}
						/>
					)}
				</Container>
				<Container className='pattern-list-holder'>
					{this.renderPatternsList()}
				</Container>
			</>
		);
	}

	renderColorBooksTab() {
		return <Container>{this.renderColorBooks()}</Container>;
	}

	renderSetsTab() {
		const { dispatch, isLoading, patternsInSets, patternPreviews, sets, user } =
			this.props;

		return (
			<>
				{!isLoading && (!sets || sets.length > 0) && (
					<div className='sets-list'>
						{sets &&
							sets.map((set) => {
								// find the patterns in this set
								// note that patternsInSets only includes patterns the user can see
								// any private patterns they did not create, are excluded
								const patternsInThisSet = [];

								set.patterns.forEach((patternId) => {
									const visiblePattern = patternsInSets.find(
										(pattern) => patternId === pattern._id
									);
									if (visiblePattern) {
										patternsInThisSet.push(visiblePattern);
									}
								});

								return (
									<div key={`set-summary-${set._id}`}>
										<SetSummary
											dispatch={dispatch}
											patternPreviews={patternPreviews}
											patterns={patternsInThisSet}
											set={set}
											user={user}
										/>
									</div>
								);
							})}
					</div>
				)}
				{!isLoading && (!sets || sets.length === 0) && (
					<>
						<Container>
							<Row>
								<Col>
									<div className='empty'>There are no sets to display.</div>
									{user._id === Meteor.userId() && (
										<div className='empty'>
											To create a new set, find a pattern and click the
											&apos;+&apos; button to open the &apos;Add to set&apos;
											panel.
										</div>
									)}
								</Col>
							</Row>
						</Container>
					</>
				)}
			</>
		);
	}

	renderTabContent() {
		const { tab } = this.props;

		let tabContent;

		switch (tab) {
			case 'profile':
				tabContent = this.renderProfileTab();
				break;

			case 'patterns':
				tabContent = this.renderPatternsTab();
				break;

			case 'colorbooks':
				tabContent = this.renderColorBooksTab();
				break;

			case 'sets':
				tabContent = this.renderSetsTab();
				break;

			default:
				tabContent = this.renderPatternsTab();
				break;
		}

		return <div className='tab-content'>{tabContent}</div>;
	}

	render() {
		const { dispatch, errors, isLoading, user } = this.props;

		let content = <Loading />;

		if (!isLoading) {
			if (user) {
				const { _id, username } = user;

				content = (
					<>
						<Container>
							<h1>
								<span
									className={`${getUserpicStyle(_id)} icon`}
									style={{
										backgroundImage: `url(${Meteor.absoluteUrl(
											'/images/user_profile.png'
										)}`,
									}}
								/>
								{username}
							</h1>
						</Container>
						{this.renderTabs()}
						{this.renderTabContent()}
					</>
				);
			} else {
				content = (
					<p>
						Either this user does not exist or you do not have permission to
						view their details
					</p>
				);
			}
		}

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
			>
				<MainMenu />
				<div className='menu-selected-area'>{content}</div>
			</PageWrapper>
		);
	}
}

User.propTypes = {
	_id: PropTypes.string.isRequired,
	canCreatePattern: PropTypes.bool.isRequired,
	colorBookAdded: PropTypes.string.isRequired,
	colorBooks: PropTypes.arrayOf(PropTypes.any).isRequired,
	currentPageNumber: PropTypes.number,
	dispatch: PropTypes.func.isRequired,
	errors: PropTypes.objectOf(PropTypes.any).isRequired,
	// eslint doesn't realise the filters are used in Tracker
	filterIsTwistNeutral: PropTypes.bool,
	filterMaxTablets: PropTypes.number,
	filterMinTablets: PropTypes.number,
	filterWillRepeat: PropTypes.bool,
	history: PropTypes.objectOf(PropTypes.any).isRequired,
	isAuthenticated: PropTypes.bool.isRequired,
	isLoading: PropTypes.bool.isRequired,
	itemsPerPage: PropTypes.number.isRequired,
	patternCount: PropTypes.number.isRequired,
	patternPreviews: PropTypes.arrayOf(PropTypes.any).isRequired,
	patterns: PropTypes.arrayOf(PropTypes.any).isRequired,
	patternsInSets: PropTypes.arrayOf(PropTypes.any).isRequired,
	sets: PropTypes.arrayOf(PropTypes.any).isRequired,
	tab: PropTypes.string.isRequired,
	tags: PropTypes.arrayOf(PropTypes.any).isRequired,
	user: PropTypes.objectOf(PropTypes.any),
	canCreateColorBook: PropTypes.bool.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { itemsPerPage } = state.page;
	// find page number as URL query parameter, if present, in the form '/?page=1'
	let currentPageNumber = 1;
	const parsed = queryString.parse(ownProps.location.search);
	const page = parseInt(parsed.page, 10);

	if (!Number.isNaN(page) && page > 0) {
		currentPageNumber = page;
	}

	const {
		filterIsTwistNeutral,
		filterMaxTablets,
		filterMinTablets,
		filterWillRepeat,
	} = state.pattern;

	return {
		_id: ownProps.match.params.id, // read the url parameter to find the id of the user
		colorBookAdded: state.colorBook.colorBookAdded,
		canCreateColorBook: getCanCreateColorBook(state),
		canCreatePattern: getCanCreatePattern(state),
		currentPageNumber, // read the url parameter to find the currentPage
		errors: state.errors,
		filterIsTwistNeutral,
		filterMaxTablets,
		filterMinTablets,
		filterWillRepeat,
		isAuthenticated: getIsAuthenticated(state),
		isLoading: state.pattern.isLoading,
		itemsPerPage,
		pageSkip: (currentPageNumber - 1) * itemsPerPage,
		patternCount: state.pattern.patternCount,
		tab: ownProps.match.params.tab || 'profile', // read the url parameter to choose the tab
	};
}

const Tracker = withTracker((props) => {
	const {
		_id,
		dispatch,
		filterIsTwistNeutral,
		filterMaxTablets,
		filterMinTablets,
		filterWillRepeat,
		itemsPerPage,
		pageSkip,
		tab,
	} = props;
	const state = store.getState();
	const isLoading = getIsLoading(state);

	Meteor.subscribe('users', [_id]);
	Meteor.subscribe('colorBooks', _id);
	Meteor.subscribe('tags');

	let handle;
	let patterns = [];
	let sets = [];
	let patternsInSetsIds = [];
	let patternsInSets = [];

	switch (tab) {
		case 'sets':
			// patterns contained in this user's visible sets
			sets = Sets.find(
				{ createdBy: _id },
				{
					sort: { nameSort: 1 },
				}
			).fetch();

			patternsInSetsIds = Array.from(
				new Set(
					sets.reduce(
						(patternIdsArray, set) => patternIdsArray.concat(set.patterns),
						[]
					)
				)
			);

			patternsInSets = Patterns.find(
				{ _id: { $in: patternsInSetsIds } },
				{ sort: { nameSort: 1 } }
			).fetch();

			handle = Meteor.subscribe('setsForUser', _id, {
				onReady: () => {
					Meteor.subscribe('patternsById', patternsInSetsIds, {
						onReady: () => {
							secondaryPatternSubscriptions(patternsInSets);
						},
					});
				},
			});
			break;

		case 'patterns':
			// stopping the 'sets' pattern subscription does not remove those patterns from minimongo - I can't work out why not; the pattern previews are removed, but not the patterns. So pagesData is a hack to differentiate the 'Patterns' tab paginated data from the 'Sets' tab pattern names and preview.

			// patterns created by user
			patterns = Patterns.find(
				{ createdBy: _id, pagesData: true },
				{
					sort: { nameSort: 1 },
					limit: itemsPerPage,
				}
			).fetch();

			handle = Meteor.subscribe(
				'userPatterns',
				{
					filterIsTwistNeutral,
					filterMaxTablets,
					filterMinTablets,
					filterWillRepeat,
					limit: itemsPerPage,
					skip: pageSkip,
					userId: _id,
				},
				{
					onReady: () => {
						const patternIds = patterns.map((pattern) => pattern._id);

						Meteor.subscribe('patternPreviews', { patternIds }, _id);
					},
				}
			);
			break;

		default:
			break;
	}

	// setTimeout prevents warning:
	// Warning: Cannot update a component (`ConnectFunction`) while rendering a different component (`ForwardRef`)
	if (handle) {
		if (isLoading && handle.ready()) {
			setTimeout(() => {
				dispatch(setIsLoading(false));
			}, 1);
		} else if (!isLoading && !handle.ready()) {
			setTimeout(() => {
				dispatch(setIsLoading(true));
			}, 1);
		}
	} else if (isLoading) {
		setTimeout(() => {
			dispatch(setIsLoading(false));
		}, 1);
	}

	// pass database data as props
	return {
		colorBooks: ColorBooks.find(
			{ createdBy: _id },
			{
				sort: { nameSort: 1 },
			}
		).fetch(),
		patterns,
		patternsInSets,
		patternPreviews: PatternPreviews.find().fetch(),
		sets,
		tags: Tags.find().fetch(),
		user: Meteor.users.findOne({ _id }), // note this is undefined when subscription not ready
	};
})(User);

export default connect(mapStateToProps)(Tracker);
