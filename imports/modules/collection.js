// Runs on both client and server

export const ColorBooks = new Mongo.Collection('colorBooks');

export const Patterns = new Mongo.Collection('patterns');

export const PatternPreviews = new Mongo.Collection('patternPreviews');

// throttle specific server calls
// used by the server only so not publicshed
export const ActionsLog = new Mongo.Collection('ActionsLog');

// images uploaded by users for specific patterns
export const PatternImages = new Mongo.Collection('PatternImages');
