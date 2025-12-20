// Shared test helper functions for reuse across test files

import { expect } from 'chai';
import { Roles } from 'meteor/roles';
import { stubUser, callMethodWithUser } from './mockUser';
import { createPattern } from './testData';

/**
 * Test that a method requires authentication
 * @param {string} methodName - The Meteor method name
 * @param {*} args - Arguments to pass to the method
 */
export async function testRequiresAuth(methodName, ...args) {
  await expect(
    Meteor.callAsync(methodName, ...args)
  ).to.be.rejectedWith('-not-logged-in');
}

/**
 * Test that a method requires a specific role
 * @param {string} userId - User ID to test with
 * @param {string} roleName - Role to remove
 * @param {string} methodName - Method to call
 * @param {string} errorCode - Expected error code
 * @param {*} args - Method arguments
 */
export async function testRequiresRole(userId, roleName, methodName, errorCode, ...args) {
  await Roles.removeUsersFromRolesAsync([userId], [roleName]);
  await expect(
    callMethodWithUser(userId, methodName, ...args)
  ).to.be.rejectedWith(errorCode);
}

/**
 * Helper to setup user with specific role
 * @param {string} roleName - Role to assign
 * @returns {Object} User object with role assigned
 */
export async function setupUserWithRole(roleName) {
  const user = await stubUser();
  await Roles.createRoleAsync(roleName, { unlessExists: true });
  await Roles.addUsersToRolesAsync([user._id], [roleName]);
  return user;
}

/**
 * Create test patterns owned by other users
 * @param {number} count - Number of patterns to create
 * @returns {Array} Array of created pattern objects
 */
export async function createOtherUsersPatterns(count = 3) {
  const patterns = [];
  for (let i = 0; i < count; i += 1) {
    patterns.push(await createPattern({
      name: `Other Pattern ${i + 1}`,
      createdBy: `user_${i}`,
    }));
  }
  return patterns;
}
