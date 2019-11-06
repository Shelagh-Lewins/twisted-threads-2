import Patterns from '../imports/collection';
import { ITEMS_PER_PAGE } from '../imports/parameters';

const patternPublishFields = {
	'name': 1,
};

Meteor.publish('patterns', (skip = 0, limit = ITEMS_PER_PAGE) => 	Patterns.find({},
	{
		'fields': patternPublishFields,
		'skip': skip,
		'limit': limit,
	}));
