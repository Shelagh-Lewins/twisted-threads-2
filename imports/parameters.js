// These parameters are available to client and server
// allowing for consistent validation

export const ITEMS_PER_PAGE = 10;

export const DEFAULT_PALETTE = [
	'#ffffff',
	'#cc0000',
	'#ffd966',
	'#1c4587',
	'#6aa84f',
	'#783f04',
	'#ffffff',
	'#ffffff',
	'#ffffff',
	'#ffffff',
	'#ffffff',
	'#ffffff',
	'#ffffff',
	'#ffffff',
	'#ffffff',
	'#ffffff',
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
