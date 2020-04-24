// These parameters are available to client and server
// allowing for consistent validation

export const ALLOWED_ITEMS_PER_PAGE = [10, 15, 20, 25, 30, 35, 40];
export const USER_FIELDS = {
	'_id': 1,
	'description': 1,
	'nameSort': 1,
	'publicColorBooksCount': 1,
	'publicPatternsCount': 1,
	'username': 1,
};

export const DEFAULT_PALETTE = [
	'#7A1313',
	'#C32828',
	'#f98c03',
	'#fbe158',
	'#6aa84f',
	'#1f6d1f',
	'#172f79',
	'#3670B4',
	'#76bae6',
	'#a67bc8',
	'#9025c5',
	'#000000',
	'#828282',
	'#ffffff',
	'#523f12',
	'#aa8e4b',
];

export const MAX_ROWS = 200;
export const MAX_TABLETS = 100;
export const ALLOWED_HOLES = [2, 4, 6]; // permittied number of holes per tablet
// although the select returns string, these must be number for server side validation
export const HOLE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const ALLOWED_PATTERN_TYPES = [
	{ // simulation pattern, woven by turning each tablet individually
		'name': 'individual',
		'displayName': 'Individual',
		'previewOrientation': 'right',
		'tag': 'individual',
	},
	{ // simulation pattern, woven by turning all tablets together
		'name': 'allTogether',
		'displayName': 'All together',
		'previewOrientation': 'right',
		'tag': 'all together',
	},
	{ // 3 / 1 broken twill, designed on special graph paper
		'name': 'brokenTwill',
		'displayName': '3/1 broken twill',
		'previewOrientation': 'up',
		'tag': '3/1 broken twill',

	},
	{ // threading is standard, but the weaving chart is hand drawn
		// and can have errors
		// best for warp pickup patterns and brocade
		'name': 'freehand',
		'displayName': 'Freehand',
		'previewOrientation': 'right',
		'tag': 'freehand',
	},
];
export const findPatternTypeDisplayName = (patternType) => ALLOWED_PATTERN_TYPES.find((type) => type.name === patternType).displayName;

export const DEFAULT_COLOR = 3; // default thread color is different from that selected in palette, so that users will see something happen if they click on the threading chart
export const DEFAULT_PALETTE_COLOR = 0; // default selection on palette
export const DEFAULT_TABLETS = 8;
export const DEFAULT_ROWS = 8;
export const DEFAULT_ORIENTATION = '/';
export const DEFAULT_DIRECTION = 'F';
export const DEFAULT_NUMBER_OF_TURNS = 1;
export const ALLOWED_NUMBER_OF_TURNS = 3; // max turns a tablet can be given in one pick, forward or backward
// not currently using this but maybe will in future
export const ALLOWED_DIRECTIONS = [
	{
		'displayName': 'Forward',
		'value': 'F',
	},
	{
		'displayName': 'Backward',
		'value': 'B',
	},
];

export const DEFAULT_FREEHAND_CELL = {
	'direction': DEFAULT_DIRECTION,
	'threadColor': DEFAULT_COLOR,
	'threadShape': 'forwardWarp',
};

export const DEFAULT_HOLE_HANDEDNESS = 'clockwise';

// defaults for 3/1 broken twill
export const DEFAULT_TWILL_DIRECTION = 'S';
export const BROKEN_TWILL_THREADING = [
	['F', 'B', 'B', 'B'],
	['F', 'F', 'B', 'F'],
	['B', 'F', 'F', 'F'],
	['B', 'B', 'F', 'B'],
];
export const BROKEN_TWILL_FOREGROUND = 1;
export const BROKEN_TWILL_BACKGROUND = 3;
// turning sequence for an individual tablet to weave background twill
export const BROKEN_TWILL_SEQUENCE = ['F', 'F', 'B', 'B'];

export const COLORS_IN_COLOR_BOOK = 32;
export const DEFAULT_COLOR_BOOK_COLOR = '#aaa'; // if the default color has no saturation, clicking the vertical color bar in the color picker has no effect, which is confusing.
export const getRemoveColorBookMessage = (name) => {
	return `Do you want to delete the colour book "${name}"?`;
};

export const EMPTY_HOLE_COLOR = '#fff'; // used in weaving chart when multiple turns and an empty hole
export const DEFAULT_WEFT_COLOR = 3;
export const ALLOWED_PREVIEW_ORIENTATIONS = [
	{
		'text': 'Up',
		'value': 'up',
	},
	{
		'text': 'Left',
		'value': 'left',
	},
	{
		'text': 'Right',
		'value': 'right',
	},
];

// PREVIEW_WIDTH, PREVIEW_HEIGHT must match
// $pattern-summary-preview-height, $pattern-summary-preview-width
// in variables.scss
export const PREVIEW_WIDTH = 270;
export const PREVIEW_HEIGHT = 112;
export const PREVIEW_SCALE = 2;
export const MAX_PICKS_IN_REPEAT = 24;

export const MAX_RECENTS = 50;

export const iconColors = {
	'default': '#7580ac',
	'contrast': '#fff',
};

export const ROLES = [
	'registered',
	'verified',
	'premium',
	'administrator', // does not get a database allowance. Gets the ability to add and remove users from roles.
];

export const ROLE_LIMITS = {
	'registered': {
		'maxColorBooksPerUser': 1,
		'maxPatternsPerUser': 1,
		'maxImagesPerPattern': 0,
	},
	'verified': {
		'maxColorBooksPerUser': 5,
		'maxPatternsPerUser': 100,
		'maxImagesPerPattern': 5,
	},
	'premium': {
		'maxColorBooksPerUser': 20,
		'maxPatternsPerUser': 300,
		'maxImagesPerPattern': 10,
	},
};

export const MAX_TEXT_AREA_LENGTH = 5000; // max length of a user-editable text area field such as user description
export const MAX_TEXT_INPUT_LENGTH = 256; // max length of a user-editable text input field such as pattern name

export const NUMBER_OF_ACTIONS_LOGGED = 20;
export const PATTERN_IMAGES_KEY = 'test/'; // this is a pseudo-folder that namespaces the pattern images. In the current live version it would be '' but here we are namespacing for testing.

export const SEARCH_LIMIT = 10; // number of results to return
export const SEARCH_MORE = 10; // show this many more when the user clicks 'show more...'

export const ITEMS_PER_PREVIEW_LIST = 10;

export const FLASH_MESSAGE_TEXTS = {
	'emailVerified': 'Your email address has been verified',
};

export const MAX_TAG_LENGTH = 32;
export const MIN_TAG_LENGTH = 3;

export const MAX_SETS = 100; // limit the number of sets a user can have
export const MAX_PATTERNS_IN_SET = 200; // limit the number of patterns that can be put in a set

// map from pattern data to human readable names
// for use in patterns downloaded as text
// and reimporting these
// these MUST NOT CHANGE as it will break pattern imports
export const PATTERN_AS_TEXT_FIELDS = [
	{
		'fieldName': 'description',
		'displayName': 'Description',
	},
	{
		'fieldName': 'holes',
		'displayName': 'Number of holes',
		'required': true,
	},
	{
		'fieldName': 'name',
		'displayName': 'Name',
		'required': true,
	},
	{
		'fieldName': 'numberOfRows',
		'displayName': 'Number of weaving rows',
		'required': true,
	},
	{
		'fieldName': 'numberOfTablets',
		'displayName': 'Number of tablets',
		'required': true,
	},
	{
		'fieldName': 'orientations',
		'displayName': 'Tablet orientations',
		'required': true,
	},
	{
		'fieldName': 'palette',
		'displayName': 'Colour palette',
		'required': true,
	},
	{
		'fieldName': 'patternDesign',
		'displayName': 'Pattern design',
		'required': true,
	},
	{
		'fieldName': 'patternType',
		'displayName': 'Pattern type',
		'required': true,
	},
	{
		'fieldName': 'tags',
		'displayName': 'Tags',
	},
	{
		'fieldName': 'threading',
		'displayName': 'Threading chart',
		'required': true,
	},
	{
		'fieldName': 'threadingNotes',
		'displayName': 'Threading notes',
	},
	{
		'fieldName': 'weavingNotes',
		'displayName': 'Weaving notes',
	},
	{
		'fieldName': 'weftColor',
		'displayName': 'Weft colour',
		'required': true,

	},
];
