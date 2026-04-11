import React, { useState } from 'react';
import { Button } from 'reactstrap';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  getPatternId,
  getThreadCounts,
  getTotalThreads,
  replaceColorInThreading,
} from '../modules/pattern';
import { SVGPaletteEmpty } from '../modules/svg';
import Palette from './Palette';
import './ThreadCounts.scss';

function ThreadCounts(props) {
  const {
    _id,
    canEdit,
    colorBooks,
    dispatch,
    palette,
    threadCounts,
    totalThreads,
  } = props;

  const [isEditing, setIsEditing] = useState(false);
  const [selectedColorIndex, setSelectedColorIndex] = useState(null);

  const Wrapper = ({ children, count }) => {
    return (
      <div className='wrapper'>
        <div className='count'>{count}</div>
        {children}
      </div>
    );
  };
  Wrapper.propTypes = {
    children: PropTypes.element,
    count: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  };

  const handleClickColor = (threadColorIndex) => {
    setSelectedColorIndex(threadColorIndex);
  };

  const handleSelectNewColor = (toColorIndex) => {
    dispatch(
      replaceColorInThreading({
        _id,
        fromColorIndex: selectedColorIndex,
        toColorIndex,
      }),
    );
    setSelectedColorIndex(toColorIndex);
  };

  const renderControls = () => (
    <div className='controls'>
      {isEditing ? (
        <Button
          color='primary'
          onClick={() => {
            setIsEditing(false);
            setSelectedColorIndex(null);
          }}
        >
          Done
        </Button>
      ) : (
        <Button
          color='primary'
          onClick={() => {
            const firstIndex = Object.keys(threadCounts)
              .map((key) => parseInt(key, 10))
              .sort((a, b) => threadCounts[b] - threadCounts[a])[0];
            setSelectedColorIndex(firstIndex ?? null);
            setIsEditing(true);
          }}
        >
          Edit thread colours
        </Button>
      )}
    </div>
  );

  const renderPalettePicker = () => (
    <div className='thread-counts-palette'>
      <Palette
        key={selectedColorIndex}
        _id={_id}
        colorBooks={colorBooks}
        elementId='thread-counts-palette-picker'
        initialColorIndex={selectedColorIndex}
        selectColor={handleSelectNewColor}
      />
    </div>
  );

  const renderColorCount = (colorValue, count, threadColorIndex) => (
    <Wrapper count={count} key={`thread-count-${threadColorIndex}`}>
      <div
        className={`thread-count color${isEditing ? ' clickable' : ''}${
          selectedColorIndex === threadColorIndex ? ' selected-for-remap' : ''
        }`}
        style={{ backgroundColor: colorValue }}
        onClick={
          isEditing ? () => handleClickColor(threadColorIndex) : undefined
        }
        role={isEditing ? 'button' : undefined}
        tabIndex={isEditing ? '0' : undefined}
      />
    </Wrapper>
  );

  const renderEmptyHoleCount = (count) => (
    <Wrapper count={count} key='thread-count-empty-hole'>
      <div
        className={`thread-count empty-hole${isEditing ? ' clickable' : ''}${
          selectedColorIndex === -1 ? ' selected-for-remap' : ''
        }`}
        title={
          isEditing
            ? 'Click to remap empty holes to a colour'
            : `Empty holes: ${count}`
        }
        onClick={isEditing ? () => handleClickColor(-1) : undefined}
        role={isEditing ? 'button' : undefined}
        tabIndex={isEditing ? '0' : undefined}
      >
        <SVGPaletteEmpty stroke='#000' />
      </div>
    </Wrapper>
  );

  const renderColors = () => {
    const indexesInUse = Object.keys(threadCounts)
      .map((key) => parseInt(key, 10))
      .sort((a, b) => threadCounts[b] - threadCounts[a]);

    return indexesInUse.map((threadColorIndex) => {
      if (threadColorIndex === -1) {
        return renderEmptyHoleCount(threadCounts['-1']);
      }
      return renderColorCount(
        palette[threadColorIndex],
        threadCounts[threadColorIndex],
        threadColorIndex,
      );
    });
  };

  return (
    <div className={`thread-counts ${isEditing ? 'editing' : ''}`}>
      {canEdit && renderControls()}
      <div className='content'>
        <div className='swatches-row'>
          <Wrapper count={'\u200B'}>
            <span className='text'>Thread counts:</span>
          </Wrapper>
          {renderColors()}
        </div>
        {isEditing && (
          <p>
            Warning: to swap two colours, first change one of them to an unused
            colour. Otherwise the two will be merged.
          </p>
        )}
        {isEditing && renderPalettePicker()}
      </div>
      <div>
        <p>Total number of threads: {totalThreads}</p>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    _id: getPatternId(state),
    palette: state.pattern.palette,
    threadCounts: getThreadCounts(state),
    totalThreads: getTotalThreads(state),
  };
}

ThreadCounts.defaultProps = {
  _id: undefined,
  canEdit: false,
  colorBooks: [],
  dispatch: undefined,
  palette: undefined,
};

ThreadCounts.propTypes = {
  _id: PropTypes.string,
  canEdit: PropTypes.bool,
  colorBooks: PropTypes.arrayOf(PropTypes.any),
  dispatch: PropTypes.func,
  palette: PropTypes.arrayOf(PropTypes.string),
  threadCounts: PropTypes.objectOf(PropTypes.any).isRequired,
  totalThreads: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(ThreadCounts);
