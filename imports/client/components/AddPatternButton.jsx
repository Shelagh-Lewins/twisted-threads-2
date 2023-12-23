// displays either "New pattern" button
// or the Add Pattern form
import React, { PureComponent } from 'react';
import { Button, Col, Row } from 'reactstrap';
import PropTypes from 'prop-types';
import { addPattern } from '../modules/pattern';
import AddPatternForm from '../forms/AddPatternForm';

class AddPatternButton extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      showAddPatternForm: false,
    };

    // bind onClick functions to provide context
    const functionsToBind = [
      'handleCancelShowAddPatternForm',
      'handleClickShowAddPatternForm',
    ];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });
  }

  handleSubmitAddPattern = (data, { resetForm }) => {
    const { dispatch, history, updateShowAddPatternForm } = this.props;
    const modifiedData = { ...data };
    modifiedData.holes = parseInt(data.holes, 10); // select value is string

    dispatch(addPattern(modifiedData, history));
    resetForm();

    this.setState({
      showAddPatternForm: false,
    });
    updateShowAddPatternForm(false);
  };

  handleClickShowAddPatternForm() {
    const { updateShowAddPatternForm } = this.props;

    this.setState({
      showAddPatternForm: true,
    });
    updateShowAddPatternForm(true);
  }

  handleCancelShowAddPatternForm() {
    const { updateShowAddPatternForm } = this.props;

    this.setState({
      showAddPatternForm: false,
    });
    updateShowAddPatternForm(false);
  }

  render() {
    const { showAddPatternForm } = this.state;

    const addPatternButton = (
      <Row>
        <Col lg='12'>
          <Button
            className='show-add-pattern-form'
            color='primary'
            onClick={this.handleClickShowAddPatternForm}
          >
            + New pattern
          </Button>
        </Col>
      </Row>
    );

    return (
      <>
        {!showAddPatternForm && addPatternButton}
        {showAddPatternForm && (
          <Row>
            <Col lg='12'>
              <AddPatternForm
                handleCancel={this.handleCancelShowAddPatternForm}
                handleSubmit={this.handleSubmitAddPattern}
              />
            </Col>
          </Row>
        )}
      </>
    );
  }
}

AddPatternButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  updateShowAddPatternForm: PropTypes.func.isRequired,
};

export default AddPatternButton;
