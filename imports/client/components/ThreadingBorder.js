import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { Button } from 'reactstrap';
import PropTypes from 'prop-types';
import ChartSVG from './ChartSVG';
import Palette from './Palette';
import AddBorderTabletsForm from '../forms/AddBorderTabletsForm';
import {
  addLeftBorderTablets,
  addRightBorderTablets,
  editBorderIncludeInTwist,
  editBorderOrientation,
  editBorderThreadingCell,
  getHoles,
  getLeftBorder,
  getPalette,
  getRightBorder,
  removeLeftBorderTablet,
  removeRightBorderTablet,
  setIsEditingLeftBorderThreading,
  setIsEditingRightBorderThreading,
} from '../modules/pattern';
import {
  DEFAULT_PALETTE_COLOR,
  HOLE_LABELS,
} from '../../modules/parameters';
import './Threading.scss';

/* eslint-disable react/no-array-index-key */
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

class ThreadingBorder extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      isEditing: false,
      selectedColorIndex: DEFAULT_PALETTE_COLOR,
    };

    const functionsToBind = [
      'handleClickOrientation',
      'handleClickRemoveTablet',
      'handleClickThreadingCell',
      'handleChangeIncludeInTwistCheckbox',
      'handleSubmitAddTablets',
      'selectColor',
      'toggleEditThreading',
    ];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });
  }

  selectColor(index) {
    this.setState({ selectedColorIndex: index });
  }

  toggleEditThreading() {
    const { dispatch, side } = this.props;
    const { isEditing } = this.state;

    const newIsEditing = !isEditing;
    this.setState({ isEditing: newIsEditing });

    if (side === 'left') {
      dispatch(setIsEditingLeftBorderThreading(newIsEditing));
    } else {
      dispatch(setIsEditingRightBorderThreading(newIsEditing));
    }
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

    const response = confirm( // eslint-disable-line no-restricted-globals
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
    const { side } = this.props;
    const { isEditing } = this.state;
    const label = side === 'left' ? 'Edit left border threading' : 'Edit right border threading';

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
    const { border, holes, palette } = this.props;
    const { isEditing } = this.state;

    const colorIndex = border.threadingByTablet[tabletIndex][rowIndex];
    const orientation = border.orientations[tabletIndex];

    if (!orientation) return null;

    const threadDetails = {
      colorIndex,
      holeToShow: rowIndex,
      threadAngle: orientation === '\\' ? '\\' : '/',
      threadColor: palette[colorIndex],
    };

    return (
      <span
        type={isEditing ? 'button' : undefined}
        onClick={isEditing ? () => this.handleClickThreadingCell(rowIndex, tabletIndex) : undefined}
        onKeyPress={isEditing ? () => this.handleClickThreadingCell(rowIndex, tabletIndex) : undefined}
        role={isEditing ? 'button' : undefined}
        tabIndex={isEditing ? '0' : undefined}
      >
        <ChartSVG
          direction='F'
          holes={holes}
          netTurns={holes - rowIndex}
          numberOfTurns={1}
          orientation={orientation}
          palette={palette}
          tabletIndex={tabletIndex}
          threadDetails={threadDetails}
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
        <li className='cell value' key={`border-threading-cell-${rowIndex}-${i}`}>
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
    const { border } = this.props;
    const { numberOfTablets } = border;

    const labels = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      labels.push(
        <li className='cell label' key={`border-tablet-label-${i}`}>
          <span>{i + 1}</span>
        </li>,
      );
    }

    return <ul className='tablet-labels'>{labels}</ul>;
  }

  renderIncludeInTwistButtons() {
    const { border } = this.props;
    const { isEditing } = this.state;
    const { includeInTwist, numberOfTablets } = border;

    if (!includeInTwist) return null;

    const buttons = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      const identifier = `border-include-in-twist-${i}`;
      const checked = includeInTwist[i];
      const tooltip = checked
        ? `Border tablet ${i + 1}: included in twist calculations`
        : `Border tablet ${i + 1}: excluded from twist calculations`;

      buttons.push(
        <li className='cell label' key={identifier}>
          <span>
            <input
              checked={checked}
              disabled={!isEditing}
              type='checkbox'
              id={identifier}
              name={identifier}
              onChange={() => this.handleChangeIncludeInTwistCheckbox(i)}
              title={tooltip}
            />
            <label htmlFor={identifier}>{tooltip}</label>
          </span>
        </li>,
      );
    }

    return (
      <div className='include-in-twist-buttons'>
        <ul>{buttons}</ul>
      </div>
    );
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
      const orientation = orientations[i];
      cells.push(
        <li className='cell value' key={`border-orientation-${i}`}>
          <span
            type={isEditing ? 'button' : undefined}
            onClick={isEditing ? () => this.handleClickOrientation(i) : undefined}
            onKeyPress={isEditing ? () => this.handleClickOrientation(i) : undefined}
            role={isEditing ? 'button' : undefined}
            tabIndex={isEditing ? '0' : undefined}
            title={`${orientation === '/' ? 'Orientation S' : 'Orientation Z'}`}
          >
            <span className={`${orientation === '/' ? 's' : 'z'}`} />
          </span>
        </li>,
      );
    }

    return (
      <div className='orientations'>
        <ul className='orientations'>{cells}</ul>
        <p className='hint'>
          The sloping line below each tablet shows you how to orient that
          tablet. The slope of the tablet when viewed from above should match
          the slope of the line.
        </p>
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
    const { isEditing } = this.state;

    if (!border || !border.numberOfTablets) {
      if (!isEditing) return null;
      // editing is active but no tablets yet — show the add-tablets form
      const sideLabel = side === 'left' ? 'Left border' : 'Right border';
      return (
        <div className='threading border-threading border-threading-empty editing'>
          <p className='hint'>{`${sideLabel}: add tablets below to create a border.`}</p>
          <AddBorderTabletsForm
            handleSubmit={this.handleSubmitAddTablets}
            numberOfTablets={0}
          />
          {this.renderPalette()}
        </div>
      );
    }

    return (
      <div className={`threading border-threading ${isEditing ? 'editing' : ''}`}>
        {canEdit && this.renderControls()}
        <div className='content'>
          {this.renderChart()}
          {isEditing && this.renderRemoveTabletButtons()}
          {this.renderOrientations()}
          {isEditing && (
            <div>
              <AddBorderTabletsForm
                handleSubmit={this.handleSubmitAddTablets}
                numberOfTablets={border.numberOfTablets}
                enableReinitialize={true}
              />
              {this.renderPalette()}
            </div>
          )}
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
  palette: PropTypes.arrayOf(PropTypes.any).isRequired,
  pattern: PropTypes.objectOf(PropTypes.any).isRequired,
  side: PropTypes.oneOf(['left', 'right']).isRequired,
};

function mapStateToProps(state, ownProps) {
  const { side } = ownProps;

  return {
    border: side === 'left' ? getLeftBorder(state) : getRightBorder(state),
    holes: getHoles(state),
    palette: getPalette(state),
  };
}

export default connect(mapStateToProps, null, null, { forwardRef: true })(ThreadingBorder);
