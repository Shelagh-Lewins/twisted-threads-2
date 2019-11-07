import Patterns from '../imports/collection';
import { ITEMS_PER_PAGE } from '../imports/parameters';
// arrow functions lose "this" context
/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */

const patternsPublishFields = {
	'name': 1,
};

const raw = Patterns.rawCollection();
raw.findme = Meteor.wrapAsync(raw.find);

Meteor.publish('patternsraw', function() {
	const result = raw.findme({});
	console.log('*** result', result);
	return result;
});

Meteor.publish('patterns', (skip = 0, limit = ITEMS_PER_PAGE) => Patterns.find({},
	{
		'fields': patternsPublishFields,
		'skip': skip,
		'limit': limit,
		// 'sort': { 'name': 1 },
	}));

const patternPublishFields = {
	'name': 1,
};

// .collation({ locale: "en" }).sort({ name: 1 })

// example of how to stop subscription, e.g. if user logs out, but not sure it's necessary here
Meteor.publish('pattern', function (_id = undefined) {
	if (_id) {
		return Patterns.find(
			{ _id },
			{
				'fields': patternPublishFields,
			},
		);
	}
	return this.stop();
});
