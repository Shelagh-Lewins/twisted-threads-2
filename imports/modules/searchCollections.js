import { Mongo } from 'meteor/mongo';

// Dedicated client-side collections for search results
// These collections are isolated from the main Patterns, Sets, and Meteor.users collections
// to prevent contamination from other subscriptions
export const SearchPatterns = new Mongo.Collection('searchPatterns');
export const SearchSets = new Mongo.Collection('searchSets');
export const SearchUsers = new Mongo.Collection('searchUsers');
