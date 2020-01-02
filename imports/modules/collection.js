// Runs on both client and server
// search index
import { Index, MongoDBEngine, MinimongoEngine } from 'meteor/easy:search';

// schemas
import PatternsSchema from './schemas/patternsSchema';
import ColorBooksSchema from './schemas/colorBooksSchema';
import PatternPreviewsSchema from './schemas/patternPreviewsSchema';
import ActionsLogSchema from './schemas/actionsLogSchema';
import PatternImagesSchema from './schemas/patternImagesSchema';
import TagsSchema from './schemas/tagsSchema';

// Color books
export const ColorBooks = new Mongo.Collection('colorBooks');
ColorBooks.attachSchema(ColorBooksSchema);

// Patterns
export const Patterns = new Mongo.Collection('patterns');
Patterns.attachSchema(PatternsSchema);

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

			selector.createdBy = options.search.userId;
			//TO DO add public patterns
			//To DO is it meaningful to index the tags field, given it's an array?
			// find patterns by tag also
			// this is not as good as being able to build the foreign tag fields into the index
			// but there are likely to be fewer tags than patterns, and it should be quicker than doing the whole search as an aggregated regex. There is just one search to find matching tagIds.
			const searchTerm = searchObject.nameSort;
			const matchingTags = Tags.find({ 'name': { '$regex': searchTerm } }).fetch();
			//console.log('matchingTags', matchingTags);
			const matchingTagIds = matchingTags.map((tag) => tag._id);
			//console.log('matchingTagIds', matchingTagIds);
			//console.log('*** options', options);
			//const tags = Tags.find({ 'name': options.search });
			selector.$or.push({ 'tags': { '$in': matchingTagIds } });
			console.log('*** index selector', JSON.stringify(selector));
			return selector;
		},
		'beforePublish': (action, doc) => {
			if (doc.tags) {
				console.log('tags', doc.tags);
				doc.tagTexts = doc.tags.map((tagId) => Tags.findOne({ '_id': tagId }).name);
				console.log('tagTexts', doc.tagTexts);
			}
			return doc;
		},
		'transform': (doc) => {
			doc.type = 'pattern';
			return doc;
		},
	}),
	'permission': () => {
		return true;
	},
});
