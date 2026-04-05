import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import ThreadingChartCell from './ThreadingChartCell';
import { OrientationCell } from './OrientationCell';
import {
  IncludeInTwistCell,
  IncludeInTwistButtons,
} from './IncludeInTwistCell';
import Palette from './Palette';
import AddTabletsForm from '../forms/AddTabletsForm';
import {
  addLeftBorderTablets,
  addRightBorderTablets,
  editBorderIncludeInTwist,
  editBorderOrientation,
  editBorderThreadingCell,
  getHoles,
  getIsEditingLeftBorderThreading,
  getIsEditingRightBorderThreading,
  getLeftBorder,
  getRightBorder,
  removeLeftBorderTablet,
  removeRightBorderTablet,
  setIsEditingLeftBorderThreading,
  setIsEditingRightBorderThreading,
} from '../modules/pattern';
import { clearAllEditModes } from '../modules/editingUtils';
import { DEFAULT_PALETTE_COLOR, HOLE_LABELS } from '../../modules/parameters';
import './Threading.scss';

/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

const BORDER_BUTTON_LABELS = {
  left: { add: 'Add left border', edit: 'Edit left border' },
  right: { add: 'Add right border', edit: 'Edit right border' },
};

class ThreadingBorder extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      controlsOffset: 0,
      isEditing: false,
      selectedColorIndex: DEFAULT_PALETTE_COLOR,
    };

    const functionsToBind = [
      'handleChangeIncludeInTwistCheckbox',
      'handleClickOrientation',
      'handleClickRemoveTablet',
      'handleClickThreadingCell',
      'handleSubmitAddTablets',
      'selectColor',
      'toggleEditThreading',
    ];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });

    // ref to find nodes so we can keep controls in view
    this.threadingRef = React.createRef();
    this.controlsRef = React.createRef();
  }

  selectColor(index) {
    this.setState({ selectedColorIndex: index });
  }

  componentDidUpdate(prevProps) {
    const { isEditingThisBorderThreading } = this.props;
    const { isEditing } = this.state;
    if (
      !isEditingThisBorderThreading &&
      prevProps.isEditingThisBorderThreading &&
      isEditing
    ) {
      document.removeEventListener('scroll', this.trackScrolling);
      window.removeEventListener('resize', this.trackScrolling);
      this.setState({ isEditing: false });
    }
  }

  componentWillUnmount() {
    document.removeEventListener('scroll', this.trackScrolling);
    window.removeEventListener('resize', this.trackScrolling);
  }

  // ensure the edit tools remain in view
  trackScrolling = () => {
    const threadingElm = this.threadingRef.current;

    const { x: threadingLeftOffset } = threadingElm.getBoundingClientRect();

    const compStyles = window.getComputedStyle(threadingElm);

    const threadingWidth =
      parseFloat(threadingElm.clientWidth) -
      parseFloat(compStyles.getPropertyValue('padding-left')) -
      parseFloat(compStyles.getPropertyValue('padding-right'));

    let myNode;
    [myNode] = this.controlsRef.current.getElementsByClassName('swatches');

    if (!myNode) {
      [myNode] = this.controlsRef.current.getElementsByClassName('color-books');
    }

    const controlsWidth = myNode.getBoundingClientRect().width;

    const widthDifference = threadingWidth - controlsWidth;

    if (threadingLeftOffset < 0) {
      this.setState({
        controlsOffset: Math.min(-1 * threadingLeftOffset, widthDifference),
      });
    } else {
      this.setState({
        controlsOffset: 0,
      });
    }
  };

  toggleEditThreading() {
    const { dispatch, side } = this.props;
    const { isEditing } = this.state;

    const newIsEditing = !isEditing;
    this.setState({ controlsOffset: 0, isEditing: newIsEditing });

    if (newIsEditing) {
      document.addEventListener('scroll', this.trackScrolling);
      window.addEventListener('resize', this.trackScrolling);
      setTimeout(() => this.trackScrolling(), 100); // give the controls time to render
      // Clear all other edit modes before activating this one
      clearAllEditModes(dispatch);
    } else {
      document.removeEventListener('scroll', this.trackScrolling);
      window.removeEventListener('resize', this.trackScrolling);
    }

    const setAction =
      side === 'left'
        ? setIsEditingLeftBorderThreading
        : setIsEditingRightBorderThreading;
    dispatch(setAction(newIsEditing));
  }

  handleClickThreadingCell(rowIndex, tabletIndex) {
    const { isEditing } = this.state;
    if (!isEditing) return;

    const {
      dispatch,
      pattern: { _id },
      side,
    } = this.props;
    const { selectedColorIndex } = this.state;

    dispatch(
      editBorderThreadingCell({
        _id,
        colorIndex: selectedColorIndex,
        holesToSet: [rowIndex],
        side,
        tablet: tabletIndex,
      }),
    );
  }

  handleClickOrientation(tabletIndex) {
    const { isEditing } = this.state;
    if (!isEditing) return;

    const {
      dispatch,
      pattern: { _id },
      side,
    } = this.props;

    dispatch(editBorderOrientation({ _id, side, tablet: tabletIndex }));
  }

  handleChangeIncludeInTwistCheckbox(tabletIndex) {
    const { isEditing } = this.state;
    if (!isEditing) return;

    const {
      dispatch,
      pattern: { _id },
      side,
    } = this.props;

    dispatch(editBorderIncludeInTwist({ _id, side, tablet: tabletIndex }));
  }

  handleClickRemoveTablet(tabletIndex) {
    const { isEditing } = this.state;
    if (!isEditing) return;

    const {
      dispatch,
      pattern: { _id },
      side,
    } = this.props;

    const response = confirm(
      // eslint-disable-line no-restricted-globals
      `Do you want to delete border tablet ${tabletIndex + 1}?`,
    );

    if (response === true) {
      if (side === 'left') {
        dispatch(removeLeftBorderTablet({ _id, tablet: tabletIndex }));
      } else {
        dispatch(removeRightBorderTablet({ _id, tablet: tabletIndex }));
      }
    }
  }

  handleSubmitAddTablets(data) {
    const {
      dispatch,
      pattern: { _id },
      side,
    } = this.props;
    const { selectedColorIndex } = this.state;

    const params = {
      _id,
      colorIndex: parseInt(selectedColorIndex, 10),
      insertNTablets: parseInt(data.insertNTablets, 10),
      insertTabletsAt: parseInt(data.insertTabletsAt - 1, 10),
    };

    if (side === 'left') {
      dispatch(addLeftBorderTablets(params));
    } else {
      dispatch(addRightBorderTablets(params));
    }
  }

  renderControls() {
    const { border, side } = this.props;
    const { isEditing } = this.state;
    const hasBorder = !!border?.numberOfTablets;
    const label = BORDER_BUTTON_LABELS[side][hasBorder ? 'edit' : 'add'];

    return (
      <div className='controls'>
        {isEditing ? (
          <Button color='primary' onClick={this.toggleEditThreading}>
            Done
          </Button>
        ) : (
          <Button color='primary' onClick={this.toggleEditThreading}>
            {label}
          </Button>
        )}
      </div>
    );
  }

  renderCell(rowIndex, tabletIndex) {
    const { tabletOffset } = this.props;
    const { isEditing } = this.state;

    return (
      <span
        type={isEditing ? 'button' : undefined}
        onClick={
          isEditing
            ? () => this.handleClickThreadingCell(rowIndex, tabletIndex)
            : undefined
        }
        onKeyPress={
          isEditing
            ? () => this.handleClickThreadingCell(rowIndex, tabletIndex)
            : undefined
        }
        role={isEditing ? 'button' : undefined}
        tabIndex={isEditing ? '0' : undefined}
      >
        <ThreadingChartCell
          combined
          rowIndex={rowIndex}
          tabletIndex={(tabletOffset || 0) + tabletIndex}
        />
      </span>
    );
  }

  renderRow(rowIndex) {
    const { border, holes } = this.props;
    const labelIndex = holes - rowIndex - 1;
    const { numberOfTablets } = border;

    const cells = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      cells.push(
        <li
          className='cell value'
          key={`border-threading-cell-${rowIndex}-${i}`}
        >
          {this.renderCell(rowIndex, i)}
        </li>,
      );
    }

    return (
      <ul className='threading-row'>
        <li className='cell label'>
          <span>{HOLE_LABELS[labelIndex]}</span>
        </li>
        {cells}
      </ul>
    );
  }

  renderTabletLabels() {
    const { border, tabletOffset } = this.props;
    const { numberOfTablets } = border;

    const labels = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      labels.push(
        <li className='cell label' key={`border-tablet-label-${i}`}>
          <span>{(tabletOffset || 0) + i + 1}</span>
        </li>,
      );
    }

    return <ul className='tablet-labels'>{labels}</ul>;
  }

  renderIncludeInTwistButtons() {
    const { border, tabletOffset } = this.props;
    const { isEditing } = this.state;
    const { includeInTwist, numberOfTablets } = border;

    const buttons = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      buttons.push(
        <li className='cell label' key={`border-include-in-twist-${i}`}>
          <IncludeInTwistCell
            handleChangeIncludInTwistCheckbox={
              this.handleChangeIncludeInTwistCheckbox
            }
            includeInTwistForTablet={!!(includeInTwist && includeInTwist[i])}
            isEditing={isEditing}
            tabletIndex={i}
            tabletOffset={tabletOffset || 0}
          />
        </li>,
      );
    }

    return <IncludeInTwistButtons>{buttons}</IncludeInTwistButtons>;
  }

  renderChart() {
    const { holes } = this.props;

    const rows = [];
    for (let i = 0; i < holes; i += 1) {
      rows.push(
        <li className='row' key={`border-threading-row-${i}`}>
          {this.renderRow(i)}
        </li>,
      );
    }

    return (
      <>
        {this.renderTabletLabels()}
        {this.renderIncludeInTwistButtons()}
        <div className='threading-chart-holder'>
          <ul className='threading-chart'>{rows}</ul>
        </div>
      </>
    );
  }

  renderRemoveTabletButton(tabletIndex) {
    return (
      <span
        type='button'
        onClick={() => this.handleClickRemoveTablet(tabletIndex)}
        onKeyPress={() => this.handleClickRemoveTablet(tabletIndex)}
        role='button'
        tabIndex='0'
        title={`Delete border tablet ${tabletIndex + 1}`}
      >
        X
      </span>
    );
  }

  renderRemoveTabletButtons() {
    const { border } = this.props;
    const { numberOfTablets } = border;

    const buttons = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      buttons.push(
        <li className='cell delete' key={`border-remove-tablet-${i}`}>
          {this.renderRemoveTabletButton(i)}
        </li>,
      );
    }

    return (
      <div className='remove-tablet-buttons'>
        <ul className='remove-tablet-buttons'>{buttons}</ul>
      </div>
    );
  }

  renderOrientations() {
    const { border } = this.props;
    const { isEditing } = this.state;
    const { numberOfTablets, orientations } = border;

    const cells = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      cells.push(
        <li className='cell value' key={`border-orientation-${i}`}>
          <OrientationCell
            handleClickOrientation={
              isEditing ? this.handleClickOrientation : undefined
            }
            isEditing={isEditing}
            orientation={orientations[i]}
            tabletIndex={i}
          />
        </li>,
      );
    }

    return (
      <div className='orientations'>
        <ul className='orientations'>{cells}</ul>
      </div>
    );
  }

  renderPalette() {
    const {
      colorBooks,
      pattern: { _id },
    } = this.props;
    const { selectedColorIndex } = this.state;

    return (
      <Palette
        _id={_id}
        colorBooks={colorBooks}
        elementId='border-threading-palette'
        selectColor={this.selectColor}
        initialColorIndex={selectedColorIndex}
      />
    );
  }

  render() {
    const { border, canEdit, side } = this.props;
    const { controlsOffset, isEditing } = this.state;
    const hasBorder = border?.numberOfTablets > 0;

    return (
      <div
        className={`threading border-threading ${isEditing ? 'editing' : ''}`}
      >
        {canEdit && this.renderControls()}
        <div className='content' ref={this.threadingRef}>
          {hasBorder && (
            <>
              {this.renderChart()}
              {isEditing && this.renderRemoveTabletButtons()}
              {this.renderOrientations()}
            </>
          )}
          {!hasBorder && isEditing && (
            <div className='hint'>
              <p className='hint'>{'Add tablets to create a border.'}</p>
            </div>
          )}
          <div
            ref={this.controlsRef}
            style={{
              left: `${controlsOffset}px`,
              position: 'relative',
            }}
          >
            {isEditing && (
              <AddTabletsForm
                handleSubmit={this.handleSubmitAddTablets}
                numberOfTablets={border?.numberOfTablets || 0}
              />
            )}
            {isEditing && this.renderPalette()}
          </div>
          <div className='clearing' />
        </div>
      </div>
    );
  }
}

ThreadingBorder.propTypes = {
  border: PropTypes.objectOf(PropTypes.any),
  canEdit: PropTypes.bool.isRequired,
  colorBooks: PropTypes.arrayOf(PropTypes.any),
  dispatch: PropTypes.func,
  holes: PropTypes.number.isRequired,
  isEditingThisBorderThreading: PropTypes.bool,
  pattern: PropTypes.objectOf(PropTypes.any).isRequired,
  side: PropTypes.oneOf(['left', 'right']).isRequired,
  tabletOffset: PropTypes.number,
};

function mapStateToProps(state, ownProps) {
  const { side } = ownProps;

  return {
    border: side === 'left' ? getLeftBorder(state) : getRightBorder(state),
    holes: getHoles(state),
    isEditingThisBorderThreading:
      side === 'left'
        ? getIsEditingLeftBorderThreading(state)
        : getIsEditingRightBorderThreading(state),
  };
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(
  ThreadingBorder,
);
