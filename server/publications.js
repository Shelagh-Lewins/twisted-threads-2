import Patterns from '../imports/collection';

const patternPublishFields = {
	'name': 1,
};

Meteor.publish('patterns', (skip = 0, limit = 10) => 	Patterns.find({},
	{
		'fields': patternPublishFields,
		'skip': skip,
		'limit': limit,
	}));
