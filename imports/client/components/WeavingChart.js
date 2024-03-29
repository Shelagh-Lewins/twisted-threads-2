// weaving chart for interactive weaving chart page

import React from 'react';
import PropTypes from 'prop-types';
import WeavingChartCell from './WeavingChartCell';
import FreehandChartCell from './FreehandChartCell';
import VerticalGuides from './VerticalGuides';
import ShowGuideForTabletCell from './ShowGuideForTabletCell';
import InfoButton from './InfoButton';
import { editTabletGuides } from '../modules/pattern';

import './Threading.scss';
import './WeavingChart.scss';

// row and tablet have nothing to identify them except index
// note row here indicates hole of the tablet
// so disable the rule below
/* eslint-disable react/no-array-index-key */

// the weaving cell is only given button functionality when editing
// but eslint doesn't pick this up
/* eslint-disable jsx-a11y/no-noninteractive-tabindex */
/* eslint-disable jsx-a11y/no-static-element-interactions */

function WeavingChart(props) {
  const {
    createdBy,
    printView,
    dispatch,
    handleClickRow,
    patternId,
    patternType,
    handleClickDown,
    handleClickUp,
    numberOfRows,
    numberOfTablets,
    selectedRow,
  } = props;

  const handleChangeShowGuideCheckbox = (event, tabletIndex) => {
    const canSave =
      createdBy === Meteor.userId() ||
      Roles.getRolesForUser(Meteor.userId()).includes('serviceUser');

    dispatch(
      editTabletGuides({
        canSave,
        _id: patternId,
        tablet: tabletIndex,
      }),
    );
  };

  const renderCell = (rowIndex, tabletIndex) => {
    let cell;

    if (patternType === 'freehand') {
      cell = (
        <FreehandChartCell rowIndex={rowIndex} tabletIndex={tabletIndex} />
      );
    } else {
      cell = <WeavingChartCell rowIndex={rowIndex} tabletIndex={tabletIndex} />;
    }

    return (
      <li
        className='cell value'
        key={`weaving-cell-${rowIndex}-${tabletIndex}`}
      >
        {cell}
      </li>
    );
  };

  const renderRow = (rowIndex) => {
    const rowLabel = numberOfRows - rowIndex;

    const cells = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      cells.push(renderCell(rowLabel - 1, i));
    }

    // background images in scss are malformed: the leading / is removed so they become relative and do not point to public/images
    // https://github.com/meteor/meteor/issues/10247
    // a solution is to specify background-image with inline style
    // unfortunately using relative paths in the scss like "../images/created_by.png" doesn't work reliably
    const upUrl = Meteor.absoluteUrl('/images/up.png'); // absoluteUrl is recommended, though doesn't seem to be necessary
    const downUrl = Meteor.absoluteUrl('/images/down.png');

    return (
      <>
        <ul className='weaving-row'>
          <li className='cell label'>
            <span>{rowLabel}</span>
          </li>
          {cells}
          {printView && <VerticalGuides numberOfTablets={numberOfTablets} />}
        </ul>
        {!printView && (
          <div className='highlight'>
            <div className='innertube' />
            <VerticalGuides
              numberOfTablets={numberOfTablets}
              reduceContrast={true}
            />
            <div className='buttons'>
              <button
                type='button'
                className='button-up'
                onClick={handleClickUp}
                style={{ backgroundImage: `url('${upUrl}')` }}
              >
                Up
              </button>
              <button
                type='button'
                className='button-down'
                onClick={handleClickDown}
                style={{ backgroundImage: `url('${downUrl}')` }}
              >
                Down
              </button>
            </div>
          </div>
        )}
      </>
    );
  };

  const renderShowTabletGuidesButton = (tabletIndex) => (
    <ShowGuideForTabletCell
      handleChangeShowGuideCheckbox={handleChangeShowGuideCheckbox}
      isDisabled={printView}
      tabletIndex={tabletIndex}
    />
  );

  const renderShowTabletGuideButtons = () => {
    const buttons = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      buttons.push(
        <li className='cell label' key={`show-tabletguide-${i}`}>
          {renderShowTabletGuidesButton(i)}
        </li>,
      );
    }

    const guideInfoText =
      'Check the "Show guide line for tablet" checkbox to display a vertical guide line after this tablet on the weaving and threading charts';
    const guideInfoTitle =
      'Click to learn about the "Show guide lines for tablets" checkboxes';

    return (
      <div className='tablet-guide-buttons'>
        <div className='tablet-guide-info-button'>
          <InfoButton message={guideInfoText} title={guideInfoTitle} />
        </div>
        <ul>{buttons}</ul>
      </div>
    );
  };

  const renderTabletLabels = () => {
    let offset = 0;

    if (!printView) {
      offset = 33 * selectedRow + 15; // add space for vertical guide checkboxes
    }

    const labels = [];
    for (let i = 0; i < numberOfTablets; i += 1) {
      labels.push(
        <li className='cell label' key={`tablet-label-${i}`}>
          <span>{i + 1}</span>
        </li>,
      );
    }

    return (
      <ul className='tablet-labels' style={{ top: `${offset}px` }}>
        {labels}
      </ul>
    );
  };

  const renderChart = () => {
    const rows = [];
    for (let i = 0; i < numberOfRows; i += 1) {
      if (printView) {
        rows.push(
          <li className='row' key={`weaving-row-${i}`}>
            {renderRow(i)}
          </li>,
        );
      } else {
        rows.push(
          <li
            className={`row ${i === selectedRow ? 'selected' : ''}`}
            key={`weaving-row-${i}`}
            onClick={i === selectedRow ? undefined : () => handleClickRow(i)}
            onKeyPress={i === selectedRow ? undefined : () => handleClickRow(i)}
            role='button' // eslint-disable-line
            tabIndex='0'
            type='button'
          >
            {renderRow(i)}
          </li>,
        );
      }
    }

    return (
      <div className='weaving-chart-holder'>
        {renderTabletLabels()}
        {renderShowTabletGuideButtons()}
        <ul className='weaving-chart'>{rows}</ul>
      </div>
    );
  };

  return (
    <div className={`weaving ${printView && 'weaving-chart-print'}`}>
      <div className='content'>{renderChart()}</div>
    </div>
  );
}

// known bug that eslint does not reliably detect props inside functions in a functional component
// https://github.com/yannickcr/eslint-plugin-react/issues/885
WeavingChart.propTypes = {
  createdBy: PropTypes.string.isRequired,
  dispatch: PropTypes.func,
  handleClickUp: PropTypes.func,
  handleClickRow: PropTypes.func,
  handleClickDown: PropTypes.func,
  numberOfRows: PropTypes.number.isRequired,
  numberOfTablets: PropTypes.number.isRequired,
  patternType: PropTypes.string.isRequired,
  patternId: PropTypes.string.isRequired,
  printView: PropTypes.bool.isRequired,
  selectedRow: PropTypes.number,
};

export default WeavingChart;
