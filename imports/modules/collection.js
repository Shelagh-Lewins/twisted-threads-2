// Runs on both client and server
// search handled by server publications (see imports/server/searchPublications.js)

// schemas
import { Mongo } from 'meteor/mongo';
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
  getSetPermissionQuery,
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

// Search is now handled by server publications in `imports/server/searchPublications.js`
// (see `search.patterns`, `search.users`, `search.sets`).
