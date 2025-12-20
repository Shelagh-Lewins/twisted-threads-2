// Test setup file - custom resetDatabase implementation for Meteor 3
// Replaces xolvio:cleaner which has Meteor 2 dependencies

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  Patterns,
  Sets,
  Tags,
  ColorBooks,
  FAQ,
  ActionsLog,
  PatternPreviews,
  PatternImages,
} from '../../imports/modules/collection';

// Configure chai to use chai-as-promised for async assertions
chai.use(chaiAsPromised);

// Custom resetDatabase function to replace xolvio:cleaner
// This simply removes all documents from test collections
export async function resetDatabase() {
  const collections = [
    Patterns,
    Sets,
    Tags,
    ColorBooks,
    FAQ,
    ActionsLog,
    PatternPreviews,
    PatternImages,
    Meteor.users,
    Meteor.roleAssignment,
    Meteor.roles,
  ];

  for (const collection of collections) {
    if (collection && typeof collection.removeAsync === 'function') {
      await collection.removeAsync({});
    }
  }
}

// Make resetDatabase globally available for backwards compatibility
if (typeof global !== 'undefined') {
  global.resetDatabase = resetDatabase;
}
