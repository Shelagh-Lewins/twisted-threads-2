/* eslint-env mocha */
// general tests for pattern methods

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import { Patterns } from '../../imports/modules/collection';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import '../methods/pattern';
import '../methods/tags';
import { ROLE_LIMITS } from '../../imports/modules/parameters';
import { stubUser, unwrapUser } from './mockUser';
import {
	addPatternDataIndividual,
} from './testData';
import createManyPatterns from './createManyPatterns';

if (Meteor.isServer) {
	describe('test general methods for patterns', function () { // eslint-disable-line func-names
		this.timeout(30000);
		beforeEach(() => {
			resetDatabase();
		});
		describe('pattern.add method', () => {
			it('cannot create pattern if not logged in', () => {
				function expectedError() {
					Meteor.call('pattern.add', addPatternDataIndividual);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-pattern-not-logged-in');
			});
			it('cannot create pattern if not registered', () => {
				stubUser();
				Roles.removeUsersFromRoles(Meteor.userId(), ['registered']);

				function expectedError() {
					Meteor.call('pattern.add', addPatternDataIndividual);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-pattern-not-registered');
				unwrapUser();
			});
			it('can create the correct number of patterns if not verified', () => {
				stubUser();

				const patternLimit = ROLE_LIMITS.registered.maxPatternsPerUser;
				for (let i = 0; i < patternLimit; i += 1) {
					Meteor.call('pattern.add', addPatternDataIndividual);
				}

				assert.equal(Patterns.find().fetch().length, patternLimit);

				function expectedError() {
					Meteor.call('pattern.add', addPatternDataIndividual);
				}

				expect(expectedError).to.throw(Meteor.Error(), 'add-pattern-too-many-patterns');
				unwrapUser();
			});
			it('can create the correct number of patterns if verified', () => {
				const currentUser = stubUser();

				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['verified']);

				const patternLimit = ROLE_LIMITS.verified.maxPatternsPerUser;
				for (let i = 0; i < patternLimit; i += 1) {
					Meteor.call('pattern.add', addPatternDataIndividual);
				}

				assert.equal(Patterns.find().fetch().length, patternLimit);

				function expectedError() {
					Meteor.call('pattern.add', addPatternDataIndividual);
				}

				expect(expectedError).to.throw(Meteor.Error(), 'add-pattern-too-many-patterns');
				unwrapUser();
			});
			it('can create the correct number of patterns if premium', () => {
				const currentUser = stubUser();

				Roles.createRole('premium', { 'unlessExists': true });
				Roles.addUsersToRoles(currentUser._id, ['premium']);

				const patternLimit = ROLE_LIMITS.premium.maxPatternsPerUser;
				for (let i = 0; i < patternLimit; i += 1) {
					Meteor.call('pattern.add', addPatternDataIndividual);
				}

				assert.equal(Patterns.find().fetch().length, patternLimit);

				function expectedError() {
					Meteor.call('pattern.add', addPatternDataIndividual);
				}

				expect(expectedError).to.throw(Meteor.Error(), 'add-pattern-too-many-patterns');
				unwrapUser();
			});
		});
		describe('pattern.remove method', () => {
			it('cannot remove pattern if not logged in', () => {
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

				function expectedError() {
					Meteor.call('pattern.remove', pattern._id);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-pattern-not-logged-in');
			});
			it('cannot remove pattern if did not create the pattern', () => {
				function expectedError() {
					stubUser();

					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

					Meteor.call('pattern.remove', pattern._id);
				}

				expect(expectedError).to.throw(Meteor.Error(), 'remove-pattern-not-created-by-user');
				unwrapUser();
			});
			it('can remove pattern if user created the pattern', () => {
				const currentUser = stubUser();
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });

				assert.equal(Patterns.find().fetch().length, 1);
				Meteor.call('pattern.remove', pattern._id);
				assert.equal(Patterns.find().fetch().length, 0);
				unwrapUser();
			});
		});
		describe('pattern.getPatternCount method', () => {
			// getPatternCount should count the patterns the user can see, for pagination.
			it('returns 0 when the user is not logged in', () => {
				// create patterns owned by other users
				Factory.create('pattern', { 'name': 'Other Pattern 1', 'createdBy': 'abc' });
				Factory.create('pattern', { 'name': 'Other Pattern 2', 'createdBy': 'def' });
				Factory.create('pattern', { 'name': 'Other Pattern 3', 'createdBy': 'ghic' });

				const result = Meteor.call('pattern.getPatternCount', {});
				assert.equal(result, 0);
			});
			it('returns 2 when the user has 2 patterns in the database', () => {
				// create patterns owned by other users
				Factory.create('pattern', { 'name': 'Other Pattern 1', 'createdBy': 'abc' });
				Factory.create('pattern', { 'name': 'Other Pattern 2', 'createdBy': 'def' });
				Factory.create('pattern', { 'name': 'Other Pattern 3', 'createdBy': 'ghic' });

				// create patterns owned by the current user
				const currentUser = stubUser();
				Factory.create('pattern', { 'name': 'My Pattern 1', 'createdBy': currentUser._id });
				Factory.create('pattern', { 'name': 'My Pattern 2', 'createdBy': currentUser._id });

				const result = Meteor.call('pattern.getPatternCount', {});
				assert.equal(result, 2);
				unwrapUser();
			});
			it('returns the user\'s own patterns plus public patterns', () => {
				stubUser();
				const {
					publicMyPatternNames,
					privateMyPatternNames,
					publicOtherPatternNames,
				} = createManyPatterns();

				const result = Meteor.call('pattern.getPatternCount', {});
				const expectedNumber = publicMyPatternNames.length
				+ privateMyPatternNames.length
				+ publicOtherPatternNames.length;
				assert.equal(result, expectedNumber);
				unwrapUser();
			});
		});
	});
}
