// this is used to create patterns for publications test with a direct insert, not the Meteor method
// it must be updated to include all pattern fields

export const defaultPatternData = {
	'createdAt': new Date(),
	'createdBy': 'abc',
	'holes': 4,
	'isPublic': false,
	'name': 'Pattern 1',
	'nameSort': 'pattern 1',
	'patternType': 'individual',
	'rows': 6,
	'tablets': 8,
};
