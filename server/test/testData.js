// this is used to create patterns for publications test with a direct insert, not the Meteor method
// it must be updated to include all pattern fields

export const defaultPatternData = {
	'createdAt': new Date('Tue, 03 Mar 2020 17:58:05 GMT'),
	'createdBy': 'abc',
	'description': 'Description of a pattern',
	'holeHandedness': 'clockwise',
	'holes': 4,
	'includeInTwist': [true, true, true, true, true, true, true, true],
	'isPublic': false,
	'isTwistNeutral': false,
	'name': 'Pattern 1',
	'nameSort': 'pattern 1',
	'numberOfRows': 6,
	'numberOfTablets': 8,
	'orientations': ['\\', '\\', '\\', '\\', '\\', '\\', '\\', '\\'],
	'palette': ['#fff'],
	'patternDesign': {},
	'patternType': 'individual',
	'previewOrientation': 'up',
	'tags': [],
	'threadingNotes': 'Some threading notes',
	'threading': [[1]],
	'weavingNotes': 'Some weaving notes',
	'weftColor': 2,
	'willRepeat': false,
};

export const addPatternDataIndividual = {
	'holes': 4,
	'name': 'Pattern 1',
	'rows': 6,
	'tablets': 8,
	'patternType': 'individual',
};

export const defaultColorBookData = {
	'_id': 'hGyoeA5tfZ4MuwfLj',
	'name': 'Another book',
	'nameSort': 'another book',
	'createdAt': new Date('Tue, 03 Mar 2020 17:58:05 GMT'),
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

export const defaultPatternPreviewData = {
	'patternId': 'xxx',
	'uri': 'abc',
};

export const defaultPatternImageData = {
	'caption': 'An image',
	'createdAt': new Date('Tue, 03 Mar 2020 17:58:05 GMT'),
	'createdBy': 'abc',
	'height': 960,
	'key': 'abc',
	'patternId': 'xxx',
	'url': 'abc',
	'width': 340,
};

export const defaultSetData = {
	'createdAt': new Date('Tue, 03 Mar 2020 17:58:05 GMT'),
	'createdBy': 'abc',
	'description': 'Description of a set',
	'name': 'Set 1',
	'nameSort': 'set 1',
	'patterns': [],
	'publicPatternsCount': 0,
	'tags': [],
};
