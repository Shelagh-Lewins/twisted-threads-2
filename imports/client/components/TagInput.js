import React, { PureComponent } from 'react';
import { ReactTags } from 'react-tag-autocomplete';
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
    const functionsToBind = ['onDelete', 'onAddition', 'onValidate'];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });

    this.state = {
      isValid: true,
    };
  }

  onDelete(i) {
    const { dispatch, targetId, targetType, allTags, tags } = this.props;
    // Rebuild tagObjects as in render
    let tagObjects = [];
    if (allTags) {
      tags.forEach((tagNameInDocument) => {
        const thisTagObject = allTags.find(
          (tagObject) => tagNameInDocument === tagObject.name,
        );
        if (thisTagObject) {
          tagObjects.push({
            value: thisTagObject._id,
            label: thisTagObject.name,
          });
        }
      });
    }
    const tag = tagObjects[i];
    const name = tag && tag.label;

    if (!name || typeof name !== 'string') {
      // Do not dispatch if name is not a valid string
      return;
    }
    dispatch(
      removeTagFromDocument({
        name,
        targetId,
        targetType,
      }),
    );
  }

  onAddition(tag) {
    const { dispatch, targetId, targetType, allTags } = this.props;
    // react-tag-autocomplete v7.x: tag is { value, label }
    const name = tag && tag.label;

    if (!name || typeof name !== 'string') {
      // Do not dispatch if name is not a valid string
      return;
    }
    // Check if tag exists in allTags (by name)
    const existsInAllTags = allTags && allTags.some((t) => t.name === name);
    if (tag.value === undefined || !existsInAllTags) {
      dispatch(
        addTag({
          name,
          targetId,
          targetType,
        }),
      );
    } else {
      // Existing tag: assign to document
      dispatch(
        assignTagToDocument({
          name,
          targetId,
          targetType,
        }),
      );
    }
  }

  onValidate(value) {
    // value is the input string
    const isValid =
      typeof value === 'string' &&
      value.length >= MIN_TAG_LENGTH &&
      value.length <= MAX_TAG_LENGTH;
    this.setState({ isValid });
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
      // Map to react-tag-autocomplete v7 format: { value, label }
      tagSuggestions = allTags
        .filter((tag) => tags.indexOf(tag.name) === -1)
        .map((tag) => ({
          value: tag._id,
          label: tag.name,
        }));

      // build the list of tag objects from the document's array of tag names
      // so we can show tag names and access tag ids
      tags.forEach((tagNameInDocument) => {
        const thisTagObject = allTags.find(
          (tagObject) => tagNameInDocument === tagObject.name,
        );

        if (thisTagObject) {
          tagObjects.push({
            value: thisTagObject._id,
            label: thisTagObject.name,
          });
        }
      });
    }

    if (!canEdit && tags.length === 0) {
      return null;
    }

    if (!canEdit) {
      return (
        <div className='view-tags'>
          <div className='label'>Tags:</div>
          <ul>
            {tagObjects.map((tag) => (
              <li key={tag.label}>{tag.label}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Use the provided onDelete prop, which is already bound to the correct index

    // Custom tag renderer using removeButton from react-tag-autocomplete v7.x
    // Custom tag renderer: button with label and 'x', matching react-tag-autocomplete default
    const tagComponent = ({ tag, classNames, index, ...props }) => (
      <button
        type='button'
        className={classNames.selectedTag}
        title={`Remove ${tag.label} from the list`}
        aria-disabled='false'
        onClick={() => this.onDelete(index)}
        {...props}
      >
        <span className={classNames.selectedTagName}>{tag.label}</span>
        <span className='delete-tag-x' aria-hidden='true'>
          X
        </span>
      </button>
    );

    return (
      <div className='edit-tags'>
        <ReactTags
          allowNew={true}
          classNames={{
            root: 'react-tags',
            rootFocused: 'is-focused',
            selected: 'selected',
            selectedTag: 'selected-tag',
            selectedTagName: 'selected-tag-name',
            search: 'search',
            searchInput: 'search-input',
            suggestions: 'suggestions',
            suggestionActive: 'is-active',
            suggestionDisabled: 'is-disabled',
          }}
          selected={tagObjects}
          suggestions={tagSuggestions}
          onDelete={this.onDelete}
          onAdd={this.onAddition}
          onValidate={this.onValidate}
          renderTag={tagComponent}
        />
        {!isValid && (
          <div className='invalid-feedback'>{`Tags must be between ${MIN_TAG_LENGTH} and ${MAX_TAG_LENGTH} characters long`}</div>
        )}
      </div>
    );
  }
}

TagInput.propTypes = {
  allTags: PropTypes.arrayOf(PropTypes.any).isRequired,
  canEdit: PropTypes.bool.isRequired,
  dispatch: PropTypes.func.isRequired,
  tags: PropTypes.arrayOf(PropTypes.any).isRequired,
  targetId: PropTypes.string.isRequired, // id of pattern or set
  targetType: PropTypes.string.isRequired, // 'pattern', 'set'
};

export default TagInput;
