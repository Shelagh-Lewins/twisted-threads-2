import {
	ALLOWED_HOLES,
	ALLOWED_PATTERN_TYPES,
	MAX_ROWS,
	MAX_TABLETS,
} from '../../modules/parameters';

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
	return x >= -1; // -1 is empty hole, 0 + are colors
});
