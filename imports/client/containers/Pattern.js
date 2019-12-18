// detail of a single pattern

import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import { addRecentPattern } from '../modules/auth';
import { editIsPublic, editTextField } from '../modules/pattern';
import AppContext from '../modules/appContext';
import { findPatternTwist, getNumberOfRepeats, getPicksByTablet } from '../modules/weavingUtils';
import PageWrapper from '../components/PageWrapper';
import Loading from '../components/Loading';
import WeavingDesign from '../components/WeavingDesign';
import Weft from '../components/Weft';
import PatternPreview from '../components/PatternPreview';
import Threading from '../components/Threading';
import Notation from '../components/Notation';
import PreviewOrientation from '../components/PreviewOrientation';
import EditableText from '../components/EditableText';
import DropzoneUploader from '../components/DropzoneUploader';
import ImageUploader from '../components/ImageUploader';
// import '../../modules/slingshot';
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
			'onChangeIsPublic',
			'onClickEditableTextSave',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		document.body.classList.add(bodyClass);
	}

	componentDidUpdate() {
		const { dispatch } = this.props;
		const { gotUser } = this.state;
		const { patternId } = this.context;

		// wait for user details to load
		if (!gotUser && Meteor.user() && patternId) {
			dispatch(addRecentPattern({ patternId }));

			this.setState({
				'gotUser': true,
			});
		}
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	onClickEditableTextSave({ fieldValue, fieldName }) {
		const { dispatch } = this.props;
		const { patternId } = this.context;

		dispatch(editTextField({ '_id': patternId, fieldValue, fieldName }));
	}

	onChangeIsPublic = () => {
		const { dispatch } = this.props;
		const { pattern } = this.context;
		const { _id, isPublic } = pattern;

		dispatch(editIsPublic({ _id, 'isPublic': !isPublic }));
	};

	// title and any other elements above tabs
	renderHeader({ pattern }) {
		const { createdBy, name } = pattern;
		const canEdit = createdBy === Meteor.userId();

		return (
			<EditableText
				canEdit={canEdit}
				fieldName="name"
				onClickSave={this.onClickEditableTextSave}
				title="Name"
				type="input"
				fieldValue={name}
			/>
		);
	}

	renderIsPublic() {
		const { pattern } = this.context;
		const { isPublic } = pattern;

		const hintText = isPublic
			? 'Public: people can see this pattern but they can\'t edit it.'
			: 'Private: nobody else can see this pattern.';

		const buttonText = isPublic
			? 'Make pattern private'
			: 'Make pattern public';

		return (
			<>
				<div className="pattern-is-public">
					<Button
						type="button"
						onClick={this.onChangeIsPublic}
						className="btn btn-default"
					>
						{buttonText}
					</Button>
					<span className="text"><p>{hintText}</p></span>
				</div>
				<div className="clearing" />
			</>
		);
	}

	renderTabContent({
		colorBooks,
		createdByUser,
		pattern,
		picksByTablet,
	}) {
		const {
			colorBookAdded,
			dispatch,
			tab,
		} = this.props;

		const {
			_id,
			createdBy,
			description,
			holes,
			numberOfRows,
			numberOfTablets,
			patternType,
			previewOrientation,
			threadingNotes,
			weavingNotes,
		} = pattern;

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
					<div className="tab-content">
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
						<EditableText
							canEdit={canEdit}
							fieldName="weavingNotes"
							onClickSave={this.onClickEditableTextSave}
							optional={true}
							title="Weaving notes"
							type="textarea"
							fieldValue={weavingNotes}
						/>
						<h2>Threading chart</h2>
						{pattern.threading && (
							<Threading
								colorBookAdded={colorBookAdded}
								colorBooks={colorBooks}
								dispatch={dispatch}
								pattern={pattern}
							/>
						)}
						<EditableText
							canEdit={canEdit}
							fieldName="threadingNotes"
							onClickSave={this.onClickEditableTextSave}
							optional={true}
							title="Threading notes"
							type="textarea"
							fieldValue={threadingNotes}
						/>
						<Notation />
					</div>
				);
				break;

			case 'description':
				tabContent = (
					<div className="tab-content">
						<p>{`Pattern type: ${patternType}`}</p>
						<p>Created by: <Link to={`/user/${createdBy}`} className="created-by">
						{createdByUser.username}</Link>
						</p>
						{canEdit && this.renderIsPublic()}
						<p>Number of tablets: {numberOfTablets}</p>
						<EditableText
							canEdit={canEdit}
							fieldName="description"
							onClickSave={this.onClickEditableTextSave}
							optional={true}
							title="Description"
							type="textarea"
							fieldValue={description}
						/>
						<h2>Images</h2>
						{/* <DropzoneUploader
							patternId={pattern._id}
						/> */}
						<ImageUploader
							patternId={pattern._id}
							dispatch={dispatch}
						/>
					</div>
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
			tab,
		} = this.props;

		const {
			colorBooks,
			createdByUser,
			pattern,
		} = this.context;

		const picksByTablet = getPicksByTablet(pattern || {});

		let content = <Loading />;

		if (!isLoading) {
			if (pattern) {
				const { _id } = pattern;

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
						{this.renderHeader({ pattern })}
						{links}
						{tabs}
						{this.renderTabContent({
							colorBooks,
							createdByUser,
							pattern,
							picksByTablet,
						})}
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

Pattern.contextType = AppContext;

Pattern.propTypes = {
	'colorBookAdded': PropTypes.string.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'tab': PropTypes.string.isRequired,
};

function mapStateToProps(state, ownProps) {
	return {
		'colorBookAdded': state.colorBook.colorBookAdded,
		'isLoading': state.pattern.isLoading,
		'errors': state.errors,
		'tab': ownProps.match.params.tab || 'design',
	};
}

export default connect(mapStateToProps)(Pattern);
