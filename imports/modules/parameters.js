// These parameters are available to client and server
// allowing for consistent validation

export const ALLOWED_ITEMS_PER_PAGE = [10, 15, 20, 25, 30, 35, 40];
export const USER_FIELDS = {
	_id: 1,
	description: 1,
	nameSort: 1,
	publicColorBooksCount: 1,
	publicPatternsCount: 1,
	publicSetsCount: 1,
	username: 1,
	weavingBackwardsBackgroundColor: 1,
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

export const DEFAULT_WEAVING_BACKWARDS_BACKGROUND_COLOR = '#aaa';

export const MAX_ROWS = 200;
export const MAX_TABLETS = 100;
export const HOLE_LABELS = ['A', 'B', 'C', 'D', 'E', 'F'];
export const ALLOWED_HOLES = [2, 4, 6];
export const DEFAULT_HOLES = 4;
export const ALLOWED_PATTERN_TYPES = [
	{
		// simulation pattern, woven by turning each tablet individually
		allowedHoles: [2, 4, 6], // although the select returns string, these must be number for server side validation
		displayName: 'Individual',
		name: 'individual',
		previewOrientation: 'right',
		tag: 'individual',
		templates: [
			{
				displayName: 'Basic',
				name: 'all-/-forward',
				orientations: ['/'],
				templateHint:
					'Basic template: a simple setup that can be easily used to create most types of pattern.',
				weavingChart: [
					[
						{
							direction: 'F',
							numberOfTurns: 1,
						},
					],
				],
			},
			{
				displayName: 'Idle packs',
				name: 'idle-packs',
				allowedHoles: [4], // only 4-hole tablets
				orientations: ['/', '\\'],
				templateHint:
					'Idle packs template: setup for "Cambridge diamonds" with alternating tablets turned every other pick.',
				weavingChart: [
					[
						{
							direction: 'F',
							numberOfTurns: 1,
						},
						{
							direction: 'F',
							numberOfTurns: 0,
						},
					],
					[
						{
							direction: 'F',
							numberOfTurns: 0,
						},
						{
							direction: 'F',
							numberOfTurns: 1,
						},
					],
				],
			},
		],
		typeHint:
			'Set the turning direction and number of turns for each tablet individually.',
	},
	{
		// simulation pattern, woven by turning all tablets together
		allowedHoles: [2, 4, 6],
		displayName: 'All together',
		name: 'allTogether',
		previewOrientation: 'right',
		tag: 'all together',
		typeHint:
			'Turn all tablets together each pick, either forwards or backwards.',
	},
	{
		// double faced, designed on special graph paper
		allowedHoles: [4],
		displayName: 'Double faced',
		name: 'doubleFaced',
		previewOrientation: 'up',
		tag: 'double faced',
		typeHint: 'Weave a double-faced band in two colours.',
	},
	{
		// 3 / 1 broken twill, designed on special graph paper
		allowedHoles: [4],
		displayName: '3/1 broken twill',
		name: 'brokenTwill',
		previewOrientation: 'up',
		tag: '3/1 broken twill',
		typeHint:
			'Weave a double-faced band in two colours, using offset floats to create a diagonal texture.',
	},
	{
		// threading is standard, but the weaving chart is hand drawn
		// and can have errors
		// best for warp pickup patterns and brocade
		allowedHoles: [2, 4, 6],
		displayName: 'Freehand',
		name: 'freehand',
		previewOrientation: 'right',
		tag: 'freehand',
		typeHint:
			'Draw the weaving chart freehand; errors will not be corrected. Ideal for brocade and warp pickup patterns.',
	},
];
export const findPatternTypeDisplayName = (patternType) =>
	ALLOWED_PATTERN_TYPES.find((type) => type.name === patternType).displayName;

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
		displayName: 'Forward',
		value: 'F',
	},
	{
		displayName: 'Backward',
		value: 'B',
	},
];

export const DEFAULT_FREEHAND_CELL = {
	direction: DEFAULT_DIRECTION,
	threadColor: DEFAULT_COLOR,
	threadShape: 'forwardWarp',
};

export const DEFAULT_HOLE_HANDEDNESS = 'clockwise';

// defaults for double faced patterns
// tablets are oriented as repeating pairs
export const DOUBLE_FACED_ORIENTATIONS = [
	{
		name: '/\\',
		displayName: 'Alternating / \\',
	},
	{
		name: '\\/',
		displayName: 'Alternating \\ /',
	},
	{
		name: '//',
		displayName: 'All /',
	},
	{
		name: '\\\\',
		displayName: 'All \\',
	},
];
export const DOUBLE_FACED_THREADING = ['F', 'F', 'B', 'B'];
export const DOUBLE_FACED_FOREGROUND = 1;
export const DOUBLE_FACED_BACKGROUND = 3;
// turning sequence for an individual tablet to weave background double faced
export const DOUBLE_FACED_SEQUENCE = ['F', 'F', 'B', 'B'];

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
		text: 'Up',
		value: 'up',
	},
	{
		text: 'Left',
		value: 'left',
	},
	{
		text: 'Right',
		value: 'right',
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
	default: '#7580ac',
	contrast: '#fff',
};

export const ROLES = [
	'registered',
	'verified',
	'premium',
	'administrator', // does not get a database allowance. Gets the ability to add and remove users from roles.
	'serviceUser', // there should only be one service user
	// The service user should only be used for scripted actions, in particular pattern preview generation, because it can view (but not modify) any pattern.
	// Like an administrator, it does not get a database allowance.
];

export const ROLE_LIMITS = {
	registered: {
		maxColorBooksPerUser: 1,
		maxPatternsPerUser: 1,
		maxImagesPerPattern: 0,
	},
	verified: {
		maxColorBooksPerUser: 5,
		maxPatternsPerUser: 100,
		maxImagesPerPattern: 5,
	},
	premium: {
		maxColorBooksPerUser: 20,
		maxPatternsPerUser: 300,
		maxImagesPerPattern: 10,
	},
};

export const MAX_TEXT_AREA_LENGTH = 10000; // max length of a user-editable text area field such as user description
export const MAX_TEXT_INPUT_LENGTH = 256; // max length of a user-editable text input field such as pattern name

export const NUMBER_OF_ACTIONS_LOGGED = 20;

export const SEARCH_LIMIT = 10; // number of results to return
export const SEARCH_MORE = 10; // show this many more when the user clicks 'show more...'

export const ITEMS_PER_PREVIEW_LIST = 10;

export const FLASH_MESSAGE_TEXTS = {
	emailVerified: 'Your email address has been verified',
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
		fieldName: 'description',
		displayName: 'Description',
	},
	{
		fieldName: 'holes',
		displayName: 'Number of holes',
		required: true,
	},
	{
		fieldName: 'includeInTwist',
		displayName: 'Include in twist calculations',
	},
	{
		fieldName: 'name',
		displayName: 'Name',
		required: true,
	},
	{
		fieldName: 'numberOfRows',
		displayName: 'Number of weaving rows',
		required: true,
	},
	{
		fieldName: 'numberOfTablets',
		displayName: 'Number of tablets',
		required: true,
	},
	{
		fieldName: 'orientations',
		displayName: 'Tablet orientations',
		required: true,
	},
	{
		fieldName: 'palette',
		displayName: 'Colour palette',
		required: true,
	},
	{
		fieldName: 'patternDesign',
		displayName: 'Pattern design',
		required: true,
	},
	{
		fieldName: 'patternType',
		displayName: 'Pattern type',
		required: true,
	},
	{
		fieldName: 'tags',
		displayName: 'Tags',
	},
	{
		fieldName: 'threading',
		displayName: 'Threading chart',
		required: true,
	},
	{
		fieldName: 'threadingNotes',
		displayName: 'Threading notes',
	},
	{
		fieldName: 'weavingNotes',
		displayName: 'Weaving notes',
	},
	{
		fieldName: 'weftColor',
		displayName: 'Weft colour',
		required: true,
	},
];
