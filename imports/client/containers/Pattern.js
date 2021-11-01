// detail of a single pattern

import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import PropTypes from 'prop-types';
import {
	addRecentPattern,
	getCanAddPatternImage,
	getCanPublish,
} from '../modules/auth';
import { logErrors } from '../modules/errors';
import {
	editIsPublic,
	editPatternIsTwistNeutral,
	editPatternWillRepeat,
	editTextField,
	getHoleHandedness,
	getHoles,
	getIsEditing,
	getIsLoading,
	getNumberOfRows,
	getNumberOfRowsForChart,
	getNumberOfTablets,
	getPatternDesign,
	getPatternTwistSelector,
	getTotalTurnsByTabletSelector,
	savePatternData,
	setIsEditingThreading,
	setIsEditingWeaving,
	setUpdatePreviewWhileEditing,
} from '../modules/pattern';
import { editPatternImageCaption, removePatternImage } from '../modules/patternImages';
import AppContext from '../modules/appContext';
import { getNumberOfRepeats } from '../modules/weavingUtils';
import PageWrapper from '../components/PageWrapper';
import Loading from '../components/Loading';
import WeavingDesignIndividual from '../components/WeavingDesignIndividual';
import WeavingDesignAllTogether from '../components/WeavingDesignAllTogether';
import WeavingDesignBrokenTwill from '../components/WeavingDesignBrokenTwill';
import WeavingDesignDoubleFaced from '../components/WeavingDesignDoubleFaced';
import WeavingDesignFreehand from '../components/WeavingDesignFreehand';
import Weft from '../components/Weft';
import PatternPreview from '../components/PatternPreview';
import Threading from '../components/Threading';
import Notation from '../components/Notation';
import PreviewOrientation from '../components/PreviewOrientation';
import EditableText from '../components/EditableText';
import ImageUploader from '../components/ImageUploader';
import TagInput from '../components/TagInput';
import TwistCalculationHints from '../components/TwistCalculationHints';
import {
	findPatternTypeDisplayName,
	iconColors,
} from '../../modules/parameters';
import './Pattern.scss';
import './MainTabs.scss';

const bodyClass = 'pattern';

/* eslint-disable no-case-declarations */

class Pattern extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'gotUser': false, // add to recents after user has loaded
			'recentPatternId': null, // id that has been added to recent patterns list. This lets us check for navigation to a new pattern, e.g. because of copy
			'showCopyIDSuccess': false,
			'selectedPatternImage': null,
			'showBackOfBand': false,
			'showImageUploader': false,
			'showStartPosition': true,
		};

		this.idRef = React.createRef();

		// bind onClick functions to provide context
		const functionsToBind = [
			'copyPatternId',
			'copyPatternUrl',
			'onChangeIsPublic',
			'onClickEditableTextSave',
			'onClickEditCaptionSave',
			'onClickPatternImageThumbnail',
			'onCloseFlashMessage',
			'onRemovePatternImage',
			'handleChangeShowBackOfBand',
			'onToggleImageUploader',
			'handleChangeUpdatePreviewWhileEditing',
			'handleChangeShowStartPosition',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	componentDidMount() {
		const { dispatch } = this.props;

		document.body.classList.add(bodyClass);
		dispatch(setUpdatePreviewWhileEditing(true));
		dispatch(setIsEditingThreading(false));
		dispatch(setIsEditingWeaving(false));
	}

	componentDidUpdate(prevProps) {
		const {
			dispatch,
			isEditing,
			patternIsTwistNeutral,
			patternWillRepeat,
		} = this.props;
		const { gotUser, recentPatternId } = this.state;
		const { isLoadingUser, pattern, patternId } = this.context;

		// wait for user details to load
		if (!gotUser && !isLoadingUser && patternId) {
			dispatch(addRecentPattern({ patternId }));

			this.setState({
				'gotUser': true,
			});
		}

		// catch navigation to new pattern, e.g. after copy pattern
		if (gotUser && (patternId !== recentPatternId) && pattern) {
			dispatch(addRecentPattern({ patternId }));

			this.setState({
				'recentPatternId': patternId,
			});
		}

		// in case the selected image was deleted in another browser window
		if (typeof selectedPatternImage === 'string') {
			const { selectedPatternImage } = this.state;
			const { patternImages } = this.context;

			const patternImage = patternImages.find((image) => image._id === selectedPatternImage);

			if (!patternImage) {
				this.setState({
					'selectedPatternImage': null,
				});
			}
		}

		// resync with database when user starts editing
		// in case they have made changes to the pattern in another window or on another machine
		if (!prevProps.isEditing && isEditing) {
			this.setState({
				'showBackOfBand': false,
			});

			dispatch(savePatternData(pattern));
		}

		// update twist calculations
		// only attempt these updates if all data have been loaded
		// and the user owns the pattern
		if (pattern
			&& gotUser
			&& Meteor.user()
			&& Meteor.user()._id === pattern.createdBy
			&& pattern.patternType !== 'freehand') {
			const { isTwistNeutral, willRepeat } = pattern;
			// record whether pattern is twist neutral
			if ((typeof isTwistNeutral === 'undefined') // needs to be initialised
				|| (patternIsTwistNeutral !== prevProps.patternIsTwistNeutral)) {
				dispatch(editPatternIsTwistNeutral({
					'_id': patternId,
					patternIsTwistNeutral,
				}));
			}

			// record whether pattern will repeat
			if ((typeof willRepeat === 'undefined') // needs to be initialised
				|| (patternWillRepeat !== prevProps.patternWillRepeat)) {
				dispatch(editPatternWillRepeat({
					'_id': patternId,
					patternWillRepeat,
				}));
			}
		}
	}

	componentWillUnmount() {
		document.body.classList.remove(bodyClass);
	}

	onChangeIsPublic = () => {
		const { canPublish, dispatch } = this.props;
		const { 'pattern': { _id, isPublic } } = this.context;

		if (!canPublish) {
			alert('To change the privacy of patterns or colour books, please verify your email address');
		} else {
			dispatch(editIsPublic({ _id, 'isPublic': !isPublic }));
		}
	};

	handleChangeUpdatePreviewWhileEditing(event) {
		const { dispatch } = this.props;

		dispatch(setUpdatePreviewWhileEditing(event.target.checked));
	}

	handleChangeShowStartPosition(event) {
		this.setState({
			'showStartPosition': event.target.checked,
		});
	}

	handleChangeShowBackOfBand(event) {
		const { dispatch } = this.props;

		this.setState({
			'showBackOfBand': event.target.checked,
		});

		if (event.target.checked) {
			dispatch(setIsEditingThreading(false));
			dispatch(setIsEditingWeaving(false));
		}
	}

	onClickEditCaptionSave({ fieldValue }) {
		const { dispatch } = this.props;
		const { selectedPatternImage } = this.state;

		dispatch(editPatternImageCaption({ '_id': selectedPatternImage, fieldValue }));
	}

	onClickEditableTextSave({ fieldValue, fieldName }) {
		const { dispatch } = this.props;
		const { 'pattern': { _id } } = this.context;

		dispatch(editTextField({ _id, fieldValue, fieldName }));
	}

	onClickPatternImageThumbnail(_id) {
		this.setState({
			'selectedPatternImage': _id,
		});
	}

	onCloseFlashMessage() {
		this.setState({
			'showCopyIDSuccess': false,
			'showCopyUrlSuccess': false,
		});
	}

	onRemovePatternImage(event) {
		const { dispatch } = this.props;
		const patternImageId = event.target.value;
		event.stopPropagation();

		const response = confirm('Do you want to delete this image?'); // eslint-disable-line no-restricted-globals

		if (response === true) {
			dispatch(removePatternImage(patternImageId));
		}
	}

	onToggleImageUploader(event) {
		event.stopPropagation(); // don't process click on parent, it will open the file picker
		const { showImageUploader } = this.state;

		this.setState({
			'showImageUploader': !showImageUploader,
		});
	}

	async copyPatternId() {
		const { dispatch } = this.props;

		try {
			await navigator.clipboard.writeText(this.idRef.current.textContent);

			this.onCloseFlashMessage();

			this.setState({
				'showCopyIDSuccess': true,
			});
		} catch (error) {
			dispatch(logErrors({ 'copy-to-clipboard': `Error copying text to clipboard: ${error}` }));
		}
	}

	async copyPatternUrl() {
		const { dispatch } = this.props;
		const { patternId } = this.context;
		const URL = `${window.location.protocol}//${window.location.host}/pattern/${patternId}`;

		try {
			await navigator.clipboard.writeText(URL);

			this.onCloseFlashMessage();

			this.setState({
				'showCopyUrlSuccess': true,
			});
		} catch (error) {
			dispatch(logErrors({ 'copy-to-clipboard': `Error copying text to clipboard: ${error}` }));
		}
	}

	renderCopyButtons() {
		return (
			<span className="copy-buttons">
				<Button
					type="button"
					onClick={this.copyPatternId}
					className="btn btn-default"
				>
					Copy pattern ID
				</Button>
				<Button
					type="button"
					onClick={this.copyPatternUrl}
					className="btn btn-default"
				>
					Copy pattern URL
				</Button>
			</span>
		);
	}

	// title and any other elements above tabs
	renderHeader({ pattern }) {
		const {
			_id,
			createdBy,
			name,
			patternDesign,
			patternType,
		} = pattern;
		const canEdit = createdBy === Meteor.userId();

		let twillDirectionIndicator;

		if (patternType === 'brokenTwill') {
			twillDirectionIndicator = <p>Twill direction: {patternDesign.twillDirection === 'S' ? 'S-twill' : 'Z-twill'}</p>;
		}

		return (
			<>
				<div className="pattern-page-name">
					<span
						className="icon"
						style={{ 'backgroundImage': `url(${Meteor.absoluteUrl('/images/search_pattern.png')}` }}
						title={`Pattern: ${name}`}
					/>
					<EditableText
						canEdit={canEdit}
						editButtonText="Edit name"
						fieldName="name"
						onClickSave={this.onClickEditableTextSave}
						title="Name"
						type="input"
						fieldValue={name}
					/>
				</div>
				<p>Pattern type: {findPatternTypeDisplayName(patternType)}</p>
				<p>Pattern ID: <span ref={this.idRef}>{_id}</span>{this.renderCopyButtons()}</p>
				{twillDirectionIndicator}
			</>
		);
	}

	renderIsPublic() {
		const { 'pattern': { isPublic } } = this.context;

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

	renderImageUploader(patternId) {
		const { dispatch } = this.props;
		const { showImageUploader } = this.state;

		return (
			<div className="image-uploader-wrapper">
				{!showImageUploader && (
					<Button
						type="button"
						onClick={this.onToggleImageUploader}
						title="Add images"
					>
						Add images
					</Button>
				)}
				{showImageUploader && (
					<>
						<ImageUploader
							patternId={patternId}
							dispatch={dispatch}
							onClose={this.onToggleImageUploader}
						/>
					</>
				)}
			</div>
		);
	}

	renderImages({ canEdit, patternImages }) {
		const { selectedPatternImage } = this.state;

		if (typeof selectedPatternImage === 'string') {
			const patternImage = patternImages.find((image) => image._id === selectedPatternImage);

			if (!patternImage) {
				return;
			}

			const {
				caption,
				height,
				url,
				width,
			} = patternImage;

			return (
				<div className="pattern-images selected">
					<Button
						className="btn btn-secondary close-image"
						onClick={() => this.onClickPatternImageThumbnail(null)}
						title="Close"
					>
						X
					</Button>
					<div
						className="full-size"
						style={{
							'backgroundImage': `url("${url}")`,
							'maxHeight': height,
							'maxWidth': width,
						}}
					/>
					<div className="caption">
						<div className="text">
							<EditableText
								canEdit={canEdit}
								editButtonText="Edit caption"
								fieldName="caption"
								onClickSave={this.onClickEditCaptionSave}
								title="Caption"
								type="input"
								fieldValue={caption}
							/>
						</div>
					</div>
				</div>
			);
		}
		return (
			<div className="pattern-images">
				{patternImages.map((patternImage) => (
					<div
						className="thumbnail"
						key={patternImage._id}
						onClick={() => this.onClickPatternImageThumbnail(patternImage._id)}
						onKeyPress={() => this.onClickPatternImageThumbnail(patternImage._id)}
						role="button"
						style={{ 'backgroundImage': `url("${patternImage.url}")` }}
						tabIndex="0"
					>
						<div className="controls">
							{canEdit && (
								<Button
									onClick={this.onRemovePatternImage}
									title="Delete image"
									value={patternImage._id}
								>
									<FontAwesomeIcon icon={['fas', 'trash']} style={{ 'color': iconColors.contrast }} size="1x" />
								</Button>
							)}
						</div>
					</div>
				))}
			</div>
		);
	}

	renderTagInput(canEdit) {
		const { dispatch } = this.props;
		const {
			'pattern': { _id, tags },
			allTags,
		} = this.context;

		return (
			<TagInput
				allTags={allTags}
				canEdit={canEdit}
				dispatch={dispatch}
				tags={tags}
				targetId={_id}
				targetType="pattern"
			/>
		);
	}

	renderWeavingInstructions() {
		const {
			colorBooks,
			pattern,
		} = this.context;
		const {
			dispatch,
			numberOfRows,
			numberOfTablets,
			patternDesign,
		} = this.props;
		const {
			patternType,
		} = pattern;

		let weavingInstructions;

		switch (patternType) {
			case 'individual':
				weavingInstructions = (
					<>
						<h2>Weaving design</h2>
						<WeavingDesignIndividual
							dispatch={dispatch}
							numberOfRows={numberOfRows}
							numberOfTablets={numberOfTablets}
							pattern={pattern}
						/>
					</>
				);
				break;

			case 'allTogether':
				weavingInstructions = (
					<>
						<h2>Weaving design</h2>
						<WeavingDesignAllTogether
							dispatch={dispatch}
							numberOfRows={numberOfRows}
							pattern={pattern}
						/>
					</>
				);
				break;

			case 'brokenTwill':
				weavingInstructions = (
					<>
						<h2>Weaving design</h2>
						<WeavingDesignBrokenTwill
							dispatch={dispatch}
							numberOfRows={numberOfRows}
							numberOfTablets={numberOfTablets}
							pattern={pattern}
						/>
					</>
				);
				break;

			case 'doubleFaced':
				weavingInstructions = (
					<>
						<h2>Weaving design</h2>
						<WeavingDesignDoubleFaced
							dispatch={dispatch}
							numberOfRows={numberOfRows}
							numberOfTablets={numberOfTablets}
							pattern={pattern}
						/>
					</>
				);
				break;

			case 'freehand':
				weavingInstructions = (
					<>
						<h2>Weaving design</h2>
						<WeavingDesignFreehand
							colorBooks={colorBooks}
							dispatch={dispatch}
							numberOfRows={numberOfRows}
							numberOfTablets={numberOfTablets}
							pattern={pattern}
							patternDesign={patternDesign}
						/>
					</>
				);
				break;

			default:
				break;
		}

		return weavingInstructions;
	}

	renderUpdatePreviewControl() {
		const { updatePreviewWhileEditing } = this.props;

		return (
			<div className="update-preview-control custom-checkbox custom-control">
				<input
					checked={updatePreviewWhileEditing}
					type="checkbox"
					id="updatePreviewControl"
					className="custom-control-input"
					name="updatePreviewControl"
					onChange={this.handleChangeUpdatePreviewWhileEditing}
					onBlur={this.handleChangeUpdatePreviewWhileEditing}
				/>
				<label className="custom-control-label" htmlFor="updatePreviewControl">Update woven band while editing</label>
			</div>
		);
	}

	renderShowStartPositionControl() {
		const { showStartPosition } = this.state;

		return (
			<div className="show-start-position-control custom-checkbox custom-control">
				<input
					checked={showStartPosition}
					type="checkbox"
					id="updateShowStartPositionControl"
					className="custom-control-input"
					name="updateShowStartPositionControl"
					onChange={this.handleChangeShowStartPosition}
					onBlur={this.handleChangeShowStartPosition}
				/>
				<label className="custom-control-label" htmlFor="updateShowStartPositionControl">Highlight rows where all tablets are at their start position</label>
			</div>
		);
	}

	renderShowBackOfBandControl() {
		const { showBackOfBand } = this.state;

		return (
			<div className="show-back-of-band-control custom-checkbox custom-control">
				<input
					checked={showBackOfBand}
					type="checkbox"
					id="updateShowBackOfBandControl"
					className="custom-control-input"
					name="updateShowBackOfBandControl"
					onChange={this.handleChangeShowBackOfBand}
					onBlur={this.handleChangeShowBackOfBand}
				/>
				<label className="custom-control-label" htmlFor="updateShowBackOfBandControl">Show the back of the band</label>
			</div>
		);
	}

	renderPreview({
		_id,
		canEdit,
		pattern,
		previewOrientation,
		showBackOfBand,
	}) {
		const {
			dispatch,
			holes,
			isEditing,
			numberOfRowsForChart,
			numberOfTablets,
			patternWillRepeat,
			rowsAtStartPosition,
			totalTurnsByTablet,
			updatePreviewWhileEditing,
		} = this.props;
		const { showStartPosition } = this.state;

		return (
			<div className="preview-outer">
				<h2>Woven band</h2>
				{canEdit && (
					<PreviewOrientation
						_id={_id}
						disabled={(isEditing && !updatePreviewWhileEditing) ? 'disabled' : ''}
						dispatch={dispatch}
						previewOrientation={previewOrientation}
					/>
				)}
				<PatternPreview
					dispatch={dispatch}
					holes={holes}
					numberOfRows={numberOfRowsForChart}
					numberOfTablets={numberOfTablets}
					pattern={pattern}
					patternWillRepeat={patternWillRepeat}
					rowsAtStartPosition={rowsAtStartPosition}
					showBackOfBand={showBackOfBand}
					showStartPosition={showStartPosition}
					totalTurnsByTablet={totalTurnsByTablet}
				/>
			</div>
		);
	}

	renderTabContent({
		colorBooks,
		createdByUser,
		patternImages,
		pattern,
	}) {
		const { showBackOfBand } = this.state;

		const {
			canAddPatternImage,
			dispatch,
			holeHandedness,
			holes,
			isEditing,
			numberOfRows,
			numberOfTablets,
			patternIsTwistNeutral,
			patternWillRepeat,
			tab,
			updatePreviewWhileEditing,
		} = this.props;

		const {
			_id,
			createdBy,
			description,
			includeInTwist,
			patternType,
			previewOrientation,
			threadingNotes,
			weavingNotes,
		} = pattern;

		const canEdit = createdBy === Meteor.userId();

		let tabContent;

		switch (tab) {
			case 'design':
				let previewClassName = '';

				switch (previewOrientation) {
					case 'left':
						previewClassName = 'preview-left';
						break;

					case 'right':
						previewClassName = 'preview-right';
						break;

					case 'up':
						previewClassName = 'preview-up';
						break;

					default:
						break;
				}

				let previewAtSide = true;

				if (previewOrientation !== 'up') {
					previewAtSide = false;
				}

				if (patternType === 'allTogether') {
					previewAtSide = false;
				}

				tabContent = (
					<div className={`tab-content ${(isEditing && !updatePreviewWhileEditing) ? 'is-editing' : ''} ${previewClassName}`}>
						<TwistCalculationHints
							includeInTwist={includeInTwist}
							patternIsTwistNeutral={patternIsTwistNeutral}
							patternType={patternType}
							patternWillRepeat={patternWillRepeat}
							previewOrientation={previewOrientation}
							repeats={getNumberOfRepeats(numberOfRows)}
						/>
						<Weft
							colorBooks={colorBooks}
							dispatch={dispatch}
							pattern={pattern}
						/>
						{this.renderUpdatePreviewControl()}
						{includeInTwist && this.renderShowStartPositionControl()}
						{includeInTwist && holes % 2 === 0 && this.renderShowBackOfBandControl()}
						{!previewAtSide && this.renderPreview({
							_id,
							canEdit,
							pattern,
							previewOrientation,
							showBackOfBand,
						})}
						<div className="orientation-change-container">
							<div className="weaving-outer">
								{pattern.patternDesign && this.renderWeavingInstructions()}
							</div>
							{previewAtSide && this.renderPreview({
								_id,
								canEdit,
								pattern,
								previewOrientation,
								showBackOfBand,
							})}
						</div>
						<EditableText
							canEdit={canEdit}
							editButtonText="Edit weaving notes"
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
								canEdit={canEdit}
								colorBooks={colorBooks}
								dispatch={dispatch}
								holes={holes}
								numberOfTablets={numberOfTablets}
								pattern={pattern}
							/>
						)}
						<EditableText
							canEdit={canEdit}
							editButtonText="Edit threading notes"
							fieldName="threadingNotes"
							onClickSave={this.onClickEditableTextSave}
							optional={true}
							title="Threading notes"
							type="textarea"
							fieldValue={threadingNotes}
						/>
						<Notation
							_id={_id}
							dispatch={dispatch}
							holeHandedness={holeHandedness}
							patternType={patternType}
						/>
					</div>
				);
				break;

			case 'info':
				tabContent = (
					<div className="tab-content">
						<p>Created by: <Link to={`/user/${createdBy}`} className="created-by">
							{createdByUser && createdByUser.username}</Link>
						</p>
						{canEdit && this.renderIsPublic()}
						<p>Number of holes: {holes}</p>
						<p>Number of tablets: {numberOfTablets}</p>
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
						{(canEdit || patternImages.length > 0) && <h2>Images</h2>}
						{canAddPatternImage && canEdit && this.renderImageUploader(pattern._id)}
						{patternImages.length > 0 && this.renderImages({ canEdit, patternImages })}
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
			showCopyIDSuccess,
			showCopyUrlSuccess,
		} = this.state;

		const {
			colorBooks,
			createdByUser,
			patternImages,
			pattern,
		} = this.context;

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
							<li className={`info ${tab === 'info' ? 'selected' : ''}`}>
								<Link to={`/pattern/${_id}/info`}>
								Pattern info
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
							patternImages,
						})}
					</>
				);
			} else {
				content = <p>Either this pattern does not exist or you do not have permission to view it</p>;
			}
		}

		let message = null;
		const onClick = this.onCloseFlashMessage;
		let type = null;

		if (showCopyIDSuccess) {
			message = 'Pattern ID copied to clipboard';
			type = 'success';
		}

		if (showCopyUrlSuccess) {
			message = 'Pattern URL copied to clipboard';
			type = 'success';
		}

		return (
			<PageWrapper
				dispatch={dispatch}
				errors={errors}
				message={message}
				onClick={onClick}
				type={type}
			>
				{content}
			</PageWrapper>
		);
	}
}

Pattern.contextType = AppContext;

Pattern.propTypes = {
	'canAddPatternImage': PropTypes.bool.isRequired,
	'canPublish': PropTypes.bool.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'errors': PropTypes.objectOf(PropTypes.any).isRequired,
	'holeHandedness': PropTypes.string,
	'holes': PropTypes.number.isRequired,
	'isEditing': PropTypes.bool.isRequired,
	'isLoading': PropTypes.bool.isRequired,
	'numberOfRows': PropTypes.number.isRequired,
	'numberOfRowsForChart': PropTypes.number.isRequired,
	'numberOfTablets': PropTypes.number.isRequired,
	'patternDesign': PropTypes.objectOf(PropTypes.any).isRequired,
	'patternIsTwistNeutral': PropTypes.bool,
	'patternWillRepeat': PropTypes.bool,
	'rowsAtStartPosition': PropTypes.arrayOf(PropTypes.any).isRequired,
	'tab': PropTypes.string.isRequired,
	'totalTurnsByTablet': PropTypes.arrayOf(PropTypes.any).isRequired,
	'updatePreviewWhileEditing': PropTypes.bool.isRequired,
};

function mapStateToProps(state, ownProps) {
	const { patternType } = state.pattern;

	// defaults for freehand pattern
	const {
		patternIsTwistNeutral,
		patternWillRepeat,
		rowsAtStartPosition,
	} = getPatternTwistSelector(state);
	let totalTurnsByTablet = [];

	if (patternType !== 'freehand') { // all simulation patterns
		totalTurnsByTablet = getTotalTurnsByTabletSelector(state);
	}

	// pattern chart info like numberOfRows must be got from store or it may not be correct
	return {
		'canAddPatternImage': getCanAddPatternImage(state),
		'canPublish': getCanPublish(state),
		'errors': state.errors,
		'holeHandedness': getHoleHandedness(state),
		'holes': getHoles(state),
		'isEditing': getIsEditing(state),
		'isLoading': getIsLoading(state),
		'numberOfRows': getNumberOfRows(state),
		'numberOfRowsForChart': getNumberOfRowsForChart(state),
		'numberOfTablets': getNumberOfTablets(state),
		'patternDesign': getPatternDesign(state),
		patternIsTwistNeutral,
		patternWillRepeat,
		rowsAtStartPosition,
		'tab': ownProps.match.params.tab || 'design',
		totalTurnsByTablet,
		'updatePreviewWhileEditing': state.pattern.updatePreviewWhileEditing,
	};
}

export default connect(mapStateToProps)(Pattern);
