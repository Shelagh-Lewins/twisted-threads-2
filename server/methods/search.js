import { check } from 'meteor/check';
import { nonEmptyStringCheck } from '../../imports/server/modules/utils';
import { Patterns } from '../../imports/modules/collection';
//TO DO only return patterns, users, that should be visible
//check how I did search before
Meteor.methods({
	'search.searchStart': function (searchTerm) {
		check(searchTerm, nonEmptyStringCheck);
console.log('searchTerm', searchTerm);
// works but only matches whole words
		const query = { '$text': { '$search': searchTerm } };
console.log('user', Meteor.userId());
		if (Meteor.userId()) {
			query.$or = [
				{ 'isPublic': { '$eq': true } },
				{ 'createdBy': this.userId },
			];
		} else {
			query.isPublic = { '$eq': true };
		}
		const result = Patterns.find(
			query,
		).fetch();
		console.log('result', result);
		return result;
	},
});
