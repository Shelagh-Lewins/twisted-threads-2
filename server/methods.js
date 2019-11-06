import { check } from 'meteor/check';
import Patterns from '../imports/collection';

Meteor.methods({
	addPattern(name) {
		check(name, String);

		const patterns = Patterns.insert({
			name,
		});
		return patterns;
	},
	removePattern(_id) {
		check(_id, String);

		const patterns = Patterns.remove({
			_id,
		});
		return patterns;
	},
	getPatternCount() {
		return Patterns.find().count();
	},
});
