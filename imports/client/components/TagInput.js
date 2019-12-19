import React, { PureComponent } from 'react';
import ReactTags from 'react-tag-autocomplete';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './TagInput.scss';

class TagInput extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			tags: [
				{ id: 1, name: "Apples" },
				{ id: 2, name: "Pears" }
			],
			suggestions: [
				{ id: 3, name: "Bananas" },
				{ id: 4, name: "Mangos" },
				{ id: 5, name: "Lemons" },
				{ id: 6, name: "Apricots" }
			]
		}

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
		console.log('delete', i);
		const tags = this.state.tags.slice(0)
		tags.splice(i, 1)
		this.setState({ tags })
	}

	handleAddition(tag) {
		console.log('addition', tag);
		const tags = [].concat(this.state.tags, tag)
		this.setState({ tags })
	}

	handleValidate(tag) {
		console.log('validate', tag);
		return tag.name.length >= 5;
	}

	render() {
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
				tags={this.state.tags}
				suggestions={this.state.suggestions}
				handleDelete={this.handleDelete}
				handleAddition={this.handleAddition}
				handleValidate={this.handleValidate}
			/>
		);
	}
}

function mapStateToProps(state, ownProps) {
	return {
		
	};
}

export default connect(mapStateToProps)(TagInput);
