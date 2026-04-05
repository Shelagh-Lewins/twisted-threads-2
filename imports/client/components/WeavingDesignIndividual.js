import React, { PureComponent } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  addWeavingRows,
  editBorderWeavingCell,
  editBorderWeavingCellTurns,
  editWeavingCellDirection,
  editWeavingCellNumberOfTurns,
  getLeftBorder,
  getRightBorder,
  removeWeavingRows,
  setIsEditingLeftBorderWeaving,
  setIsEditingRightBorderWeaving,
  setIsEditingWeaving,
} from '../modules/pattern';
import { clearAllEditModes } from '../modules/editingUtils';
import calculateScrolling from '../modules/calculateScrolling';
import WeavingChartCell from './WeavingChartCell';
import AddRowsForm from '../forms/AddRowsForm';
import EditWeavingCellForm from '../forms/EditWeavingCellForm';
import './Threading.scss';
import './WeavingDesignIndividual.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class WeavingDesignIndividual extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      controlsOffsetX: 0,
      controlsOffsetY: 0,
      editMode: 'direction',
      isEditing: false,
      numberOfTurns: 1,
    };

    // bind onClick functions to provide context
    const functionsToBind = [
      'handleClickEditMode',
      'handleClickRemoveRow',
      'handleClickWeavingCell',
      'handleSubmitAddRows',
      'handleSubmitEditWeavingCellForm',
      'toggleEditWeaving',
    ];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });

    // ref to find nodes so we can keep controls in view
    this.weavingRef = React.createRef();
    this.controlsRef = React.createRef();
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
    window.removeEventListener('resize', this.trackScrolling);
  }

  // ensure the edit tools remain in view
  trackScrolling = () => {
    const { controlsOffsetX, controlsOffsetY } = calculateScrolling({
      controlsElm: this.controlsRef.current,
      weavingElm: this.weavingRef.current,
    });

    this.setState({
      controlsOffsetX,
      controlsOffsetY,
    });
  };

  handleClickWeavingCell(rowIndex, tabletIndex) {
    const { onEditWeavingCell } = this.props;
    const { isEditing, editMode, numberOfTurns } = this.state;

    if (!isEditing) {
      return;
    }

    onEditWeavingCell({
      row: rowIndex,
      tablet: tabletIndex,
      editMode,
      numberOfTurns: parseInt(numberOfTurns, 10),
    });
  }

  handleClickRemoveRow(rowIndex) {
    const {
      dispatch,
      pattern: { _id },
    } = this.props;
    const { isEditing } = this.state;

    if (!isEditing) {
      return;
    }

    const response = confirm(`Do you want to delete row ${rowIndex + 1}?`); // eslint-disable-line no-restricted-globals

    if (response === true) {
      dispatch(
        removeWeavingRows({
          _id,
          removeNRows: 1,
          removeRowsAt: rowIndex,
        }),
      );
      setTimeout(() => this.trackScrolling(), 100); // give time for the deleted rows to be removed
    }
  }

  handleSubmitAddRows(data) {
    const {
      dispatch,
      pattern: { _id },
    } = this.props;

    dispatch(
      addWeavingRows({
        _id,
        insertNRows: parseInt(data.insertNRows, 10),
        insertRowsAt: parseInt(data.insertRowsAt - 1, 10),
      }),
    );

    setTimeout(() => this.trackScrolling(), 100); // give the new rows time to render
  }

  handleSubmitEditWeavingCellForm(numberOfTurns) {
    this.setState({
      numberOfTurns: parseInt(numberOfTurns, 10),
    });
  }

  handleClickEditMode(event) {
    const newEditMode = event.target.value;

    this.setState({
      editMode: newEditMode,
    });
  }

  toggleEditWeaving() {
    const { dispatch, onToggleEdit } = this.props;
    const { isEditing } = this.state;

    if (!isEditing) {
      document.addEventListener('scroll', this.trackScrolling);
      window.addEventListener('resize', this.trackScrolling);
      setTimeout(() => this.trackScrolling(), 100); // give the controls time to render
      clearAllEditModes(dispatch);
    } else {
      document.removeEventListener('scroll', this.trackScrolling);
      window.removeEventListener('resize', this.trackScrolling);
    }

    this.setState({
      controlsOffsetX: 0,
      controlsOffsetY: 0,
      isEditing: !isEditing,
      numberOfTurns: 1,
    });

    onToggleEdit(!isEditing);
  }

  renderControls() {
    const { controlsLabel, hasBorder } = this.props;
    const { isEditing } = this.state;

    return (
      <div className='controls'>
        {isEditing ? (
          <Button color='primary' onClick={this.toggleEditWeaving}>
            Done
          </Button>
        ) : (
          <Button
            color='primary'
            disabled={!hasBorder}
            onClick={this.toggleEditWeaving}
            title={
              !hasBorder
                ? 'Add border tablets in the threading chart first'
                : undefined
            }
          >
            {controlsLabel}
          </Button>
        )}
      </div>
    );
  }

  renderCell(rowIndex, tabletIndex) {
    const { side, tabletOffset } = this.props;
    const { isEditing } = this.state;

    return (
      <li
        className='cell value'
        key={`weaving-cell-${rowIndex}-${tabletIndex}`}
      >
        <span
          type={isEditing ? 'button' : undefined}
          onClick={
            isEditing
              ? () => this.handleClickWeavingCell(rowIndex, tabletIndex)
              : undefined
          }
          onKeyPress={
            isEditing
              ? () => this.handleClickWeavingCell(rowIndex, tabletIndex)
              : undefined
          }
          role={isEditing ? 'button' : undefined}
          tabIndex={isEditing ? '0' : undefined}
        >
          <WeavingChartCell
            combined={!!side}
            rowIndex={rowIndex}
            tabletIndex={side ? (tabletOffset || 0) + tabletIndex : tabletIndex}
          />
        </span>
      </li>
    );
  }

  renderRow(rowIndex) {
    const { canAddRemoveRows, numberOfRows, numberOfTablets } = this.props;
    const { isEditing } = this.state;
    const rowLabel = numberOfRows - rowIndex;

    const cells = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      cells.push(this.renderCell(rowLabel - 1, i));
    }

    return (
      <>
        <ul className='weaving-row'>
          <li className='cell label'>
            <span>{rowLabel}</span>
          </li>
          {cells}
          {canAddRemoveRows && isEditing && numberOfRows > 1 && (
            <li className='cell delete'>
              <span
                title={`delete row ${rowLabel}`}
                type='button'
                onClick={() => this.handleClickRemoveRow(rowLabel - 1)}
                onKeyPress={() => this.handleClickRemoveRow(rowLabel - 1)}
                role='button'
                tabIndex='0'
              >
                X
              </span>
            </li>
          )}
        </ul>
      </>
    );
  }

  renderTabletLabels() {
    const { numberOfTablets, tabletOffset } = this.props;

    const labels = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      labels.push(
        <li className='cell label' key={`tablet-label-${i}`}>
          <span>{(tabletOffset || 0) + i + 1}</span>
        </li>,
      );
    }

    return <ul className='tablet-labels'>{labels}</ul>;
  }

  renderChart() {
    const { numberOfRows } = this.props;

    const rows = [];
    for (let i = 0; i < numberOfRows; i += 1) {
      rows.push(
        <li className='row' key={`weaving-row-${i}`}>
          {this.renderRow(i)}
        </li>,
      );
    }

    return (
      <>
        {this.renderTabletLabels()}
        <ul className='weaving-chart'>{rows}</ul>
      </>
    );
  }

  renderEditOptions() {
    const { editMode } = this.state;
    const options = [
      {
        name: 'Edit turning direction',
        value: 'direction',
      },
      {
        name: 'Edit number of turns',
        value: 'numberOfTurns',
      },
    ];

    return (
      <ButtonToolbar>
        <ButtonGroup className='edit-mode segmented'>
          {options.map((option) => (
            <Button
              className={editMode === option.value ? 'selected' : ''}
              color='secondary'
              key={option.value}
              onClick={this.handleClickEditMode}
              value={option.value}
            >
              {option.name}
            </Button>
          ))}
        </ButtonGroup>
      </ButtonToolbar>
    );
  }

  renderToolbar() {
    const { canAddRemoveRows, numberOfRows } = this.props;
    const { controlsOffsetX, controlsOffsetY, editMode, numberOfTurns } =
      this.state;

    return (
      <div
        className={`weaving-toolbar ${controlsOffsetY > 0 ? 'scrolling' : ''}`}
        ref={this.controlsRef}
        style={{
          left: `${controlsOffsetX}px`,
          bottom: `${controlsOffsetY}px`,
          position: 'relative',
        }}
      >
        {this.renderEditOptions()}
        <EditWeavingCellForm
          canEdit={editMode === 'numberOfTurns'}
          handleSubmit={this.handleSubmitEditWeavingCellForm}
          numberOfTurns={numberOfTurns}
        />
        {canAddRemoveRows && (
          <AddRowsForm
            enableReinitialize={true}
            handleSubmit={this.handleSubmitAddRows}
            numberOfRows={numberOfRows}
          />
        )}
      </div>
    );
  }

  render() {
    const {
      cssClass,
      hasBorder,
      pattern: { createdBy },
      side,
    } = this.props;
    const { isEditing } = this.state;
    const canEdit = createdBy === Meteor.userId();
    const showChart = !side || hasBorder;

    return (
      <div className={`${cssClass}${isEditing ? ' editing' : ''}`}>
        {canEdit && this.renderControls()}
        {showChart && (
          <div className='content' ref={this.weavingRef}>
            {this.renderChart()}
            {isEditing && this.renderToolbar()}
            <div className='clearing' />
          </div>
        )}
      </div>
    );
  }
}

WeavingDesignIndividual.propTypes = {
  canAddRemoveRows: PropTypes.bool.isRequired,
  controlsLabel: PropTypes.string.isRequired,
  cssClass: PropTypes.string.isRequired,
  dispatch: PropTypes.func.isRequired,
  hasBorder: PropTypes.bool.isRequired,
  numberOfRows: PropTypes.number.isRequired,
  numberOfTablets: PropTypes.number.isRequired,
  onEditWeavingCell: PropTypes.func.isRequired,
  onToggleEdit: PropTypes.func.isRequired,
  pattern: PropTypes.objectOf(PropTypes.any).isRequired,
  side: PropTypes.oneOf(['left', 'right']),
  tabletOffset: PropTypes.number,
};

function mapStateToProps(state, ownProps) {
  const { side } = ownProps;

  if (side) {
    const border =
      side === 'left' ? getLeftBorder(state) : getRightBorder(state);
    return {
      hasBorder: !!border?.numberOfTablets,
      numberOfTablets: border?.numberOfTablets || 0,
    };
  }

  return {};
}

function mergeProps(stateProps, { dispatch }, ownProps) {
  const {
    side,
    pattern: { _id },
    numberOfTablets: ownNumberOfTablets,
  } = ownProps;

  if (side) {
    return {
      ...ownProps,
      ...stateProps,
      dispatch,
      canAddRemoveRows: false,
      controlsLabel: `Edit ${side} border`,
      cssClass: `weaving border-weaving border-weaving-${side}`,
      onEditWeavingCell: ({ row, tablet, editMode, numberOfTurns }) => {
        if (editMode === 'direction') {
          dispatch(editBorderWeavingCell({ _id, side, row, tablet }));
        } else if (editMode === 'numberOfTurns') {
          dispatch(
            editBorderWeavingCellTurns({
              _id,
              side,
              row,
              tablet,
              numberOfTurns,
            }),
          );
        }
      },
      onToggleEdit: (isEditing) =>
        dispatch(
          side === 'left'
            ? setIsEditingLeftBorderWeaving(isEditing)
            : setIsEditingRightBorderWeaving(isEditing),
        ),
    };
  }

  return {
    ...ownProps,
    ...stateProps,
    dispatch,
    canAddRemoveRows: true,
    controlsLabel: 'Edit weaving design',
    cssClass: 'weaving',
    hasBorder: true,
    numberOfTablets: ownNumberOfTablets,
    onEditWeavingCell: ({ row, tablet, editMode, numberOfTurns }) => {
      if (editMode === 'direction') {
        dispatch(editWeavingCellDirection({ _id, row, tablet }));
      } else if (editMode === 'numberOfTurns') {
        dispatch(
          editWeavingCellNumberOfTurns({ _id, row, tablet, numberOfTurns }),
        );
      }
    },
    onToggleEdit: (isEditing) => dispatch(setIsEditingWeaving(isEditing)),
  };
}

export default connect(mapStateToProps, null, mergeProps, { forwardRef: true })(
  WeavingDesignIndividual,
);
