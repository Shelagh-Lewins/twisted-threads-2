// this is used to create patterns for publications test with a direct insert, not the Meteor method
// it must be updated to include all pattern fields

export const defaultPatternData = {
	'createdAt': new Date(),
	'createdBy': 'abc',
	'holes': 4,
	'isPublic': false,
	'name': 'Pattern 1',
	'nameSort': 'pattern 1',
	'orientations': ['\\', '\\', '\\', '\\', '\\', '\\', '\\', '\\'],
	'patternDesign': '', // not a valid value, just here to test publication
	'patternType': 'individual',
	'rows': 6,
	'tablets': 8,
};

export const defaultColorBookData = {
	'_id': 'hGyoeA5tfZ4MuwfLj',
	'name': 'Another book',
	'nameSort': 'another book',
	'createdAt': new Date(),
	'createdBy': 'Mh27efDaNFq7xzPjB',
	'colors': [
		'#aa1122',
		'#aa2233',
		'#aa3344',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
		'#aa0000',
	],
	'isPublic': false,
};
