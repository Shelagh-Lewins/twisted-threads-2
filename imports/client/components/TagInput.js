import React, { PureComponent } from 'react';
import ReactTags from 'react-tag-autocomplete';
import PropTypes from 'prop-types';
import { assignTagToPattern, addTag, removeTagFromPattern } from '../modules/tags';
import { MAX_TAG_LENGTH, MIN_TAG_LENGTH } from '../../modules/parameters';
import './TagInput.scss';

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
		const { dispatch, patternId, tags } = this.props;

		const { name } = tags[i];

		dispatch(removeTagFromPattern({ patternId, name }));
	}

	onAddition(tag) {
		const { dispatch, patternId } = this.props;
		const { '_id': tagId, name } = tag;

		if (tagId) {
			// user selected an existing tag
			dispatch(assignTagToPattern({ patternId, name }));
		} else {
			// user has entered a new tag
			dispatch(addTag({ patternId, name }));
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
		const { tagSuggestions, tags } = this.props;
		const { isValid } = this.state;

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
					tags={tags}
					suggestions={tagSuggestions}
					onDelete={this.onDelete}
					onAddition={this.onAddition}
					onValidate={this.onValidate}
				/>
				{!isValid && <div className="invalid-feedback">{`Tags must be between ${MIN_TAG_LENGTH} and ${MAX_TAG_LENGTH} characters long`}</div>}
			</div>
		);
	}
}

TagInput.propTypes = {
	'tagSuggestions': PropTypes.arrayOf(PropTypes.any).isRequired,
	'dispatch': PropTypes.func.isRequired,
	'patternId': PropTypes.string.isRequired,
	'tags': PropTypes.arrayOf(PropTypes.any).isRequired,
};

export default TagInput;
