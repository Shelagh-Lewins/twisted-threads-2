// list global vars here
// not required, but helps to avoid duplication

global.savePatternPreviewTimeout = null;

// UploadPatternForm
global.touchedUploadPatternInput = null;

// forms that need to wait for the user to stop typing
global.allTogetherRowsTimeout = null;
global.twillStartRowTimeout = null;
global.editWeavingCellTimeout = null;
global.tabletFilterTimeout = null;

// connection status
global.connectionTimeout = null;

// force resubscription to sets, for Pattern page and NavBar using context
global.updateSetsSubscription = new ReactiveVar(true);
global.setsSubscriptionHandle = null;

// force resubscription to sets for components using Tracker
global.updateTrackerSetsSubscription = new ReactiveVar(true);

// the User page needs to resubscribe to sets
global.userSetsSubscriptionHandle = null;
global.userPatternsInSets = [];

// the individual Set page needs to resubscribe to sets
global.updateTrackerSetsSubscription2 = new ReactiveVar(true);
global.setSetsSubscriptionHandle = null;
