import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import EditableTextForm from '../forms/EditableTextForm';
import './EditableText.scss';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

class EditableText extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
    };

    // bind onClick functions to provide context
    const functionsToBind = ['onClickCancel', 'onClickEdit', 'onClickSave'];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });
  }

  onClickEdit() {
    this.setState({
      isEditing: true,
    });
  }

  onClickCancel() {
    this.setState({
      isEditing: false,
    });
  }

  onClickSave({ fieldValue }) {
    const { fieldName, onClickSave } = this.props;

    this.setState({
      isEditing: false,
    });

    onClickSave({ fieldName, fieldValue });
  }

  renderControls() {
    const { editButtonText } = this.props;
    const { isEditing } = this.state;

    return (
      <div className='controls'>
        {!isEditing && (
          <Button color='primary' onClick={this.onClickEdit}>
            {editButtonText || 'Edit'}
          </Button>
        )}
      </div>
    );
  }

  renderInputType() {
    const { fieldValue } = this.props;
    const { isEditing } = this.state;

    return <>{!isEditing && fieldValue && <h2>{fieldValue}</h2>}</>;
  }

  renderTextAreaType() {
    const { canEdit, title, fieldValue } = this.props;
    const { isEditing } = this.state;
    const showFieldName = canEdit || fieldValue;

    return (
      <>
        {showFieldName && <h2>{title}</h2>}
        {!isEditing && fieldValue && (
          <div className='field-value'>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(marked(fieldValue || '')),
              }}
            />
          </div>
        )}
      </>
    );
  }

  renderContent() {
    const { canEdit, editButtonText, optional, title, type, fieldValue } =
      this.props;
    const { isEditing } = this.state;

    return (
      <>
        {type === 'input' ? this.renderInputType() : this.renderTextAreaType()}
        {isEditing && (
          <>
            <EditableTextForm
              editButtonText={editButtonText}
              handleCancel={this.onClickCancel}
              handleSubmit={this.onClickSave}
              optional={optional}
              title={title}
              type={type}
              fieldValue={fieldValue}
            />
            {type === 'textarea' && (
              <>
                <span className='hint'>
                  You can use{' '}
                  <a
                    href='https://github.github.com/gfm/'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    Markdown
                  </a>{' '}
                  to format text. For example:
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
        )}
        {canEdit && this.renderControls()}
      </>
    );
  }

  render() {
    const { type } = this.props;

    return (
      <div className={`editable-text ${type}`}>{this.renderContent()}</div>
    );
  }
}

EditableText.propTypes = {
  canEdit: PropTypes.bool.isRequired,
  editButtonText: PropTypes.string,
  fieldName: PropTypes.string.isRequired,
  onClickSave: PropTypes.func.isRequired,
  optional: PropTypes.bool,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  fieldValue: PropTypes.string,
};

export default EditableText;
