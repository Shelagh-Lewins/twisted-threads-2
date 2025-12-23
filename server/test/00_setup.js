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
import { Roles } from 'meteor/roles';
import { ROLES } from '../../imports/modules/parameters';
import { asyncForEach } from '../../imports/server/modules/utils';

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

// Re-create all roles after resetDatabase to ensure roles exist for tests
export async function ensureAllRolesExist() {
  await asyncForEach(ROLES, async (role) => {
    if (Roles && typeof Roles.createRoleAsync === 'function') {
      await Roles.createRoleAsync(role, { unlessExists: true });
    } else if (Roles && typeof Roles.createRole === 'function') {
      Roles.createRole(role, { unlessExists: true });
    }
  });
}

// Make resetDatabase and ensureAllRolesExist globally available for backwards compatibility
if (typeof global !== 'undefined') {
  global.resetDatabase = resetDatabase;
  global.ensureAllRolesExist = ensureAllRolesExist;
}
