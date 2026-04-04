import React, { PureComponent } from 'react';
import { Button, ButtonGroup, ButtonToolbar } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  editBorderWeavingCell,
  editBorderWeavingCellTurns,
  getIsEditingLeftBorderWeaving,
  getIsEditingRightBorderWeaving,
  getLeftBorder,
  getPalette,
  getHoles,
  getRightBorder,
  setIsEditingLeftBorderWeaving,
  setIsEditingRightBorderWeaving,
  setIsEditingWeaving,
} from '../modules/pattern';
import calculateScrolling from '../modules/calculateScrolling';
import { WeavingChartCellBase } from './WeavingChartCell';
import EditWeavingCellForm from '../forms/EditWeavingCellForm';
import './Threading.scss';
import './WeavingDesignIndividual.scss';

/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class WeavingDesignBorder extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      controlsOffsetX: 0,
      controlsOffsetY: 0,
      editMode: 'direction',
      numberOfTurns: 1,
    };

    const functionsToBind = [
      'handleClickEditMode',
      'handleClickWeavingCell',
      'handleSubmitEditWeavingCellForm',
      'toggleEditWeaving',
    ];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });

    this.weavingRef = React.createRef();
    this.controlsRef = React.createRef();
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
    window.removeEventListener('resize', this.trackScrolling);
  }

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
    const { dispatch, isEditing, pattern, side } = this.props;
    const { editMode, numberOfTurns } = this.state;

    if (!isEditing) {
      return;
    }

    if (editMode === 'direction') {
      dispatch(
        editBorderWeavingCell({
          _id: pattern._id,
          side,
          row: rowIndex,
          tablet: tabletIndex,
        }),
      );
    } else if (editMode === 'numberOfTurns') {
      dispatch(
        editBorderWeavingCellTurns({
          _id: pattern._id,
          side,
          row: rowIndex,
          tablet: tabletIndex,
          numberOfTurns: parseInt(numberOfTurns, 10),
        }),
      );
    }
  }

  handleSubmitEditWeavingCellForm(numberOfTurns) {
    this.setState({
      numberOfTurns: parseInt(numberOfTurns, 10),
    });
  }

  handleClickEditMode(event) {
    this.setState({ editMode: event.target.value });
  }

  toggleEditWeaving() {
    const { dispatch, isEditing, side } = this.props;

    if (!isEditing) {
      document.addEventListener('scroll', this.trackScrolling);
      window.addEventListener('resize', this.trackScrolling);
      setTimeout(() => this.trackScrolling(), 100);
      dispatch(setIsEditingWeaving(false));
      if (side === 'left') {
        dispatch(setIsEditingRightBorderWeaving(false));
      } else {
        dispatch(setIsEditingLeftBorderWeaving(false));
      }
    } else {
      document.removeEventListener('scroll', this.trackScrolling);
      window.removeEventListener('resize', this.trackScrolling);
    }

    this.setState({
      controlsOffsetX: 0,
      numberOfTurns: 1,
    });

    const setAction =
      side === 'left'
        ? setIsEditingLeftBorderWeaving
        : setIsEditingRightBorderWeaving;
    dispatch(setAction(!isEditing));
  }

  renderControls() {
    const { isEditing, side } = this.props;
    const label = side === 'left' ? 'left border' : 'right border';

    return (
      <div className='controls'>
        {isEditing ? (
          <Button color='primary' onClick={this.toggleEditWeaving}>
            Done
          </Button>
        ) : (
          <Button
            color='primary'
            onClick={this.toggleEditWeaving}
          >{`Edit ${label} weaving design`}</Button>
        )}
      </div>
    );
  }

  renderCell(rowIndex, tabletIndex) {
    const { border, holes, isEditing, palette } = this.props;

    const pick = border.picks[tabletIndex][rowIndex];
    const { direction, numberOfTurns, totalTurns } = pick;
    const orientation = border.orientations[tabletIndex];
    const threadingForTablet = border.threadingByTablet[tabletIndex];

    return (
      <li
        className='cell value'
        key={`border-weaving-cell-${rowIndex}-${tabletIndex}`}
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
          <WeavingChartCellBase
            direction={direction}
            holes={holes}
            numberOfTurns={numberOfTurns}
            orientation={orientation}
            palette={palette}
            tabletIndex={tabletIndex}
            threadingForTablet={threadingForTablet}
            totalTurns={totalTurns}
          />
        </span>
      </li>
    );
  }

  renderRow(rowIndex) {
    const { border, numberOfRows } = this.props;
    const numberOfTablets = border.numberOfTablets;
    const rowLabel = numberOfRows - rowIndex;

    const cells = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      cells.push(this.renderCell(rowLabel - 1, i));
    }

    return (
      <ul className='weaving-row' key={`border-row-${rowIndex}`}>
        <li className='cell label'>
          <span>{rowLabel}</span>
        </li>
        {cells}
      </ul>
    );
  }

  renderTabletLabels() {
    const { border, tabletOffset } = this.props;
    const numberOfTablets = border.numberOfTablets;

    const labels = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      labels.push(
        <li className='cell label' key={`border-tablet-label-${i}`}>
          <span>{tabletOffset + i + 1}</span>
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
        <li className='row' key={`border-weaving-row-${i}`}>
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
      { name: 'Edit turning direction', value: 'direction' },
      { name: 'Edit number of turns', value: 'numberOfTurns' },
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
    const { numberOfRows } = this.props;
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
          rowIndex={undefined}
          tabletIndex={undefined}
        />
      </div>
    );
  }

  render() {
    const { border, isEditing, pattern, side } = this.props;
    const canEdit = pattern.createdBy === Meteor.userId();

    if (!border || !border.numberOfTablets) {
      return null;
    }

    return (
      <div
        className={`weaving border-weaving border-weaving-${side} ${isEditing ? 'editing' : ''}`}
      >
        {canEdit && this.renderControls()}
        <div className='content' ref={this.weavingRef}>
          {this.renderChart()}
          {isEditing && this.renderToolbar()}
          <div className='clearing' />
        </div>
      </div>
    );
  }
}

WeavingDesignBorder.propTypes = {
  border: PropTypes.objectOf(PropTypes.any),
  dispatch: PropTypes.func.isRequired,
  holes: PropTypes.number.isRequired,
  isEditing: PropTypes.bool.isRequired,
  numberOfRows: PropTypes.number.isRequired,
  palette: PropTypes.arrayOf(PropTypes.any).isRequired,
  pattern: PropTypes.objectOf(PropTypes.any).isRequired,
  side: PropTypes.string.isRequired,
  tabletOffset: PropTypes.number,
};

WeavingDesignBorder.defaultProps = {
  border: null,
  tabletOffset: 0,
};

function mapStateToProps(state, ownProps) {
  const { side } = ownProps;
  const border = side === 'left' ? getLeftBorder(state) : getRightBorder(state);
  const isEditing =
    side === 'left'
      ? getIsEditingLeftBorderWeaving(state)
      : getIsEditingRightBorderWeaving(state);

  return {
    border,
    holes: getHoles(state),
    isEditing,
    palette: getPalette(state),
  };
}

export default connect(mapStateToProps)(WeavingDesignBorder);
