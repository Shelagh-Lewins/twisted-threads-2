// Test setup file - custom resetDatabase implementation for Meteor 3
// Replaces xolvio:cleaner which has Meteor 2 dependencies

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import sinon from 'sinon';
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

// Global stub for email sending to prevent actual emails in tests
// This avoids SMTP authentication errors and speeds up test execution
let sendVerificationEmailStub;

before(function () {
  // Stub at the start of all tests
  sendVerificationEmailStub = sinon
    .stub(Accounts, 'sendVerificationEmail')
    .callsFake(async (userId) => {
      // Return a realistic response
      const user = await Meteor.users.findOneAsync({ _id: userId });
      return {
        email: user?.emails?.[0]?.address || 'test@example.com',
      };
    });
});

after(function () {
  // Restore after all tests
  if (sendVerificationEmailStub) {
    sendVerificationEmailStub.restore();
  }
});
