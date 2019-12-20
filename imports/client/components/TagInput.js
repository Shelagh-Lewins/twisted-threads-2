import React, { PureComponent } from 'react';
import ReactTags from 'react-tag-autocomplete';
import PropTypes from 'prop-types';
import { assignTagToPattern, addTag, removeTagFromPattern } from '../modules/tags';
import './TagInput.scss';

class TagInput extends PureComponent {
	constructor(props) {
		super(props);

		// bind onClick functions to provide context
		const functionsToBind = [
			'handleDelete',
			'handleAddition',
			'handleValidate',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	handleDelete(i) {
		const { dispatch, patternId, tags } = this.props;

		const tagId = tags[i]._id;

		dispatch(removeTagFromPattern({ patternId, tagId }));
	}

	handleAddition(tag) {
		const { dispatch, patternId } = this.props;
		const { '_id': tagId, name } = tag;

		if (tagId) {
			// user selected an existing tag
			dispatch(assignTagToPattern({ patternId, tagId }));
		} else {
			// user has entered a new tag
			dispatch(addTag({ patternId, name }));
		}
	}

	handleValidate(tag) {
		return tag.name.length >= 3;
	}

	render() {
		const { tagSuggestions, tags } = this.props;

		return (
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
				handleDelete={this.handleDelete}
				handleAddition={this.handleAddition}
				handleValidate={this.handleValidate}
			/>
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
