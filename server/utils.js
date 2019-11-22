export const nonEmptyStringCheck = Match.Where((x) => {
	check(x, String);
	return x !== '';
});
