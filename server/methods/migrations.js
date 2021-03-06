// methods to support migrations running on the client

import { check } from 'meteor/check';
import { Patterns } from '../../imports/modules/collection';

Meteor.methods({
	'migrations.runMigrations': function () { // tell the client whether to run migrations
		return process.env.MIGRATIONS === 'migrations';
	},
	// don't use publish, because it would interfere with the app's normal running by putting extra docs in minimongo
	'migrations.getPatternIds': function () { // tell the client whether to run migrations
		return Patterns.find(
			{},
			{ 'fields': { '_id': 1} },
		).fetch().map((pattern) => pattern._id);
	},
	'migrations.getPatternPreview': function (_id) { // tell the client whether to run migrations
		return Patterns.findOne(
			{ _id },
			{ 'fields': { 'auto_preview': 1 } },
		);
	},
	'migrations.deleteAutoPreview': function (_id) { // tell the client whether to run migrations
		Patterns.update({ _id }, { '$unset': { 'auto_preview': 1 } });
	},
});
