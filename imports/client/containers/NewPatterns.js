import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Container, Row } from 'reactstrap';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import PageWrapper from '../components/PageWrapper';
import store from '../modules/store';
import {
  getIsLoading,
  getPatternCount,
  setIsLoading,
  updatePatternCountUserId,
} from '../modules/pattern';
import { PatternPreviews, Patterns, Tags } from '../../modules/collection';
import Loading from '../components/Loading';
import MainMenu from '../components/MainMenu';
import PatternFilterForm from '../forms/PatternFilterForm';
import PaginatedList from '../components/PaginatedList';
import PatternList from '../components/PatternList';

import secondaryPatternSubscriptions from '../modules/secondaryPatternSubscriptions';
import queryString from 'query-string';

import './Home.scss';

const bodyClass = 'new-patterns';

class NewPatterns extends Component {
  constructor(props) {
    super(props);
    const { dispatch } = props;

    // bind onClick functions to provide context
    const functionsToBind = ['handlePaginationUpdate'];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });

    dispatch(updatePatternCountUserId());
  }

  componentDidMount() {
    document.body.classList.add(bodyClass);
  }

  componentWillUnmount() {
    document.body.classList.remove(bodyClass);
  }

  handlePaginationUpdate() {
    const { dispatch } = this.props;

    dispatch(getPatternCount());
  }

  render() {
    const {
      currentPageNumber,
      dispatch,
      errors,
      history,
      isLoading,
      patternCount,
      patternPreviews,
      patterns,
      tags,
      users,
    } = this.props;

    return (
      <PageWrapper dispatch={dispatch} errors={errors}>
        <MainMenu />
        <div className='menu-selected-area'>
          {isLoading && <Loading />}
          <Container>
            <Row>
              <Col lg='12'>
                <h1>New patterns</h1>
              </Col>
            </Row>
          </Container>
          {!isLoading && (
            <>
              <PatternFilterForm />
              <PaginatedList
                currentPageNumber={currentPageNumber}
                dispatch={dispatch}
                handlePaginationUpdate={this.handlePaginationUpdate}
                history={history}
                itemCount={patternCount}
              >
                <PatternList
                  dispatch={dispatch}
                  patternPreviews={patternPreviews}
                  patterns={patterns}
                  tags={tags}
                  users={users}
                />
              </PaginatedList>
            </>
          )}
        </div>
      </PageWrapper>
    );
  }
}

NewPatterns.defaultProps = {
  currentPageNumber: 1,
};

NewPatterns.propTypes = {
  currentPageNumber: PropTypes.number,
  dispatch: PropTypes.func.isRequired,
  errors: PropTypes.objectOf(PropTypes.any).isRequired,
  // eslint doesn't realise the filters are used in Tracker
  filterIsTwistNeutral: PropTypes.bool,
  filterMaxTablets: PropTypes.number,
  filterMinTablets: PropTypes.number,
  filterWillRepeat: PropTypes.bool,
  itemsPerPage: PropTypes.number.isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  isLoading: PropTypes.bool.isRequired,
  patternCount: PropTypes.number.isRequired,
  patternPreviews: PropTypes.arrayOf(PropTypes.any).isRequired,
  patterns: PropTypes.arrayOf(PropTypes.any).isRequired,
  tags: PropTypes.arrayOf(PropTypes.any).isRequired,
  users: PropTypes.arrayOf(PropTypes.any).isRequired,
};

function mapStateToProps(state, ownProps) {
  const { itemsPerPage } = state.page;
  // find page number as URL query parameter, if present, in the form '/?page=1'
  let currentPageNumber = 1;
  const parsed = queryString.parse(ownProps.location.search);
  const page = parseInt(parsed.page, 10);

  if (!Number.isNaN(page) && page > 0) {
    currentPageNumber = page;
  }

  const {
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
  } = state.pattern;

  return {
    currentPageNumber: currentPageNumber, // read the url parameter to find the currentPage
    errors: state.errors,
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
    isLoading: getIsLoading(state),
    itemsPerPage,
    pageSkip: (currentPageNumber - 1) * itemsPerPage,
    patternCount: state.pattern.patternCount,
  };
}

const Tracker = withTracker((props) => {
  const {
    dispatch,
    filterIsTwistNeutral,
    filterMaxTablets,
    filterMinTablets,
    filterWillRepeat,
    itemsPerPage,
    pageSkip,
  } = props;
  const state = store.getState();
  const isLoading = getIsLoading(state);

  const patterns = Patterns.find(
    {},
    {
      sort: { createdAt: -1 },
      limit: itemsPerPage,
    },
  ).fetch();

  Meteor.subscribe('tags');

  const handle = Meteor.subscribe(
    'newPatterns',
    {
      filterIsTwistNeutral,
      filterMaxTablets,
      filterMinTablets,
      filterWillRepeat,
      limit: itemsPerPage,
      skip: pageSkip,
    },
    {
      onReady: () => {
        secondaryPatternSubscriptions(patterns);
      },
    },
  );

  if (isLoading && handle.ready()) {
    setTimeout(() => {
      dispatch(setIsLoading(false));
    }, 1);
  } else if (!isLoading && !handle.ready()) {
    setTimeout(() => {
      dispatch(setIsLoading(true));
    }, 1);
  }

  return {
    patterns,
    patternPreviews: PatternPreviews.find().fetch(),
    tags: Tags.find().fetch(),
    users: Meteor.users.find().fetch(),
  };
})(NewPatterns);

export default connect(mapStateToProps)(Tracker);
