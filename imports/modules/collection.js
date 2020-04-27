// Runs on both client and server
// search index
import { Index, MongoDBEngine } from 'meteor/easy:search';

// schemas
import PatternsSchema from './schemas/patternsSchema';
import ColorBooksSchema from './schemas/colorBooksSchema';
import FAQSchema from './schemas/faqSchema';
import PatternPreviewsSchema from './schemas/patternPreviewsSchema';
import ActionsLogSchema from './schemas/actionsLogSchema';
import PatternImagesSchema from './schemas/patternImagesSchema';
import TagsSchema from './schemas/tagsSchema';
import SetsSchema from './schemas/setsSchema';
import {
	getPatternPermissionQuery,
	getUserPermissionQuery,
} from './permissionQueries';

// Frequently Asked Questions
export const FAQ = new Mongo.Collection('faq');
FAQ.attachSchema(FAQSchema);

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

// pattern sets
export const Sets = new Mongo.Collection('sets');
Sets.attachSchema(SetsSchema);
Sets.before.insert((userId, set) => {
	set.createdAt = new Date();
});

Sets.before.update((userId, doc, fieldNames, modifier, options) => {
	modifier.$set = modifier.$set || {};
	modifier.$set.modifiedAt = new Date();
});

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
			const matchingTagNames = matchingTags.map((tag) => tag.name);
			selector.$or.push({ 'tags': { '$in': matchingTagNames } });

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

			if (user) {
				doc.username = user.username;
			}

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

export const SetsIndex = new Index({
	'collection': Sets,
	'fields': ['nameSort'],
	'engine': new MongoDBEngine({
		'selector': function (searchObject, options, aggregation) {
			const selector = this.defaultConfiguration().selector(searchObject, options, aggregation);

			// find sets by tag also, as per patterns
			const searchTerm = searchObject.nameSort;
			const matchingTags = Tags.find({ 'name': { '$regex': searchTerm } }).fetch();
			const matchingTagNames = matchingTags.map((tag) => tag.name);
			selector.$or.push({ 'tags': { '$in': matchingTagNames } });

			// should the user be able to see this set?
			// this is an expensive lookup, especially for sets containing a lot of patterns
			// it's possible aggregation would be faster, using the Meteor aggregation plugin
			// the only other option would be to store 'isPublic' as a property of each set and update it every time that a pattern is changed
			// at present, it seems better to do the work when users actually search
			const visiblePatternIds = Patterns.find(getPatternPermissionQuery()).map((pattern) => pattern._id);

			const newSelector = {
				'$and': [
					{ 'patterns': { '$elemMatch': { '$in': visiblePatternIds } } },
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
			'nameSort': 1,
			'patterns': 1,
		}),
		'sort': () => ({ 'nameSort': 1 }),
		'beforePublish': (action, doc) => { // runs on the server and can therefore access Meteor.users without subscribing
			// include the owner
			const user = Meteor.users.findOne({ '_id': doc.createdBy });

			if (user) {
				doc.username = user.username;
			}

			return doc;
		},
		'transform': (doc) => { // runs on the client
			doc.type = 'set';
			return doc;
		},
	}),
	'permission': () => true,
});