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

export const MAX_ROWS = 100;
export const MAX_TABLETS = 100;
export const ALLOWED_HOLES = [2, 4, 6]; // permittied number of holes per tablet
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

export const COLORS_IN_COLOR_BOOK = 36;
export const DEFAULT_COLOR_BOOK_COLOR = '#aa0000'; // if the default color has no saturation, clicking the vertical color bar in the color picker has no effect, which is confusing.
