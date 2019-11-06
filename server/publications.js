import Patterns from '../imports/collection';

const patternPublishFields = {
	'name': 1,
};

Meteor.publish('getPatterns', (pageSkip = 0) => 	Patterns.find({},
	{
		'fields': patternPublishFields,
		'skip': pageSkip,
		'limit': 10,
	}));
