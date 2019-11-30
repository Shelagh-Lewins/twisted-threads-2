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
export const DEFAULT_COLOR_BOOK_COLOR = '#aa0000'; // if the default color has no saturation, clicking the vertical color bar in the color picker has no effect, which is confusing.
export const EMPTY_HOLE_COLOR = '#fff'; // used in weaving chart when multiple turns and an empty hole
export const DEFAULT_WEFT_COLOR = '#999';

export const MAX_RECENTS = 50;
