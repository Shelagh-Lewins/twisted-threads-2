import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input } from 'reactstrap';
import { Combobox } from 'react-widgets';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import './Search.scss';
import { ReactiveVar } from 'meteor/reactive-var';
import store from '../modules/store';
import {
  getPatternSearchLimit,
  getSearchTerm,
  getSetSearchLimit,
  getUserSearchLimit,
  searchStart,
  setIsSearching,
  showMorePatterns,
  showMoreUsers,
  showMoreSets,
} from '../modules/search';
import 'react-widgets/styles.css';
import {
  SearchPatterns,
  SearchSets,
  SearchUsers,
} from '../../modules/searchCollections';
import { iconColors, SEARCH_MORE } from '../../modules/parameters';

import getUserpicStyle from '../modules/getUserpicStyle';
import './Userpic.scss';

class Search extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
    };

    this.searchBoxRef = React.createRef();

    // bind onClick functions to provide context
    const functionsToBind = [
      'handleClickOutside',
      'onChangeInput',
      'onSelect',
      'toggleOpen',
    ];

    functionsToBind.forEach((functionName) => {
      this[functionName] = this[functionName].bind(this);
    });
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClickOutside);
  }

  componentDidUpdate(prevProps) {
    const { dispatch, hasSearchTerm, isSearching, searchTerm } = this.props;
    const { open } = this.state;

    // Only clear loading when search is actually complete
    if (prevProps.isSearching && !isSearching) {
      dispatch(setIsSearching(false));
    }

    // Open dropdown after every search completes, not just the first
    if (prevProps.isSearching && !isSearching && searchTerm !== '') {
      if (!open) {
        this.setState({ open: true }, () => {
          // Focus the Combobox input for accessibility
          setTimeout(() => {
            if (this.searchBoxRef.current) {
              const comboboxInput =
                this.searchBoxRef.current.querySelector('.rw-combobox-input');
              if (comboboxInput) comboboxInput.focus();
            }
          }, 0);
        });
      }
    }
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClickOutside);
  }

  toggleOpen = () => {
    const { open } = this.state;
    this.setState(
      (prevState) => ({ open: !prevState.open }),
      () => {
        // If opening, focus the Combobox input for accessibility
        if (!open) {
          // Delay to ensure Combobox is rendered
          setTimeout(() => {
            if (this.searchBoxRef.current) {
              const comboboxInput =
                this.searchBoxRef.current.querySelector('.rw-combobox-input');
              if (comboboxInput) comboboxInput.focus();
            }
          }, 0);
        }
      },
    );
  };

  onChangeInput = (event) => {
    const { dispatch } = this.props;
    const { value } = event.target;
    console.log('Search input changed:', value);
    clearTimeout(global.searchTimeout);

    if (!value || value === '') {
      this.setState({ open: false });
      dispatch(setIsSearching(false));
      dispatch({ type: 'CLEAR_SEARCH_RESULTS' });
      dispatch(setSearchTerm(''));
      return;
    }

    global.searchTimeout = setTimeout(() => {
      dispatch(searchStart(value));
    }, 500);
  };

  onSelect = (value) => {
    const { dispatch, history } = this.props;

    const { __originalId: _id, type } = value;
    let url;

    switch (type) {
      case 'pattern':
        this.toggleOpen();
        url = `/pattern/${_id}`;
        break;

      case 'user':
        this.toggleOpen();
        url = `/user/${_id}`;
        break;

      case 'set':
        this.toggleOpen();
        url = `/set/${_id}`;
        break;

      case 'showMorePatterns':
        dispatch(showMorePatterns());
        Search.updateMe.set(true);
        break;

      case 'showMoreUsers':
        dispatch(showMoreUsers());
        Search.updateMe.set(true);
        break;

      case 'showMoreSets':
        dispatch(showMoreSets());
        Search.updateMe.set(true);
        break;

      default:
        break;
    }
    history.push(url);
  };

  handleClickOutside(event) {
    const node = this.searchBoxRef.current;
    if (!node) return;

    const listNode = node.querySelector('.rw-list');
    const toggleNode = node.querySelector('.toggle-results');

    // if the user clicks outside the toggle button
    // and the results list
    // close the search results
    if (
      listNode &&
      !toggleNode.contains(event.target) &&
      !listNode.contains(event.target)
    ) {
      this.setState({ open: false });
    }
  }

  // custom input and button prevents the selected item from being written to the input
  renderSearchInput = () => {
    const { isSearching } = this.props;
    const iconClass = isSearching ? 'fa-spin' : '';
    const iconName = isSearching ? 'spinner' : 'search';

    return (
      <div className='search-controls'>
        <Input onChange={this.onChangeInput} type='text' />
        <Button
          className='toggle-results'
          onClick={this.toggleOpen}
          title='toggle results'
        >
          <FontAwesomeIcon
            className={iconClass}
            icon={['fas', iconName]}
            style={{ color: iconColors.default }}
            size='1x'
          />
        </Button>
      </div>
    );
  };

  render() {
    const { isSearching, searchResults, searchTerm } = this.props;

    const { open } = this.state;

    const GroupHeading = ({ group }) => {
      let text;
      switch (group) {
        case 'pattern':
          text = 'Patterns';
          break;
        case 'user':
          text = 'Users';
          break;
        case 'set':
          text = 'Sets';
          break;
        default:
          text = '';
          break;
      }
      return <span className='group-header'>{text}</span>;
    };

    const ListItem = ({ item }) => {
      const { _id, name, numberOfTablets, patterns, username, type } = item;

      let element;

      switch (type) {
        case 'pattern':
          element = (
            <span className='search-result-pattern'>
              <span
                className='main-icon'
                style={{
                  backgroundImage: `url(${Meteor.absoluteUrl(
                    '/images/search_pattern.png',
                  )}`,
                }}
              />
              <div>
                <span className='name' title={name}>
                  {name}
                </span>
                <span
                  className='tablets-count'
                  title={`${numberOfTablets} tablets`}
                >
                  <span
                    className='icon'
                    style={{
                      backgroundImage: `url(${Meteor.absoluteUrl(
                        '/images/tablet_count.svg',
                      )}`,
                    }}
                  />
                  {numberOfTablets}
                </span>
                <span className='created-by' title={`Created by ${username}`}>
                  <span
                    className='icon'
                    style={{
                      backgroundImage: `url(${Meteor.absoluteUrl(
                        '/images/created_by.png',
                      )}`,
                    }}
                  />
                  <span className='text'>{username}</span>
                </span>
              </div>
            </span>
          );
          break;

        case 'user':
          element = (
            <span className='search-result-user'>
              <span
                className={`${getUserpicStyle(_id)} main-icon icon`}
                style={{
                  backgroundImage: `url(${Meteor.absoluteUrl(
                    '/images/user_profile.png',
                  )}`,
                }}
              />
              <div>
                <span className='name'>{name}</span>
              </div>
            </span>
          );
          break;

        case 'set':
          // find the number of visible patterns in the set
          // eslint-disable-next-line no-case-declarations
          const numberOfPatterns =
            item.createdBy === Meteor.userId()
              ? patterns.length
              : item.publicPatternsCount;

          element = (
            <span className='search-result-set'>
              <span
                className='main-icon'
                style={{
                  backgroundImage: `url(${Meteor.absoluteUrl(
                    '/images/search_set.png',
                  )}`,
                }}
              />
              <div>
                <span className='name' title={name}>
                  {name}
                </span>
                <span
                  className='patterns-count'
                  title={`Patterns in set: ${numberOfPatterns}`}
                >
                  <span
                    className='icon'
                    style={{
                      backgroundImage: `url(${Meteor.absoluteUrl(
                        '/images/logo.png',
                      )}`,
                    }}
                  />
                  {numberOfPatterns}
                </span>
                <span className='created-by' title={`Created by ${username}`}>
                  <span
                    className='icon'
                    style={{
                      backgroundImage: `url(${Meteor.absoluteUrl(
                        '/images/created_by.png',
                      )}`,
                    }}
                  />
                  {username}
                </span>
              </div>
            </span>
          );
          break;

        case 'showMorePatterns':
          element = (
            <span className='show-more-patterns'>
              <FontAwesomeIcon
                icon={['fas', 'search']}
                style={{ color: iconColors.default }}
                size='1x'
              />
              Show more patterns...
            </span>
          );
          break;

        case 'showMoreUsers':
          element = (
            <span className='show-more-users'>
              <FontAwesomeIcon
                icon={['fas', 'search']}
                style={{ color: iconColors.default }}
                size='1x'
              />
              Show more users...
            </span>
          );
          break;

        case 'showMoreSets':
          element = (
            <span className='show-more-sets'>
              <FontAwesomeIcon
                icon={['fas', 'search']}
                style={{ color: iconColors.default }}
                size='1x'
              />
              Show more sets...
            </span>
          );
          break;

        default:
          element = <span className='default'>{name}</span>;
          break;
      }
      return element;
    };

    let message = 'Enter a search term...';

    if (isSearching) {
      message = 'Searching...';
    } else if (searchTerm && searchTerm !== '') {
      message = `no results found for ${searchTerm}`;
    }

    return (
      <div className='search-box' ref={this.searchBoxRef}>
        {this.renderSearchInput()}
        <Combobox
          busy={isSearching}
          data={searchResults}
          groupBy={(item) => item.type}
          renderListGroup={GroupHeading}
          renderListItem={ListItem}
          messages={{
            emptyList: message,
          }}
          onChange={() => {}}
          open={open}
          onSelect={this.onSelect}
          onToggle={() => {}}
          textField='name'
          dataKey='_id'
        />
      </div>
    );
  }
}

// force withTracker to update when 'show more' is clicked
Search.updateMe = new ReactiveVar(false);

Search.propTypes = {
  dispatch: PropTypes.func.isRequired,
  hasSearchTerm: PropTypes.bool.isRequired,
  history: PropTypes.objectOf(PropTypes.any).isRequired,
  isSearching: PropTypes.bool.isRequired,
  searchResults: PropTypes.arrayOf(PropTypes.any).isRequired,
  searchTerm: PropTypes.string.isRequired,
};

const Tracker = withTracker(({ dispatch }) => {
  // force the results list to update when the user clicks "more..."
  // eslint-disable-next-line no-unused-vars
  const trigger = Search.updateMe.get();

  const state = store.getState();
  const searchTerm = getSearchTerm(state);
  const patternSearchLimit = getPatternSearchLimit(state);
  const userSearchLimit = getUserSearchLimit(state);
  const setSearchLimit = getSetSearchLimit(state);
  let patternsResults = [];
  let usersResults = [];
  let setsResults = [];

  if (searchTerm) {
    const patternsLimit = patternSearchLimit + SEARCH_MORE;
    const usersLimit = userSearchLimit + SEARCH_MORE;
    const setsLimit = setSearchLimit + SEARCH_MORE;

    // subscribe to server publications (reactive)
    const patternsHandle = Meteor.subscribe(
      'search.patterns',
      searchTerm,
      patternsLimit,
    );
    const usersHandle = Meteor.subscribe(
      'search.users',
      searchTerm,
      usersLimit,
    );
    const setsHandle = Meteor.subscribe('search.sets', searchTerm, setsLimit);

    // patterns
    const patternsCursor = SearchPatterns.find({}, { sort: { nameSort: 1 } });
    let fetchedPatterns = patternsCursor.fetch();
    fetchedPatterns = fetchedPatterns.map((p) => ({
      ...p,
      type: 'pattern',
      __originalId: p._id,
    }));

    const numberOfPatterns = fetchedPatterns.length;
    const displayedPatterns = fetchedPatterns.slice(0, patternSearchLimit);
    if (numberOfPatterns > patternSearchLimit) {
      displayedPatterns.push({
        name: 'Show more patterns',
        type: 'showMorePatterns',
      });
    }

    patternsResults = displayedPatterns;

    // users
    const usersCursor = SearchUsers.find({}, { sort: { username: 1 } });
    let fetchedUsers = usersCursor.fetch();
    fetchedUsers = fetchedUsers.map((u) => ({
      _id: u._id,
      name: u.username,
      username: u.username,
      type: 'user',
      __originalId: u._id,
    }));

    const numberOfUsers = fetchedUsers.length;
    const displayedUsers = fetchedUsers.slice(0, userSearchLimit);
    if (numberOfUsers > userSearchLimit) {
      displayedUsers.push({ name: 'Show more users', type: 'showMoreUsers' });
    }

    usersResults = displayedUsers;

    // sets
    const setsCursor = SearchSets.find({}, { sort: { nameSort: 1 } });
    let fetchedSets = setsCursor.fetch();
    fetchedSets = fetchedSets.map((s) => ({
      ...s,
      type: 'set',
      __originalId: s._id,
    }));

    const numberOfSets = fetchedSets.length;
    const displayedSets = fetchedSets.slice(0, setSearchLimit);
    if (numberOfSets > setSearchLimit) {
      displayedSets.push({ name: 'Show more sets', type: 'showMoreSets' });
    }

    setsResults = displayedSets;

    // If all subscriptions are ready, stop the spinner
    if (patternsHandle.ready() && usersHandle.ready() && setsHandle.ready()) {
      dispatch(setIsSearching(false));
    }
  }
  Search.updateMe.set('false');

  return {
    searchResults: patternsResults.concat(usersResults).concat(setsResults),
    hasSearchTerm: !!searchTerm,
  };
})(Search);

export default connect()(Tracker);
