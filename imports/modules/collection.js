// Runs on both client and server
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
/* import { Index, MongoDBEngine } from 'meteor/easy:search';
// On Client and Server

export const PatternsIndex = new Index({
	'collection': Patterns,
	'fields': ['nameSort'],
	'engine': new MongoDBEngine(),
	selector(searchDefinition, options, aggregation) {
		// retrieve the default selector
		const selector = this.defaultConfiguration()
			.selector(searchObject, options, aggregation);

		// options.search.userId contains the userId of the logged in user
		console.log('selector', selector);
		selector.createdBy = options.search.userId;

		return selector;
	},
	// 'permission': (options) => options.userId, // only allow searching when the user is logged in
}); */
