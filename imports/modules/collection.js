// Runs on both client and server
// search index
import { Index, MongoDBEngine } from 'meteor/easy:search';

// schemas
import PatternsSchema from './schemas/patternsSchema';
import ColorBooksSchema from './schemas/colorBooksSchema';
import PatternPreviewsSchema from './schemas/patternPreviewsSchema';
import ActionsLogSchema from './schemas/actionsLogSchema';
import PatternImagesSchema from './schemas/patternImagesSchema';
import TagsSchema from './schemas/tagsSchema';
import {
	getPatternPermissionQuery,
	getUserPermissionQuery,
} from './permissionQueries';

// Color books
export const ColorBooks = new Mongo.Collection('colorBooks');
ColorBooks.attachSchema(ColorBooksSchema);

// Patterns
export const Patterns = new Mongo.Collection('patterns');
Patterns.attachSchema(PatternsSchema);
Patterns.before.insert((userId, pattern) => {
	pattern.createdAt = new Date();
});

Patterns.before.update((userId, doc, fieldNames, modifier, options) => {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
});

// Pattern preview
export const PatternPreviews = new Mongo.Collection('patternPreviews');
PatternPreviews.attachSchema(PatternPreviewsSchema);

// throttle specific server calls
// used by the server only so not published
export const ActionsLog = new Mongo.Collection('actionsLog');
ActionsLog.attachSchema(ActionsLogSchema);

// images uploaded by users for specific patterns
export const PatternImages = new Mongo.Collection('patternImages');
PatternImages.attachSchema(PatternImagesSchema);

// tags on patterns
export const Tags = new Mongo.Collection('tags');
Tags.attachSchema(TagsSchema);

// Search indexes
// On Client and Server
export const PatternsIndex = new Index({
	'collection': Patterns,
	'fields': ['nameSort'],
	'engine': new MongoDBEngine({
		'selector': function (searchObject, options, aggregation) {
			const selector = this.defaultConfiguration().selector(searchObject, options, aggregation);

			// find patterns by tag also
			// this is not as good as being able to build the foreign tag fields into the index
			// but there are likely to be fewer tags than patterns, and it should be quicker than doing the whole search as an aggregated regex. There is just one search to find matching tagIds.
			const searchTerm = searchObject.nameSort;
			const matchingTags = Tags.find({ 'name': { '$regex': searchTerm } }).fetch();
			const matchingTagIds = matchingTags.map((tag) => tag._id);
			selector.$or.push({ 'tags': { '$in': matchingTagIds } });

			const newSelector = {
				'$and': [
					getPatternPermissionQuery(),
					{
						'$or': selector.$or,
					},
				],
			};

			return newSelector;
		},
		'fields': (searchObject, options) => ({
			'_id': 1,
			'createdBy': 1,
			'name': 1,
			'numberOfTablets': 1,
			'nameSort': 1,
		}),
		'sort': () => ({ 'nameSort': 1 }),
		'beforePublish': (action, doc) => { // runs on the server and can therefore access Meteor.users without subscribing
			// we have already checked this is a public pattern, so it's OK to show the owner
			const user = Meteor.users.findOne({ '_id': doc.createdBy });
			doc.username = user.username;
			return doc;
		},
		'transform': (doc) => { // runs on the client
			doc.type = 'pattern';
			return doc;
		},
	}),
	'permission': () => true,
});

export const UsersIndex = new Index({
	'collection': Meteor.users,
	'fields': ['username'],
	'engine': new MongoDBEngine({
		'selector': function (searchObject, options, aggregation) {
			const selector = this.defaultConfiguration().selector(searchObject, options, aggregation);

			const newSelector = {
				// only return users with public patterns
				// or the current user
				'$and': [
					getUserPermissionQuery(),
					{
						'$or': selector.$or,
					},
				],
			};

			return newSelector;
		},
		'fields': (searchObject, options) => ({
			'_id': 1,
			'username': 1,
		}),
		'sort': () => ({ 'username': 1 }),
		'transform': (doc) => {
			doc.type = 'user';
			doc.name = doc.username;
			return doc;
		},
	}),
	'permission': () => true,
});
