import Patterns from '../imports/collection';
import { ITEMS_PER_PAGE } from '../imports/parameters';

const patternsPublishFields = {
	'name': 1,
};

Meteor.publish('patterns', (skip = 0, limit = ITEMS_PER_PAGE) => Patterns.find({},
	{
		'fields': patternsPublishFields,
		'skip': skip,
		'limit': limit,
		'sort': { 'name': 1 },
	}));

const patternPublishFields = {
	'name': 1,
};

Meteor.publish('pattern', (_id = '') => Patterns.find({ _id },
	{
		'fields': patternPublishFields,
	}));
