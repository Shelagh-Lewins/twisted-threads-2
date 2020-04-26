import React, { PureComponent } from 'react';
import ReactTags from 'react-tag-autocomplete';
import PropTypes from 'prop-types';
import {
	assignTagToDocument,
	addTag,
	removeTagFromDocument,
} from '../modules/tags';
import { MAX_TAG_LENGTH, MIN_TAG_LENGTH } from '../../modules/parameters';
import './TagInput.scss';

// Tags can be assigned to patterns or sets

class TagInput extends PureComponent {
	constructor(props) {
		super(props);

		// bind onClick functions to provide context
		const functionsToBind = [
			'onDelete',
			'onAddition',
			'onValidate',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});

		this.state = {
			'isValid': true,
		};
	}

	onDelete(i) {
		const {
			dispatch,
			tags,
			targetId,
			targetType,
		} = this.props;

		const name = tags[i];

		dispatch(removeTagFromDocument({
			name,
			targetId,
			targetType,
		}));
	}

	onAddition(tag) {
		const {
			dispatch,
			targetId,
			targetType,
		} = this.props;

		const { '_id': tagId, name } = tag;

		if (tagId) {
			// user selected an existing tag
			dispatch(assignTagToDocument({
				name,
				targetId,
				targetType,
			}));
		} else {
			// user has entered a new tag
			dispatch(addTag({
				name,
				targetId,
				targetType,
			}));
		}
	}

	onValidate(tag) { // eslint-disable-line class-methods-use-this
		const isValid = tag.name.length >= MIN_TAG_LENGTH && tag.name.length <= MAX_TAG_LENGTH;

		this.setState({
			isValid,
		});

		return isValid;
	}

	render() {
		const {
			allTags,
			canEdit,
			tags, // array of tag ids assigned to the document
		} = this.props;

		const { isValid } = this.state;

		// build the list of suggested tags
		// only suggest tags that are not already assigned to the document
		const tagObjects = [];
		let tagSuggestions = [];

		if (allTags) {
			tagSuggestions = allTags.filter((tag) => tags.indexOf(tag.name) === -1);

			// build the list of tag objects from the document's array of tag ids
			// so we can show tag names and access tag itds
			tags.forEach((tagNameInDocument) => {
				const thisTagObject = allTags.find((tagObject) => tagNameInDocument === tagObject.name);

				if (thisTagObject) {
					tagObjects.push(thisTagObject);
				}
			});
		}

		if (!canEdit) {
			return (
				<div className="view-tags">
					<div className="label">Tags:</div>
					<ul>
						{tagObjects.map((tag) => <li key={tag.name}>{tag.name}</li>)}
					</ul>
				</div>
			);
		}

		const tagComponent = ({ tag, onDelete }) => (
			<div className="selected-tag">{tag.name}
				<button
					onClick={onDelete}
					title="Delete tag"
					type="button"
				>
					x
				</button>
			</div>
		);

		return (
			<div className="edit-tags">
				<ReactTags
					allowNew={true}
					classNames={{
						'root': 'react-tags',
						'rootFocused': 'is-focused',
						'selected': 'selected',
						'selectedTag': 'selected-tag',
						'selectedTagName': 'selected-tag-name',
						'search': 'search',
						'searchInput': 'search-input',
						'suggestions': 'suggestions',
						'suggestionActive': 'is-active',
						'suggestionDisabled': 'is-disabled',
					}}
					tags={tagObjects}
					suggestions={tagSuggestions}
					onDelete={this.onDelete}
					onAddition={this.onAddition}
					onValidate={this.onValidate}
					tagComponent={tagComponent}
				/>
				{!isValid && <div className="invalid-feedback">{`Tags must be between ${MIN_TAG_LENGTH} and ${MAX_TAG_LENGTH} characters long`}</div>}
			</div>
		);
	}
}

TagInput.propTypes = {
	'allTags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'canEdit': PropTypes.bool.isRequired,
	'dispatch': PropTypes.func.isRequired,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
	'targetId': PropTypes.string.isRequired, // id of pattern or set
	'targetType': PropTypes.string.isRequired, // 'pattern', 'set'
};

export default TagInput;
