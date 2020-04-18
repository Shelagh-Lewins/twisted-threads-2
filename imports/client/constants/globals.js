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

// force resubscription to sets
global.updateSetsSubscription = new ReactiveVar(true);
global.setsSubscriptionHandle = null;
