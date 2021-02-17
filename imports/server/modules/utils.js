import {
	ColorBooks,
	Sets,
	PatternImages,
	Patterns,
} from '../../modules/collection';
import {
	ALLOWED_DIRECTIONS,
	ALLOWED_HOLES,
	ALLOWED_PATTERN_TYPES,
	BROKEN_TWILL_FOREGROUND,
	BROKEN_TWILL_BACKGROUND,
	BROKEN_TWILL_THREADING,
	DEFAULT_ORIENTATION,
	DEFAULT_PALETTE,
	DOUBLE_FACED_THREADING,
	DOUBLE_FACED_BACKGROUND,
	DOUBLE_FACED_FOREGROUND,
	MAX_ROWS,
	MAX_TABLETS,
	ROLE_LIMITS,
} from '../../modules/parameters';

const moment = require('moment');

// used to check parameters supplied to methods and publications
export const nonEmptyStringCheck = Match.Where((x) => {
	check(x, String);
	return x !== '';
});

export const validHolesCheck = Match.Where((x) => {
	check(x, Match.Integer);

	return ALLOWED_HOLES.indexOf(x) !== -1;
});

export const validRowsCheck = Match.Where((x) => {
	check(x, Match.Integer);

	return x >= 0 && x < MAX_ROWS;
});

export const validTabletsCheck = Match.Where((x) => {
	check(x, Match.Integer);

	return x >= 0 && x < MAX_TABLETS;
});

export const validPatternTypeCheck = Match.Where((x) => {
	check(x, String);
	const allowedType = ALLOWED_PATTERN_TYPES.find((type) => type.name === x);

	return typeof allowedType.name === 'string';
});

export const positiveIntegerCheck = Match.Where((x) => {
	check(x, Match.Integer);
	return x >= 0;
});

export const validPaletteIndexCheck = Match.Where((x) => {
	check(x, Match.Integer);
	return x >= -1 && x < DEFAULT_PALETTE.length; // -1 is empty hole, 0 + are colors
});

export const validDirectionCheck = Match.Where((x) => {
	check(x, String);
	const directionDefFound = ALLOWED_DIRECTIONS.find((directionDef) => directionDef.value === x);
	return typeof directionDefFound !== 'undefined';
});

export const validTwillChartCheck = Match.Where((x) => {
	check(x, String);

	const twillCharts = ['twillPatternChart', 'twillDirectionChangeChart'];
	return twillCharts.indexOf(x) !== -1;
});

// check whether the current logged in user can create a pattern
// this may be a new pattern, or a copy
export const checkUserCanCreatePattern = () => {
	let error;

	// user must be logged in
	if (!Meteor.userId()) {
		error = new Meteor.Error('add-pattern-not-logged-in', 'Unable to add pattern because the user is not logged in');
	// user must have role 'registered', which is automatically assigned when account is created
	} else if (!Roles.userIsInRole(Meteor.userId(), 'registered')) {
		error = new Meteor.Error('add-pattern-not-registered', 'Unable to add pattern because the user does not have role \'registered\'');
	} else {
		// user must not have reached the limit on number of patterns
		const numberOfPatterns = Patterns.find({ 'createdBy': Meteor.userId() }).count();

		const limits = [];
		Roles.getRolesForUser(Meteor.userId()).forEach((role) => {
			if (ROLE_LIMITS[role]) {
				limits.push(ROLE_LIMITS[role].maxPatternsPerUser);
			}
		});

		const limit = Math.max(...limits); // user can create the largest number of patterns of any role they have

		if (numberOfPatterns >= limit) {
			error = new Meteor.Error('add-pattern-too-many-patterns', 'Unable to add pattern because the user has reached the pattern limit');
		}
	}

	return {
		error,
		'value': !error,
	};
};

// check whether the current logged in user can add an image to a pattern
export const checkUserCanAddPatternImage = (patternId) => {
	let error;

	// user must be logged in
	if (!Meteor.userId()) {
		error = new Meteor.Error('add-pattern-image-not-logged-in', 'Unable to add pattern image because the user is not logged in');
	// user must have role 'registered', which is automatically assigned when account is created
	} else if (!Roles.userIsInRole(Meteor.userId(), 'registered')) {
		error = new Meteor.Error('add-pattern-image-not-logged-in', 'Unable to add pattern image because the user does not have role \'registered\'');
	} else {
		const pattern = Patterns.findOne({ '_id': patternId });

		if (!pattern) {
			error = new Meteor.Error('add-pattern-image-not-found', 'Unable to add pattern image because the pattern was not found');
		} else if (pattern.createdBy !== Meteor.userId()) {
			error = new Meteor.Error('add-pattern-image-not-created-by-user', 'Unable to add pattern image because the pattern was not created by the current logged in user');
		} else {
			// user must not have reached the limit on number of images for this pattern
			const numberOfImages = PatternImages.find({ patternId }).count();

			const limits = [];
			Roles.getRolesForUser(Meteor.userId()).forEach((role) => {
				if (ROLE_LIMITS[role]) {
					limits.push(ROLE_LIMITS[role].maxImagesPerPattern);
				}
			});

			const limit = Math.max(...limits); // user can create the largest number of images of any role they have

			if (numberOfImages >= limit) {
				error = new Meteor.Error('add-image-too-many-images', 'Unable to add image because the user has reached the image limit for the pattern');
			}
		}
	}

	return {
		error,
		'value': !error,
	};
};

// check whether the current logged in user can create a color book
// this may be a new color book, or a copy
export const checkCanCreateColorBook = () => {
	// user must be logged in
	let error;

	if (!Meteor.userId()) {
		error = new Meteor.Error('add-color-book-not-logged-in', 'Unable to add color book because the user is not logged in');
	} else if (!Roles.userIsInRole(Meteor.userId(), 'registered')) {
		// user must have role 'registered', which is automatically assigned when account is created
		error = new Meteor.Error('add-color-book-not-registered', 'Unable to add color book because the user does not have role \'registered\'');
	} else {
		// user must not have reached the limit on number of color books
		const numberOfColorBooks = ColorBooks.find({ 'createdBy': Meteor.userId() }).count();

		const limits = [];
		Roles.getRolesForUser(Meteor.userId()).forEach((role) => {
			if (ROLE_LIMITS[role]) {
				limits.push(ROLE_LIMITS[role].maxColorBooksPerUser);
			}
		});

		const limit = Math.max(...limits); // user can create the largest number of color books of any role they have

		if (numberOfColorBooks >= limit) {
			error = new Meteor.Error('add-color-book-too-many-color-books', 'Unable to add color book because the user has reached the color book limit');
		}
	}

	return {
		error,
		'value': !error,
	};
};

export const updatePublicPatternsCountForUser = (_id) => {
	const publicPatternsCount = Patterns.find(
		{
			'$and': [
				{ 'isPublic': { '$eq': true } },
				{ 'createdBy': _id },
			],
		},
	).count();

	Meteor.users.update(
		{ _id },
		{
			'$set': { 'publicPatternsCount': publicPatternsCount },
		},
	);
};

export const updatePublicPatternsCountForSet = (_id) => {
	const set = Sets.findOne({ _id });
	const publicPatternsCount = Patterns.find(
		{
			'$and': [
				{ 'isPublic': { '$eq': true } },
				{ '_id': { '$in': set.patterns } },
			],
		},
	).count();

	Sets.update(
		{ _id },
		{
			'$set': { 'publicPatternsCount': publicPatternsCount },
		},
	);
};

export const updatePublicColorBooksCount = (_id) => {
	const publicColorBooksCount = ColorBooks.find(
		{
			'$and': [
				{ 'isPublic': { '$eq': true } },
				{ 'createdBy': _id },
			],
		},
	).count();

	Meteor.users.update(
		{ _id },
		{
			'$set': { 'publicColorBooksCount': publicColorBooksCount },
		},
	);
};

// update the public sets count of a ser
export const updatePublicSetsCount = (userId) => {
	const publicSetsCount = Sets.find(
		{
			'$and': [
				{ 'publicPatternsCount': { '$gt': 0 } },
				{ 'createdBy': userId },
			],
		},
	).count();

	Meteor.users.update(
		{ '_id': userId },
		{
			'$set': { 'publicSetsCount': publicSetsCount },
		},
	);
};

// for an array of set ids, update the public set count of each owner
export const updateMultiplePublicSetsCount = (setIds) => {
	if (setIds) {
		setIds.forEach((setId) => {
			const set = Sets.findOne({ '_id': setId });
			if (set) {
				updatePublicSetsCount(set.createdBy);
			}
		});
	}
};

export const getTabletFilter = ({ filterMaxTablets, filterMinTablets }) => {
	check(filterMaxTablets, Match.Maybe(positiveIntegerCheck));
	check(filterMinTablets, Match.Maybe(positiveIntegerCheck));

	// max and min must be integers between 1 and MAX_TABLETS
	let min = 1;
	if (filterMinTablets) {
		min = Math.max(filterMinTablets, 1);
	}
	min = Math.min(min, MAX_TABLETS);

	let max = MAX_TABLETS;
	if (filterMaxTablets) {
		max = Math.min(filterMaxTablets, MAX_TABLETS);
	}
	max = Math.max(max, 1);

	return {
		'$and': [
			{ 'numberOfTablets': { '$gte': min } },
			{ 'numberOfTablets': { '$lte': max } },
		],
	};
};

export const setupOrientations = ({
	patternType,
	tablets,
}) => {
	// most patterns have tablets all oriented the same
	// default orientation
	const orientations = new Array(tablets).fill(DEFAULT_ORIENTATION);

	// double faced patterns have alternating orientation
	// set this so the point of a diamond can be woven in the middle
	if (patternType === 'doubleFaced') {
		for (let i = 0; i < tablets; i += 1) {
			if (i % 2 === 0) {
				orientations[i] = orientations[i] === '/' ? '\\' : '/';
			}
		}
	}

	return orientations;
};

export const setupDoubleFacedThreading = ({
	holes,
	numberOfTablets,
}) => {
	// double faced threading is set up with two colours in a repeating pattern
	// all tablets are the same

	const threadingForNewTablets = [];

	for (let i = 0; i < holes; i += 1) {
		const threadingForHole = [];

		for (let j = 0; j < numberOfTablets; j += 1) {
			const colorRole = DOUBLE_FACED_THREADING[i];

			threadingForHole.push(colorRole === 'F' ? DOUBLE_FACED_FOREGROUND : DOUBLE_FACED_BACKGROUND);
		}

		threadingForNewTablets.push(threadingForHole);
	}

	return threadingForNewTablets;
};

export const setupTwillThreading = ({
	holes,
	startTablet,
	numberOfTablets,
}) => {
	// broken twill threading is set up with two colours in a repeating pattern
	// this returns twill threading from a specified start tablet onwards
	// useful when inserting tablets; the return is all tablets from the insertion onwards

	const threadingForNewTablets = [];

	for (let i = 0; i < holes; i += 1) {
		const threadingForHole = [];

		for (let j = 0; j < numberOfTablets - startTablet; j += 1) {
			const positionInThreadingSequence = j + startTablet;
			const colorRole = BROKEN_TWILL_THREADING[i][positionInThreadingSequence % holes];

			threadingForHole.push(colorRole === 'F' ? BROKEN_TWILL_FOREGROUND : BROKEN_TWILL_BACKGROUND);
		}

		threadingForNewTablets.push(threadingForHole);
	}

	return threadingForNewTablets;
};

// build a string to be written to the Nginx log
// suitable for parsing by a fail2ban filter
// may be an error like login failure
// or an action we need to monitor like registering a new user
export const buildServerLogText = ((text) => {
	if (Meteor.isTest) {
		return `${moment(new Date()).format('YYYY/MM/DD HH:mm:ss')} ${text}, client: local.testing, host: "local.testing"`;
	}

	const connection = Meteor.call('auth.getClientConnection');

	return `${moment(new Date()).format('YYYY/MM/DD HH:mm:ss')} ${text}, client: ${connection.clientAddress}, host: "${connection.httpHeaders.host}"`;
});
