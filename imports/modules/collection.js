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
