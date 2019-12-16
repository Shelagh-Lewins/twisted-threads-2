import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import EditableTextForm from '../forms/EditableTextForm';
const ReactMarkdown = require('react-markdown');

import './EditableText.scss';

class EditableText extends PureComponent {
	constructor(props) {
		super(props);

		this.state = {
			'isEditing': false,
		};

		// bind onClick functions to provide context
		const functionsToBind = [
			'onClickCancel',
			'onClickEdit',
			'onClickSave',
		];

		functionsToBind.forEach((functionName) => {
			this[functionName] = this[functionName].bind(this);
		});
	}

	onClickEdit() {
		this.setState({
			'isEditing': true,
		});
	}

	onClickCancel() {
		this.setState({
			'isEditing': false,
		});
	}

	onClickSave({ fieldValue }) {
		const { fieldName, onClickSave } = this.props;

		this.setState({
			'isEditing': false,
		});

		onClickSave({ fieldName, fieldValue });
	}

	renderControls() {
		const { isEditing } = this.state;

		return (
			<div className="controls">
				{!isEditing && <Button color="secondary" onClick={this.onClickEdit}>Edit</Button>}
			</div>
		);
	}

	renderInputType() {
		const {
			fieldValue,
		} = this.props;
		const { isEditing } = this.state;

		return (
			<>
				{!isEditing && fieldValue && <h2>{fieldValue}</h2>}
			</>
		);
	}

	renderTextAreaType() {
		const {
			canEdit,
			title,
			fieldValue,
		} = this.props;
		const { isEditing } = this.state;

		const showFieldName = (canEdit || fieldValue);

		return (
			<>
				{showFieldName && <h2>{title}</h2>}
				{!isEditing && fieldValue && (
					<div className="field-value">
						<ReactMarkdown
							source={fieldValue}
							escapeHtml={true}
						/>
					</div>
				)}
			</>
		);
	}

	renderContent() {
		const {
			canEdit,
			optional,
			title,
			type,
			fieldValue,
		} = this.props;
		const { isEditing } = this.state;

		return (
			<>
				{canEdit && this.renderControls()}
				{type === 'input' ? this.renderInputType() : this.renderTextAreaType() }
				{isEditing && (
					<>
						<EditableTextForm
							handleCancel={this.onClickCancel}
							handleSubmit={this.onClickSave}
							optional={optional}
							title={title}
							type={type}
							fieldValue={fieldValue}
						/>
						<span className="hint">You can use <a href="https://github.github.com/gfm/" target="_blank">Markdown</a> to format text. For example:
							<ul>
								<li>*italic*</li>
								<li>**bold**</li>
								<li>[a link](http://example.com)</li>
								<li>* shopping list</li>
								<li>1. numbered list.</li>
							</ul>
						</span>
					</>
				)}
			</>
		);
	}

	render() {
		const {
			type,
		} = this.props;

		return (
			<div className={`editable-text ${type}`}>
				{this.renderContent()}
				<div className="clearing" />
			</div>
		);
	}
}

EditableText.propTypes = {
	'canEdit': PropTypes.bool.isRequired,
	'fieldName': PropTypes.string.isRequired,
	'onClickSave': PropTypes.func.isRequired,
	'optional': PropTypes.bool,
	'title': PropTypes.string.isRequired,
	'type': PropTypes.string.isRequired,
	'fieldValue': PropTypes.string.isRequired,
};

export default EditableText;
