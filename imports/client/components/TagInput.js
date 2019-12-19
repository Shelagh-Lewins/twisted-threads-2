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

	render() {
		return (
			<ReactTags
				allowNew={true}
				tags={this.state.tags}
				suggestions={this.state.suggestions}
				handleDelete={this.handleDelete.bind(this)}
				handleAddition={this.handleAddition.bind(this)} />
		)
	}
}

function mapStateToProps(state, ownProps) {
	return {
		
	};
}

export default connect(mapStateToProps)(TagInput);
