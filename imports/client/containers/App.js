import React from 'react';
import PropTypes from 'prop-types';
import {
  matchPath,
  BrowserRouter as Router,
  Route,
  Switch,
  withRouter,
} from 'react-router-dom';
import { connect, Provider } from 'react-redux';

// fontawesome
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faBookOpen,
  faQuestionCircle,
  faClone,
  faFileDownload,
  faFileUpload,
  faInfoCircle,
  faLock,
  faLockOpen,
  faPencilAlt,
  faPlus,
  faSearch,
  faSpinner,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'; // import the icons you want
import { withTracker } from 'meteor/react-meteor-data';
import {
  ColorBooks,
  PatternImages,
  Patterns,
  Sets,
  Tags,
} from '../../modules/collection';
import store from '../modules/store';
import {
  getNumberOfColorBooks,
  getNumberOfPatternImages,
  getNumberOfPatterns,
  getUserRoles,
  setMaintenanceMode,
  setVersion,
  setNumberOfColorBooks,
  setNumberOfPatternImages,
  setNumberOfPatterns,
  setUserRoles,
  setWeavingBackwardsBackgroundColor,
} from '../modules/auth';
import {
  clearPatternData,
  getIsLoading,
  getPatternId,
  setIsEditingWeaving,
  setIsEditingThreading,
  setIsLoading,
  savePatternData,
  setPatternId,
} from '../modules/pattern';
import AppContext from '../modules/appContext';
import Navbar from '../components/Navbar';
import Login from './Login';
import Register from './Register';
import Welcome from './Welcome';
import Account from './Account';
import ChangePassword from './ChangePassword';
import VerifyEmail from './VerifyEmail';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Home from './Home';
import RecentPatterns from './RecentPatterns';
import AllPatterns from './AllPatterns';
import NewPatterns from './NewPatterns';
import People from './People';
import About from './About';
import FAQPage from './FAQPage';
import Pattern from './Pattern';
import Set from './Set';
import User from './User';
import InteractiveWeavingChart from './InteractiveWeavingChart';
import WeavingPrintView from './PrintView';
import { DEFAULT_WEAVING_BACKWARDS_BACKGROUND_COLOR } from '../../modules/parameters';
import './App.scss';

// for optional url parameter with specified options, use regex: https://stackoverflow.com/questions/47369023/react-router-v4-allow-only-certain-parameters-in-url
// this allows pattern/id/tabname and pattern/id/weaving with different components

library.add(
  faBookOpen,
  faQuestionCircle,
  faClone,
  faFileDownload,
  faFileUpload,
  faInfoCircle,
  faLock,
  faLockOpen,
  faPencilAlt,
  faPlus,
  faSearch,
  faSpinner,
  faTrash,
); // and add them to your library

const PrintViewContainer = () => (
  <div className='app-container'>
    <Route exact path='/pattern/:id/print-view' component={WeavingPrintView} />
  </div>
);

// !!! When a new route is added, it must be explicitly allowed in the nginx conf file on the server !!!
// /etc/nginx/sites-enabled/twistedthreads.conf
// otherwise direct navigation to the route will be blocked
const DefaultContainer = () => (
  <div className='app-container'>
    <Navbar />
    <div className='main-container'>
      <Route exact path='/login' component={Login} />
      <Route exact path='/register' component={Register} />
      <Route exact path='/welcome' component={Welcome} />
      <Route exact path='/account' component={Account} />
      <Route exact path='/verify-email/:token' component={VerifyEmail} />
      <Route exact path='/change-password' component={ChangePassword} />
      <Route exact path='/forgot-password' component={ForgotPassword} />
      <Route exact path='/reset-password/:token' component={ResetPassword} />
      <Route exact path='/' component={Home} />
      <Route exact path='/recent-patterns' component={RecentPatterns} />
      <Route exact path='/new-patterns' component={NewPatterns} />
      <Route exact path='/all-patterns' component={AllPatterns} />
      <Route exact path='/people' component={People} />
      <Route exact path='/about' component={About} />
      <Route exact path='/faq' component={FAQPage} />
      <Route exact path='/pattern/:id/:tab(design|info)?' component={Pattern} />
      <Route
        exact
        path='/pattern/:id/weaving'
        component={InteractiveWeavingChart}
      />
      <Route exact path='/set/:id' component={Set} />
      <Route
        exact
        path='/user/:id/:tab(profile|patterns|colorbooks|sets)?'
        component={User}
      />
    </div>
  </div>
);

function App() {
  return (
    <Provider store={store}>
      <Router>
        <DatabaseProvider>
          <Switch>
            <Route
              exact
              path='/pattern/:id/print-view'
              component={PrintViewContainer}
            />
            <Route component={DefaultContainer} />
          </Switch>
        </DatabaseProvider>
      </Router>
    </Provider>
  );
}

export const withDatabase = withTracker((props) => {
  const { dispatch, location } = props;
  let pattern;
  let patternIdParam;

  Meteor.call('auth.getMaintenanceMode', (err, response) => {
    if (response) {
      dispatch(setMaintenanceMode(true));
    }
  });

  Meteor.call('auth.getVersion', (err, response) => {
    dispatch(setVersion(response));
  });

  // provide information about the user
  const state = store.getState();
  const isLoading = getIsLoading(state);

  // check for login, logout, change of email verifiction status. Update record of user in state.auth if there is a change.
  const MeteorUserId = Meteor.user() ? Meteor.user()._id : undefined; // Meteor.userId() can load before Meteor.user(), causing a double update

  let numberOfColorBooks = 0;
  let numberOfPatternImages = 0;

  // sometimes when you click the verification link in an email getRolesForUser throws an error
  // the new role assignment temporarily lacks the required 'inheritedRoles' field
  // This seems to happen consistently in Chrome but only if there is already another browser window open to the right of the email browser window. I can only guess it is some strange timing issue
  // the db problem appears to correct itself on the next update
  // try / catch appears to allow things to work
  try {
    const userRoles = Roles.getRolesForUser(MeteorUserId);
    if (JSON.stringify(userRoles) !== JSON.stringify(getUserRoles(state))) {
      dispatch(setUserRoles(userRoles));
    }
  } catch (err) {
    console.log('*** err in App.js, Roles.getRolesForUser', err);
  }

  // update user information that would not otherwise be reactive
  if (Meteor.user()) {
    // change in the database must trigger a change in the numbers in the Redux store
    // check for change in number of patterns the user has created
    // used to check whether they can create a new pattern
    if (Meteor.userId()) {
      Meteor.call(
        'pattern.getPatternCount',
        {
          userId: Meteor.userId(),
        },
        (error, result) => {
          if (error) {
            console.log(
              'App.js, error calling method pattern.getPatternCount',
              error,
            );
          }

          if (result !== getNumberOfPatterns(state)) {
            dispatch(setNumberOfPatterns(result));
          }
        },
      );
    }

    // check for change in the number of color books the user has created
    numberOfColorBooks = ColorBooks.find({
      createdBy: Meteor.userId(),
    }).count();

    if (numberOfColorBooks !== getNumberOfColorBooks(state)) {
      dispatch(setNumberOfColorBooks(numberOfColorBooks));
    }
  }

  // set background colour for backwards turning on weaving chart
  if (Meteor.user() && Meteor.user().weavingBackwardsBackgroundColor) {
    dispatch(
      setWeavingBackwardsBackgroundColor(
        Meteor.user().weavingBackwardsBackgroundColor,
      ),
    );
  } else {
    dispatch(
      setWeavingBackwardsBackgroundColor(
        DEFAULT_WEAVING_BACKWARDS_BACKGROUND_COLOR,
      ),
    );
  }

  // provide information for any pattern page
  // using context allows us to send data to the page component and the Navbar with a single subscription
  if (location) {
    const { pathname } = location;

    Meteor.subscribe('setsForUser', Meteor.userId());

    // Navbar always needs to know about the user's sets
    // pattern list pages need to know about tags
    const values = {
      allTags: [],
      sets: [],
    };

    Meteor.subscribe('setsForUser', Meteor.userId());

    values.sets = Sets.find().fetch();

    const matchPattern = matchPath(pathname, {
      path: '/pattern/:id',
      exact: false,
      strict: false,
    });

    if (matchPattern) {
      // on any pattern route, page component and Navbar need pattern data
      patternIdParam = matchPattern.params.id;

      if (patternIdParam) {
        dispatch(setPatternId(patternIdParam));

        // happens if user copies a pattern
        if (patternIdParam !== getPatternId(state)) {
          dispatch(setIsLoading(true));
          dispatch(clearPatternData()); // force chart data to be rebuilt
        }

        const handle = Meteor.subscribe('pattern', patternIdParam, {
          onReady: () => {
            pattern = Patterns.findOne({ _id: patternIdParam });

            // check pattern is found
            if (pattern) {
              const { createdBy } = pattern;

              Meteor.subscribe('users', [createdBy]);
              Meteor.subscribe('colorBooks', createdBy);
              Meteor.subscribe('patternImages', pattern._id);
              Meteor.subscribe('tags');
            }
          },
        });

        numberOfPatternImages = PatternImages.find({
          patternId: patternIdParam,
        }).count();

        if (numberOfPatternImages !== getNumberOfPatternImages(state)) {
          dispatch(setNumberOfPatternImages(numberOfPatternImages));
        }

        // we must find pattern here or the tracker doesn't update when the subscription is loaded
        pattern = Patterns.findOne({ _id: patternIdParam });

        if (pattern) {
          values.colorBooks = ColorBooks.find(
            { createdBy: pattern.createdBy },
            {
              sort: { nameSort: 1 },
            },
          ).fetch();
          values.createdByUser = Meteor.users.findOne({
            _id: pattern.createdBy,
          });
          values.pattern = pattern;
          values.patternImages = PatternImages.find({
            patternId: pattern._id,
          }).fetch();
          values.allTags = Tags.find().fetch();

          // make sure full individual pattern data are loaded and the user who owns it
          // if you navigate from a user page, the pattern summary detail will already by loaded
          // but not the full details, causing an error
          // only dispatch the action if there will be a change
          // which can be because of switching to a different pattern
          if (isLoading && handle.ready()) {
            if (!state.pattern.patternDataReady) {
              // once the data are loaded, build the charts
              dispatch(savePatternData(pattern));
              dispatch(setIsEditingWeaving(false));
              dispatch(setIsEditingThreading(false));
            }

            // everything is ready to render
            dispatch(setIsLoading(false));
          } else if (!isLoading && !handle.ready()) {
            dispatch(setIsLoading(true));
          }
        } else if (handle.ready()) {
          // pattern doesn't exist or isn't visible to user
          dispatch(setIsLoading(false));
        }
        values.patternId = patternIdParam; // passed separately in case pattern isn't found
      }
    }

    //values.isLoadingUser = !Accounts.loginServicesConfigured(); // broken in Meteor 2.9 https://github.com/meteor/meteor/issues/12375
    values.isLoadingUser = Accounts._loginServicesHandle === 'undefined'; // attempt at a workaround, to detect that Accounts is ready

    return values;
  }
});

// put the database data into the provider as 'value', a magic property name
function ProviderInner({
  allTags,
  children,
  colorBooks,
  createdByUser,
  isLoadingUser,
  pattern,
  patternId,
  patternImages,
  sets,
}) {
  return (
    <AppContext.Provider
      value={{
        allTags,
        colorBooks,
        createdByUser,
        isLoadingUser,
        pattern,
        patternId,
        patternImages,
        sets,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

// all props are optional because they vary with route
ProviderInner.propTypes = {
  allTags: PropTypes.arrayOf(PropTypes.any).isRequired,
  children: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.node,
  ]).isRequired,
  colorBooks: PropTypes.arrayOf(PropTypes.any),
  createdByUser: PropTypes.objectOf(PropTypes.any),
  isLoadingUser: PropTypes.bool,
  pattern: PropTypes.objectOf(PropTypes.any),
  patternId: PropTypes.string,
  patternImages: PropTypes.arrayOf(PropTypes.any),
  sets: PropTypes.arrayOf(PropTypes.any),
};

// withRouter gives us location
// connect gives us dispatch
export const DatabaseProvider = withRouter(
  connect()(withDatabase(ProviderInner)),
);
export const DatabaseConsumer = AppContext.Consumer;

export default App;
