// detail of a single pattern

import React, { PureComponent } from 'react';
// import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { withTracker } from 'meteor/react-meteor-data';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { setIsLoading } from '../modules/pattern';
import { addRecentPattern } from '../modules/auth';
import { findPatternTwist, getNumberOfRepeats, getPicksByTablet } from '../modules/weavingUtils';

import { ColorBooks, Patterns } from '../../modules/collection';
import PageWrapper from '../components/PageWrapper';
import Loading from '../components/Loading';
import WeavingDesign from '../components/WeavingDesign';
import Weft from '../components/Weft';
import PatternPreview from '../components/PatternPreview';
import Threading from '../components/Threading';
import Notation from '../components/Notation';
import PreviewOrientation from '../components/PreviewOrientation';
import './Pattern.scss';

const bodyClass = 'pattern';

/* eslint-disable no-case-declarations */

class Pattern extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'gotUser': false, // add to recents after user has loaded
		};

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

	componentDidUpdate() {
		const {
			_id,
			dispatch,
		} = this.props;

		const { gotUser } = this.state;

		// wait for user details to load
		if (!gotUser && Meteor.user()) {
			dispatch(addRecentPattern({ 'patternId': _id }));
			this.setState({
				'gotUser': true,
			});
		}
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	renderTabs() {
		const {
			colorBookAdded,
			colorBooks,
			createdByUser,
			dispatch,
			pattern,
			'pattern': {
				_id,
				createdBy,
				holes,
				numberOfRows,
				patternType,
				previewOrientation,
			},
			picksByTablet,
			tab,
		} = this.props;

		const canEdit = createdBy === Meteor.userId();

		let tabContent;

		switch (tab) {
			case 'design':
				const { patternIsTwistNeutral, patternWillRepeat } = findPatternTwist(holes, picksByTablet);

				const twistNeutralText = (
					<span className="hint">{patternIsTwistNeutral ? 'The pattern is twist neutral.' : 'The pattern is not twist neutral.'}</span>
				);

				let repeatHint = 'The pattern will not repeat.';

				if (patternWillRepeat) {
					if (previewOrientation === 'up') {
						repeatHint = 'The pattern will repeat. To see repeats, set the woven band orientation to left or right.';
					} else {
						repeatHint = `The pattern will repeat (${getNumberOfRepeats(numberOfRows)} repeats shown).`;
					}
				}

				const repeatText = (
					<span className="hint">{repeatHint}</span>
				);

				tabContent = (
					<>
						<h2>Woven band</h2>
						{repeatText}
						{twistNeutralText}
						<Weft
							colorBookAdded={colorBookAdded}
							colorBooks={colorBooks}
							dispatch={dispatch}
							pattern={pattern}
						/>
						{canEdit && (
							<PreviewOrientation
								_id={_id}
								dispatch={dispatch}
								previewOrientation={previewOrientation}
							/>
						)}
						{picksByTablet && picksByTablet.length > 0 && (
							<PatternPreview
								dispatch={dispatch}
								pattern={pattern}
								patternWillRepeat={patternWillRepeat}
								picksByTablet={picksByTablet}
							/>
						)}
						<h2>Weaving chart</h2>
						{pattern.patternDesign && (
							<WeavingDesign
								dispatch={dispatch}
								pattern={pattern}
								picksByTablet={picksByTablet}
								patternWillRepeat={patternWillRepeat}
							/>
						)}
						<h2>Threading chart</h2>
						{pattern.threading && (
							<Threading
								colorBookAdded={colorBookAdded}
								colorBooks={colorBooks}
								dispatch={dispatch}
								pattern={pattern}
							/>
						)}
						<Notation />
					</>
				);
				break;

			case 'description':
				tabContent = (
					<>
						<p>{`Pattern type: ${patternType}`}</p>
						<p>{`Created by: ${createdByUser.username}`}</p>
					</>
				);
				break;

			default:
				break;
		}

		return tabContent;
	}

	render() {
		const {
			dispatch,
			errors,
			isLoading,
			pattern,
			tab,
		} = this.props;

		let content = <Loading />;

		if (!isLoading) {
			if (pattern) {
				const { _id, name } = pattern;

				const tabs = (
					<div className="main-tabs">
						<ul>
							<li className={`design ${tab === 'design' ? 'selected' : ''}`}>
								<Link to={`/pattern/${_id}/design`}>
								Pattern design
								</Link>
							</li>
							<li className={`description ${tab === 'description' ? 'selected' : ''}`}>
								<Link to={`/pattern/${_id}/description`}>
								Description
								</Link>
							</li>
						</ul>
					</div>
				);

				const links = (
					<>
						<div className="links">
							<Link className="btn btn-primary" to={`/pattern/${_id}/print-view`}>Printer-friendly pattern</Link>
							<Link className="btn btn-primary" to={`/pattern/${_id}/weaving`}>Interactive weaving chart</Link>
						</div>
					</>
				);

				content = (
					<>
						<h1>{name}</h1>
						{links}
						{tabs}
						{this.renderTabs()}
					</>
				);
			} else {
				content = <p>Either this pattern does not exist or you do not have permission to view it</p>;
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

Pattern.propTypes = {
	'_id': PropTypes.string.isRequired,
	'colorBookAdded': PropTypes.string.isRequired,
	'colorBooks': PropTypes.arrayOf(PropTypes.any).isRequired,
	'createdByUser': PropTypes.objectOf(PropTypes.any),
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'pattern': PropTypes.objectOf(PropTypes.any),
	'picksByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tab': PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'colorBookAdded': state.colorBook.colorBookAdded,
		'_id': ownProps.match.params.id, // read the url parameter to find the id of the pattern
		'isLoading': state.pattern.isLoading,
		'errors': state.errors,
		'tab': ownProps.match.params.tab || 'design',
	};
}

const Tracker = withTracker(({ _id, dispatch }) => {
	let pattern;
	let createdByUser;

	dispatch(setIsLoading(true));

	Meteor.subscribe('pattern', _id, {
		'onReady': () => {
			pattern = Patterns.findOne({ _id });

			if (pattern) {
				// if pattern exists
				const { createdBy } = pattern;

				Meteor.subscribe('users', [createdBy], {
					'onReady': () => {
						dispatch(setIsLoading(false));
						createdByUser = Meteor.users.findOne({ '_id': createdBy });
					},
				});
			} else {
				dispatch(setIsLoading(false));
			}
		},
	});

	Meteor.subscribe('colorBooks');

	// pass database data as props
	return {
		'colorBooks': ColorBooks.find({}, {
			'sort': { 'nameSort': 1 },
		}).fetch(),
		'createdByUser': createdByUser,
		'pattern': pattern,
		'picksByTablet': getPicksByTablet(pattern || {}),
	};
})(Pattern);

export default connect(mapStateToProps)(Tracker);
