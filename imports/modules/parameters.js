// These parameters are available to client and server
// allowing for consistent validation

export const ITEMS_PER_PAGE = 10;

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
		'simulation': true,
	},
	{ // simulation pattern, woven by turning all tablets together
		'name': 'allTogether',
		'displayName': 'All together',
		'simulation': true,
	},
	// TODO build and add freehand, allTogether, packs, 3-1-broken-twill
];
export const DEFAULT_COLOR = 3; // default thread color is different from that selected in palette, so that users will see something happen if they click on the threading chart
export const DEFAULT_TABLETS = 8;
export const DEFAULT_ROWS = 10;
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

export const COLORS_IN_COLOR_BOOK = 24;
export const DEFAULT_COLOR_BOOK_COLOR = '#aaa'; // if the default color has no saturation, clicking the vertical color bar in the color picker has no effect, which is confusing.
export const EMPTY_HOLE_COLOR = '#fff'; // used in weaving chart when multiple turns and an empty hole
export const DEFAULT_WEFT_COLOR = 3;
export const DEFAULT_PREVIEW_ORIENTATION = 'right';
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
export const MAX_PICKS_IN_REPEAT = 12;

export const MAX_RECENTS = 50;

export const iconColors = {
	'default': '#7580ac',
	'contrast': '#fff',
};

export const ROLES = [
	'registered',
	'verified',
	'premium',
];

export const ROLE_LIMITS = {
	'registered': {
		'maxColorBooksPerUser': 1,
		'maxPatternsPerUser': 10,
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
export const NUMBER_OF_ACTIONS_LOGGED = 10;
export const PATTERN_IMAGES_KEY = 'test/'; // this is a pseudo-folder that namespaces the pattern images. In the current live version it would be '' but here we are namespacing for testing.
