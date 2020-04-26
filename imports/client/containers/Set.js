import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import {
	Button,
	Col,
	Container,
	Row,
} from 'reactstrap';
import PropTypes from 'prop-types';
import store from '../modules/store';
import {
	getIsLoading,
	setIsLoading,
} from '../modules/pattern';
import { editTextField, removeSet } from '../modules/set';
import {
	PatternPreviews,
	Patterns,
	Sets,
	Tags,
} from '../../modules/collection';
import AppContext from '../modules/appContext';
import PageWrapper from '../components/PageWrapper';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PatternList from '../components/PatternList';
import EditableText from '../components/EditableText';
import TagInput from '../components/TagInput';
import secondaryPatternSubscriptions from '../modules/secondaryPatternSubscriptions';
import './Set.scss';

const bodyClass = 'set';

// Set is not paginated

class Set extends Component {
	constructor(props) {
		super(props);

		// make sure to subscribe
		global.updateTrackerSetsSubscription.set(true);
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	onClickEditableTextSave = ({ fieldValue, fieldName }) => {
		const { dispatch } = this.props;
		const { 'set': { _id } } = this.props;

		dispatch(editTextField({ _id, fieldValue, fieldName }));
	}

	handleClickButtonRemove = () => {
		const {
			dispatch,
			history,
			'set': { _id, name },
		} = this.props;

		const response = confirm(`Do you want to delete the set "${name}"?`); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removeSet(_id, history));
		}
	};

	renderTagInput(canEdit) {
		const {
			allTags,
			dispatch,
			'set': { _id, tags },
		} = this.props;

		return (
			<TagInput
				allTags={allTags}
				canEdit={canEdit}
				dispatch={dispatch}
				tags={tags}
				targetId={_id}
				targetType="set"
			/>
		);
	}

	render() {
		const {
			allTags,
			dispatch,
			errors,
			isLoading,
			patternPreviews,
			patterns,
			set,
			users,
		} = this.props;

		let content = <Loading />;

		if (!isLoading) {
			if (set) {
				const {
					createdBy,
					description,
					name,
				} = set;

				const canEdit = createdBy === Meteor.userId();
				const patternCount = patterns.length;

				content = (
					<>
						<Container>
							<Row>
								<Col lg="12">
									<EditableText
										canEdit={canEdit}
										editButtonText="Edit name"
										fieldName="name"
										onClickSave={this.onClickEditableTextSave}
										title="Name"
										type="input"
										fieldValue={name}
									/>
									{this.renderTagInput(canEdit)}
									<EditableText
										canEdit={canEdit}
										editButtonText="Edit description"
										fieldName="description"
										onClickSave={this.onClickEditableTextSave}
										optional={true}
										title="Description"
										type="textarea"
										fieldValue={description}
									/>
									<Button
										type="button"
										color="danger"
										onClick={() => this.handleClickButtonRemove()}
										title="Delete set"
									>
										Delete set
									</Button>
								</Col>
							</Row>
						</Container>
						{!isLoading && patternCount > 0 && (
							<div className="set-details">
								<PatternList
									dispatch={dispatch}
									patternPreviews={patternPreviews}
									patterns={patterns}
									tags={allTags}
									users={users}
								/>
							</div>
						)}
						{!isLoading && patternCount === 0 && (
							<Container>
								<Row>
									<Col lg="12">
										There are no patterns to display
									</Col>
								</Row>
							</Container>
						)}
					</>
				);
			} else {
				content = <p>Either this set does not exist or you do not have permission to view it</p>;
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
				>
					{content}
				</div>
			</PageWrapper>
		);
	}
}

Set.propTypes = {
	'_id': PropTypes.string.isRequired, // read the url parameter to find the id of the set
	'allTags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'history': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'patternPreviews': PropTypes.arrayOf(PropTypes.any).isRequired,
	'patterns': PropTypes.arrayOf(PropTypes.any).isRequired,
	'set': PropTypes.objectOf(PropTypes.any),
	'users': PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
	const { itemsPerPage } = state.page;
	// find page number as URL query parameter, if present, in the form '/?page=1'

	return {
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the set
		'errors': state.errors,
		'isLoading': getIsLoading(state),
		itemsPerPage,
	};
}

const Tracker = withTracker((props) => {
	const {
		_id,
		dispatch,
	} = props;
	const state = store.getState();
	const isLoading = getIsLoading(state);
//console.log('*** Tracker, id', _id);
	let set = {};
//console.log('global.updateTrackerSetsSubscription.get()', global.updateTrackerSetsSubscription.get());
	// force resubscription because setsForUser is not reactive

	//if (global.updateTrackerSetsSubscription.get() === true) {
		//console.log('start!!!');
		//global.updateTrackerSetsSubscription2.set(true);
		//if (global.setSetsSubscriptionHandle) {
			//console.log('*** handle exists');
			//global.setSetsSubscriptionHandle.stop();
		//}

	global.setSetsSubscriptionHandle = Meteor.subscribe('set', _id, {
		'onReady': () => {
			console.log('Here!!!');
			set = Sets.findOne({ _id });
			const { 'patterns': patternIds } = set;

			Meteor.subscribe('patternsById', patternIds, {
				'onReady': () => {
					global.setPatternsInSet = Patterns.find(
						{ '_id': { '$in': patternIds } },
						{ 'sort': { 'nameSort': 1 } },
					).fetch();

					secondaryPatternSubscriptions(global.setPatternsInSet);
				},
			});
		},
	});

	Meteor.subscribe('tags');

	if (global.setSetsSubscriptionHandle) {
		if (isLoading && global.setSetsSubscriptionHandle.ready()) {
			dispatch(setIsLoading(false));
		} else if (!isLoading && !global.setSetsSubscriptionHandle.ready()) {
			dispatch(setIsLoading(true));
		}
	}

	// pass database data as props
	return {
		'allTags': Tags.find().fetch(),
		'patterns': global.setPatternsInSet,
		'patternPreviews': PatternPreviews.find().fetch(),
		'set': Sets.findOne({ _id }),
		'users': Meteor.users.find().fetch(),
	};
})(Set);

export default connect(mapStateToProps)(Tracker);
