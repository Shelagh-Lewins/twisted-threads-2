import React, { PureComponent } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  addLeftBorderTablets,
  addRightBorderTablets,
  addTablets,
  editBorderIncludeInTwist,
  editBorderOrientation,
  editBorderThreadingCell,
  editIncludeInTwist,
  editOrientation,
  editThreadingCell,
  getHoles,
  getIsEditingLeftBorderThreading,
  getIsEditingRightBorderThreading,
  getLeftBorder,
  getRightBorder,
  removeLeftBorderTablet,
  removeRightBorderTablet,
  removeTablet,
  setIsEditingLeftBorderThreading,
  setIsEditingRightBorderThreading,
  setIsEditingThreading,
} from '../modules/pattern';
import { clearAllEditModes } from '../modules/editingUtils';
import InfoButton from './InfoButton';
import ThreadingChartCell from './ThreadingChartCell';
import {
  IncludeInTwistCell,
  IncludeInTwistButtons,
} from './IncludeInTwistCell';
import { OrientationCell } from './OrientationCell';
import AddTabletsForm from '../forms/AddTabletsForm';
import './Threading.scss';
import {
  DEFAULT_PALETTE_COLOR,
  HOLE_LABELS,
  MAX_BORDER_TABLETS,
  MAX_TABLETS,
} from '../../modules/parameters';
import Palette from './Palette';
import VerticalGuides from './VerticalGuides';

const ORIENTATION_INFO_TEXT =
  'The sloping line below each tablet shows you how to orient that tablet. The slope of the tablet when viewed from above should match the slope of the line.';
const ORIENTATION_INFO_TITLE = 'Click to learn about tablet orientations';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the threading cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class Threading extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      controlsOffset: 0,
      isEditing: false,
      selectedColorIndex: DEFAULT_PALETTE_COLOR,
    };

    // bind onClick functions to provide context
    const functionsToBind = [
      'handleChangeIncludInTwistCheckbox',
      'handleClickOrientation',
      'handleClickRemoveTablet',
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

  componentDidUpdate(prevProps) {
    const { isEditingThisSection } = this.props;
    const { isEditing } = this.state;
    if (!isEditingThisSection && prevProps.isEditingThisSection && isEditing) {
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

    // find the containing element's applied styles
    const compStyles = window.getComputedStyle(threadingElm);

    const threadingWidth =
      parseFloat(threadingElm.clientWidth) -
      parseFloat(compStyles.getPropertyValue('padding-left')) -
      parseFloat(compStyles.getPropertyValue('padding-right'));

    // usually we can get the palette width from swatches
    let myNode;
    [myNode] = this.controlsRef.current.getElementsByClassName('swatches');

    // but the swatches are hidden when editing color book colors
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

  selectColor(index) {
    this.setState({
      selectedColorIndex: index,
    });
  }

  handleClickRemoveTablet(tabletIndex) {
    const { onRemoveTablet, tabletOffset } = this.props;
    const { isEditing } = this.state;

    if (!isEditing) {
      return;
    }

    const displayNumber = (tabletOffset || 0) + tabletIndex + 1;
    const response = confirm(`Do you want to delete tablet ${displayNumber}?`); // eslint-disable-line no-restricted-globals

    if (response === true) {
      onRemoveTablet({ tablet: tabletIndex });

      setTimeout(() => this.trackScrolling(), 100); // give the change time to render
    }
  }

  handleSubmitAddTablets(data) {
    const {
      onAddTablets,
      pattern: { _id },
    } = this.props;
    const { selectedColorIndex } = this.state;

    onAddTablets({
      _id,
      insertNTablets: parseInt(data.insertNTablets, 10),
      insertTabletsAt: parseInt(data.insertTabletsAt - 1, 10),
      colorIndex: parseInt(selectedColorIndex, 10),
    });

    setTimeout(() => this.trackScrolling(), 100); // give the change time to render
  }

  handleClickThreadingCell(rowIndex, tabletIndex) {
    const { isEditing } = this.state;

    if (!isEditing) {
      return;
    }

    const {
      onEditThreadingCell,
      pattern: { _id },
    } = this.props;
    const { selectedColorIndex } = this.state;

    onEditThreadingCell({
      _id,
      hole: rowIndex,
      tablet: tabletIndex,
      colorIndex: selectedColorIndex,
    });
  }

  handleChangeIncludInTwistCheckbox(tabletIndex) {
    const {
      onChangeIncludeInTwist,
      pattern: { _id },
    } = this.props;
    const { isEditing } = this.state;

    if (!isEditing) {
      return;
    }

    onChangeIncludeInTwist({
      _id,
      tablet: tabletIndex,
    });
  }

  handleClickOrientation(tabletIndex) {
    const {
      onChangeOrientation,
      pattern: { _id },
    } = this.props;
    const { isEditing } = this.state;

    if (!isEditing) {
      return;
    }

    onChangeOrientation({
      _id,
      tablet: tabletIndex,
    });
  }

  toggleEditThreading() {
    const { dispatch, onToggleEdit } = this.props;
    const { isEditing } = this.state;
    const newIsEditing = !isEditing;

    this.setState({
      controlsOffset: 0,
      isEditing: newIsEditing,
    });

    if (newIsEditing) {
      document.addEventListener('scroll', this.trackScrolling);
      window.addEventListener('resize', this.trackScrolling);
      setTimeout(() => this.trackScrolling(), 100); // give the controls time to render
      clearAllEditModes(dispatch);
    } else {
      document.removeEventListener('scroll', this.trackScrolling);
      window.removeEventListener('resize', this.trackScrolling);
    }

    onToggleEdit(newIsEditing);
  }

  renderControls() {
    const { controlsLabel } = this.props;
    const { isEditing } = this.state;

    return (
      <div className='controls'>
        {isEditing ? (
          <Button color='primary' onClick={this.toggleEditThreading}>
            Done
          </Button>
        ) : (
          <Button color='primary' onClick={this.toggleEditThreading}>
            {controlsLabel}
          </Button>
        )}
      </div>
    );
  }

  renderCell(rowIndex, selectedRow, tabletIndex) {
    const { side, tabletOffset } = this.props;
    const { isEditing } = this.state;

    // All cells use absolute combined tablet index so ThreadingChartCell reads
    // from the correct slice of state via resolveCombinedTablet.
    // tabletOffset is leftBorderNumberOfTablets for the main pattern, so that
    // resolveCombinedTablet correctly skips past border tablets.
    const effectiveTabletIndex = (tabletOffset || 0) + tabletIndex;

    return (
      <span
        type={isEditing ? 'button' : undefined}
        onClick={
          isEditing
            ? () => this.handleClickThreadingCell(rowIndex, tabletIndex)
            : undefined
        }
        role={isEditing ? 'button' : undefined}
        tabIndex={isEditing ? '0' : undefined}
      >
        <ThreadingChartCell
          rowIndex={rowIndex}
          selectedRow={selectedRow}
          tabletIndex={effectiveTabletIndex}
        />
      </span>
    );
  }

  renderRow(rowIndex) {
    const { holes, numberOfTablets, selectedRow, side } = this.props;
    const labelIndex = holes - rowIndex - 1;

    const cells = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      cells.push(
        <li className='cell value' key={`threading-cell-${rowIndex}-${i}`}>
          {this.renderCell(rowIndex, selectedRow, i)}
        </li>,
      );
    }

    return (
      <>
        <ul className='threading-row'>
          <li className='cell label'>
            <span>{HOLE_LABELS[labelIndex]}</span>
          </li>
          {cells}
          {!side && <VerticalGuides numberOfTablets={numberOfTablets} />}
        </ul>
      </>
    );
  }

  renderIncludeInTwistCalculationsButton(tabletIndex) {
    const { includeInTwist, tabletOffset } = this.props;
    const { isEditing } = this.state;

    return (
      <IncludeInTwistCell
        handleChangeIncludInTwistCheckbox={
          this.handleChangeIncludInTwistCheckbox
        }
        includeInTwistForTablet={
          !!(includeInTwist && includeInTwist[tabletIndex])
        }
        isEditing={isEditing}
        tabletIndex={tabletIndex}
        tabletOffset={tabletOffset || 0}
      />
    );
  }

  renderIncludeInTwistCalculationsButtons() {
    const { includeInTwist, numberOfTablets } = this.props;

    if (!includeInTwist) {
      return;
    }

    const buttons = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      buttons.push(
        <li className='cell label' key={`include-in-twist-${i}`}>
          {this.renderIncludeInTwistCalculationsButton(i)}
        </li>,
      );
    }

    return <IncludeInTwistButtons>{buttons}</IncludeInTwistButtons>;
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
    const { holes } = this.props;
    const rows = [];
    for (let i = 0; i < holes; i += 1) {
      rows.push(
        <li className='row' key={`threading-row-${i}`}>
          {this.renderRow(i)}
        </li>,
      );
    }

    return (
      <>
        {this.renderTabletLabels()}
        {this.renderIncludeInTwistCalculationsButtons()}
        <div className='threading-chart-holder'>
          <ul className='threading-chart'>{rows}</ul>
        </div>
      </>
    );
  }

  renderRemoveTabletButton(tabletIndex) {
    const { tabletOffset } = this.props;
    const displayNumber = (tabletOffset || 0) + tabletIndex + 1;

    return (
      <span
        type='button'
        onClick={() => this.handleClickRemoveTablet(tabletIndex)}
        role='button'
        tabIndex='0'
        title={`Delete tablet ${displayNumber}`}
      >
        X
      </span>
    );
  }

  renderRemoveTabletButtons() {
    const { numberOfTablets, side } = this.props;
    const buttons = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      buttons.push(
        <li className='cell delete' key={`remove-tablet-${i}`}>
          {this.renderRemoveTabletButton(i)}
        </li>,
      );
    }

    return (
      <div className='remove-tablet-buttons'>
        <ul className='remove-tablet-buttons'>{buttons}</ul>
        {!side && (
          <p className='hint'>
            Slope of line = angle of tablet viewed from above
          </p>
        )}
      </div>
    );
  }

  renderOrientation(tabletIndex) {
    const { canChangeOrientation, orientations } = this.props;
    const { isEditing } = this.state;

    return (
      <OrientationCell
        handleClickOrientation={
          canChangeOrientation ? this.handleClickOrientation : undefined
        }
        isEditing={isEditing}
        orientation={orientations?.[tabletIndex]}
        tabletIndex={tabletIndex}
      />
    );
  }

  renderOrientations() {
    const { numberOfTablets } = this.props;
    const orientations = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      orientations.push(
        <li className='cell value' key={`orientation-${i}`}>
          {this.renderOrientation(i)}
        </li>,
      );
    }

    return (
      <div className='orientations'>
        <div className='orientation-info-button'>
          <InfoButton
            message={ORIENTATION_INFO_TEXT}
            title={ORIENTATION_INFO_TITLE}
          />
        </div>
        <ul className='orientations'>{orientations}</ul>
      </div>
    );
  }

  renderToolbar() {
    const { maxTablets, numberOfTablets } = this.props;

    return (
      <AddTabletsForm
        handleSubmit={this.handleSubmitAddTablets}
        maxTablets={maxTablets}
        numberOfTablets={numberOfTablets}
      />
    );
  }

  renderPalette() {
    const {
      colorBooks,
      paletteElementId,
      pattern: { _id },
    } = this.props;
    const { selectedColorIndex } = this.state;

    return (
      <Palette
        _id={_id}
        colorBooks={colorBooks}
        elementId={paletteElementId}
        selectColor={this.selectColor}
        initialColorIndex={selectedColorIndex}
      />
    );
  }

  render() {
    const { canEdit, numberOfTablets, side } = this.props;
    const { controlsOffset, isEditing } = this.state;
    const hasBorder = side && numberOfTablets > 0;
    const showChart = !side || hasBorder;

    return (
      <div
        className={`threading${side ? ' border-threading' : ''}${
          isEditing ? ' editing' : ''
        }`}
      >
        {canEdit && this.renderControls()}
        <div className='content' ref={this.threadingRef}>
          {showChart && this.renderChart()}
          {showChart && isEditing && this.renderRemoveTabletButtons()}
          {showChart && this.renderOrientations()}
          {side && !hasBorder && isEditing && (
            <div className='hint'>
              <p>{'Add tablets to create a border.'}</p>
            </div>
          )}
          <div
            ref={this.controlsRef}
            style={{
              left: `${controlsOffset}px`,
              position: 'relative',
            }}
          >
            {isEditing && this.renderToolbar()}
            {isEditing && this.renderPalette()}
          </div>
          <div className='clearing' />
        </div>
      </div>
    );
  }
}

Threading.propTypes = {
  canChangeOrientation: PropTypes.bool,
  canEdit: PropTypes.bool.isRequired,
  colorBooks: PropTypes.arrayOf(PropTypes.any),
  controlsLabel: PropTypes.string,
  dispatch: PropTypes.func,
  holes: PropTypes.number.isRequired,
  includeInTwist: PropTypes.arrayOf(PropTypes.any),
  isEditingThisSection: PropTypes.bool,
  maxTablets: PropTypes.number,
  numberOfTablets: PropTypes.number.isRequired,
  onAddTablets: PropTypes.func,
  onChangeIncludeInTwist: PropTypes.func,
  onChangeOrientation: PropTypes.func,
  onEditThreadingCell: PropTypes.func,
  onRemoveTablet: PropTypes.func,
  onToggleEdit: PropTypes.func,
  orientations: PropTypes.arrayOf(PropTypes.any),
  paletteElementId: PropTypes.string,
  pattern: PropTypes.objectOf(PropTypes.any).isRequired,
  selectedRow: PropTypes.number,
  side: PropTypes.oneOf(['left', 'right']),
  tabletOffset: PropTypes.number,
};

function mapStateToProps(state, ownProps) {
  const { side } = ownProps;

  if (side) {
    const border =
      side === 'left' ? getLeftBorder(state) : getRightBorder(state);
    return {
      holes: getHoles(state),
      includeInTwist: border?.includeInTwist,
      isEditingThisSection:
        side === 'left'
          ? getIsEditingLeftBorderThreading(state)
          : getIsEditingRightBorderThreading(state),
      numberOfTablets: border?.numberOfTablets || 0,
      orientations: border?.orientations,
    };
  }

  return {
    includeInTwist: state.pattern.includeInTwist,
    isEditingThisSection: state.pattern.isEditingThreading,
    orientations: state.pattern.orientations,
  };
}

function mergeProps(stateProps, { dispatch }, ownProps) {
  const {
    side,
    pattern: { _id, patternType },
  } = ownProps;

  const buttonTexts = {
    left: {
      add: 'Add left border',
      edit: 'Edit left border',
    },
    right: {
      add: 'Add right border',
      edit: 'Edit right border',
    },
  };

  if (side) {
    const hasBorder = stateProps.numberOfTablets > 0; // does the border already exist?

    return {
      ...ownProps,
      ...stateProps,
      dispatch,
      canChangeOrientation: true,
      controlsLabel: hasBorder ? buttonTexts[side].edit : buttonTexts[side].add,
      maxTablets: MAX_BORDER_TABLETS,
      paletteElementId: `border-threading-palette-${side}`,
      onAddTablets: (params) =>
        dispatch(
          side === 'left'
            ? addLeftBorderTablets(params)
            : addRightBorderTablets(params),
        ),
      onChangeIncludeInTwist: ({ _id: id, tablet }) =>
        dispatch(editBorderIncludeInTwist({ _id: id, side, tablet })),
      onChangeOrientation: ({ _id: id, tablet }) =>
        dispatch(editBorderOrientation({ _id: id, side, tablet })),
      onEditThreadingCell: ({ _id: id, colorIndex, hole, tablet }) =>
        dispatch(
          editBorderThreadingCell({
            _id: id,
            colorIndex,
            holesToSet: [hole],
            side,
            tablet,
          }),
        ),
      onRemoveTablet: ({ tablet }) =>
        dispatch(
          side === 'left'
            ? removeLeftBorderTablet({ _id, tablet })
            : removeRightBorderTablet({ _id, tablet }),
        ),
      onToggleEdit: (isEditing) =>
        dispatch(
          side === 'left'
            ? setIsEditingLeftBorderThreading(isEditing)
            : setIsEditingRightBorderThreading(isEditing),
        ),
    };
  }

  // double faced and twill patterns do not allow orientation to be changed
  // double faced and twill patterns allow borders
  // although these are currently the same, they may diverge in future so we have separate checks below

  return {
    ...ownProps,
    ...stateProps,
    dispatch,
    canChangeOrientation:
      patternType !== 'brokenTwill' && patternType !== 'doubleFaced',
    controlsLabel:
      patternType === 'brokenTwill' || patternType === 'doubleFaced'
        ? 'Edit main chart'
        : 'Edit threading chart',
    maxTablets: MAX_TABLETS,
    paletteElementId: 'threading-palette',
    onAddTablets: (params) => dispatch(addTablets(params)),
    onChangeIncludeInTwist: ({ _id: id, tablet }) =>
      dispatch(editIncludeInTwist({ _id: id, tablet })),
    onChangeOrientation: ({ _id: id, tablet }) =>
      dispatch(editOrientation({ _id: id, tablet })),
    onEditThreadingCell: ({ _id: id, colorIndex, hole, tablet }) =>
      dispatch(editThreadingCell({ _id: id, hole, tablet, colorIndex })),
    onRemoveTablet: ({ tablet }) => dispatch(removeTablet({ _id, tablet })),
    onToggleEdit: (isEditing) => dispatch(setIsEditingThreading(isEditing)),
  };
}

export default connect(mapStateToProps, null, mergeProps, { forwardRef: true })(
  Threading,
);
