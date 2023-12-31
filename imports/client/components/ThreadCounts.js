import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getThreadCounts, getTotalThreads } from '../modules/pattern';
import { SVGPaletteEmpty } from '../modules/svg';
import './ThreadCounts.scss';

function ThreadCounts(props) {
  const { palette, threadCounts, totalThreads } = props;

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
    count: PropTypes.number.isRequired,
  };

  const renderColorCount = (colorValue, count, threadColorIndex) => (
    <Wrapper count={count} key={`thread-count-${threadColorIndex}`}>
      <div
        className='thread-count color'
        style={{ backgroundColor: colorValue }}
        title={`Threads of colour ${colorValue}: ${count}`}
      />
    </Wrapper>
  );

  const renderEmptyHoleCount = (count) => (
    <Wrapper
      count={count}
      key='thread-count-empty-hole'
      Name='thread-count-empty-hole'
    >
      <div className='thread-count empty-hole' title={`Empty holes: ${count}`}>
        <SVGPaletteEmpty stroke='#000' />
      </div>
    </Wrapper>
  );

  const renderColors = () => {
    const colorCounts = [];
    const emptyHoleCount = threadCounts['-1'];
    if (emptyHoleCount !== undefined) {
      colorCounts.push(renderEmptyHoleCount(emptyHoleCount));
    }
    const indexesInUse = Object.keys(threadCounts)
      .map((key) => parseInt(key, 10))
      .filter((index) => index !== -1); // empty hole will be handled separately

    const threadColors = indexesInUse.map((threadColorIndex) =>
      renderColorCount(
        palette[threadColorIndex],
        threadCounts[threadColorIndex],
        threadColorIndex,
      ),
    );

    threadColors.push(colorCounts);

    return threadColors;
  };

  return (
    <div className='thread-counts'>
      {renderColors()}
      <div>
        <p>Total number of threads: {totalThreads}</p>
      </div>
    </div>
  );
}

function mapStateToProps(state) {
  return {
    palette: state.pattern.palette,
    threadCounts: getThreadCounts(state),
    totalThreads: getTotalThreads(state),
  };
}

ThreadCounts.propTypes = {
  palette: PropTypes.arrayOf(PropTypes.string),
  threadCounts: PropTypes.objectOf(PropTypes.any).isRequired,
  totalThreads: PropTypes.number.isRequired,
};

export default connect(mapStateToProps)(ThreadCounts);
