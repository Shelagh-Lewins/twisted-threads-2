/* eslint-env mocha */

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

if (Meteor.isServer) {
	describe('test methods for patterns', function () { // eslint-disable-line func-names
		this.timeout(10000);
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
		describe('pattern.editThreadingCell method', () => {
			it('cannot edit threading cell if not logged in', () => {
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

				function expectedError() {
					Meteor.call('pattern.editThreadingCell', {
						'_id': pattern._id,
						'hole': 0,
						'tablet': 0,
						'value': 5,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-threading-not-logged-in');
			});
			it('cannot edit threading cell if did not create the pattern', () => {
				function expectedError() {
					stubUser();

					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

					Meteor.call('pattern.editThreadingCell', {
						'_id': pattern._id,
						'hole': 0,
						'tablet': 0,
						'value': 5,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'edit-threading-not-created-by-user');
				unwrapUser();
			});
			it('cannot edit threading cell if user created the pattern but hole, tablet are invalid', () => {
				function expectedError() {
					const currentUser = stubUser();
					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });
					Meteor.call('pattern.editThreadingCell', {
						'_id': pattern._id,
						'hole': -1, // invalid
						'tablet': -1, // invalid
						'value': 5,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'Match error');

				unwrapUser();
			});
			it('can edit threading cell if user created the pattern', () => {
				const currentUser = stubUser();
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });

				assert.equal(Patterns.find().fetch().length, 1);
				// set to palette index 5
				Meteor.call('pattern.editThreadingCell', {
					'_id': pattern._id,
					'hole': 0,
					'tablet': 2,
					'value': 5,
				});
				assert.equal(Patterns.find().fetch().length, 1);
				const patternUpdated = Patterns.findOne({ '_id': pattern._id });
				assert.equal(patternUpdated.threading[0][2], 5);

				// set to empty hole
				Meteor.call('pattern.editThreadingCell', {
					'_id': pattern._id,
					'hole': 1,
					'tablet': 3,
					'value': -1,
				});
				assert.equal(Patterns.find().fetch().length, 1);
				const patternUpdated2 = Patterns.findOne({ '_id': pattern._id });
				assert.equal(patternUpdated2.threading[1][3], -1);

				unwrapUser();
			});
		});
		describe('pattern.editOrientation method', () => {
			it('cannot edit tablet orientation if not logged in', () => {
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

				function expectedError() {
					Meteor.call('pattern.editOrientation', {
						'_id': pattern._id,
						'tablet': 0,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-orientation-not-logged-in');
			});
			it('cannot edit tablet orientation if did not create the pattern', () => {
				function expectedError() {
					stubUser();

					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

					Meteor.call('pattern.editOrientation', {
						'_id': pattern._id,
						'tablet': 0,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'edit-orientation-not-created-by-user');
				unwrapUser();
			});
			it('cannot edit tablet orientation if user created the pattern but tablet is invalid', () => {
				function expectedError() {
					const currentUser = stubUser();
					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });
					Meteor.call('pattern.editOrientation', {
						'_id': pattern._id,
						'tablet': -1,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'Match error');

				unwrapUser();
			});
			it('can edit tablet orientation if user created the pattern', () => {
				const currentUser = stubUser();
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });

				assert.equal(Patterns.find().fetch().length, 1);

				Meteor.call('pattern.editOrientation', {
					'_id': pattern._id,
					'tablet': 0,
				});
				assert.equal(Patterns.find().fetch().length, 1);
				const patternUpdated = Patterns.findOne({ '_id': pattern._id });

				assert.equal(patternUpdated.orientations[0], '/');

				unwrapUser();
			});
		});
		describe('pattern.editPaletteColor method', () => {
			it('cannot edit palette color if not logged in', () => {
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

				function expectedError() {
					Meteor.call('pattern.editPaletteColor', {
						'_id': pattern._id,
						'colorHexValue': '#000',
						'colorIndex': 1,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-palette-color-not-logged-in');
			});
			it('cannot edit palette color if did not create the pattern', () => {
				function expectedError() {
					stubUser();

					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': 'abc' });

					Meteor.call('pattern.editPaletteColor', {
						'_id': pattern._id,
						'colorHexValue': '#000',
						'colorIndex': 1,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'edit-palette-color-not-created-by-user');
				unwrapUser();
			});
			it('cannot edit palette color if user created the pattern but color is invalid', () => {
				function expectedError() {
					const currentUser = stubUser();
					const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });
					Meteor.call('pattern.editPaletteColor', {
						'_id': pattern._id,
						'colorHexValue': 4,
						'colorIndex': 1,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'Match error');

				unwrapUser();
			});
			it('can edit palette color if user created the pattern', () => {
				const currentUser = stubUser();
				const pattern = Factory.create('pattern', { 'name': 'Pattern 1', 'createdBy': currentUser._id });

				assert.equal(Patterns.find().fetch().length, 1);

				Meteor.call('pattern.editPaletteColor', {
					'_id': pattern._id,
					'colorHexValue': '#000',
					'colorIndex': 1,
				});
				assert.equal(Patterns.find().fetch().length, 1);
				const patternUpdated = Patterns.findOne({ '_id': pattern._id });

				assert.equal(patternUpdated.palette[1], '#000');

				unwrapUser();
			});
		});
		describe('pattern.getPatternCount method', () => {
			it('returns 0 when the user is not logged in', () => {
				// getPatternCount should count the patterns the user can see, for pagination.

				// create patterns owned by other users
				Factory.create('pattern', { 'name': 'Other Pattern 1', 'createdBy': 'abc' });
				Factory.create('pattern', { 'name': 'Other Pattern 2', 'createdBy': 'def' });
				Factory.create('pattern', { 'name': 'Other Pattern 3', 'createdBy': 'ghic' });

				const result = Meteor.call('pattern.getPatternCount');
				assert.equal(result, 0);
			});
			it('returns 2 when the user has 2 patterns in the database', () => {
				// getPatternCount should count the patterns the user can see, for pagination.

				// create patterns owned by other users
				Factory.create('pattern', { 'name': 'Other Pattern 1', 'createdBy': 'abc' });
				Factory.create('pattern', { 'name': 'Other Pattern 2', 'createdBy': 'def' });
				Factory.create('pattern', { 'name': 'Other Pattern 3', 'createdBy': 'ghic' });

				// create patterns owned by the current user
				const currentUser = stubUser();
				Factory.create('pattern', { 'name': 'My Pattern 1', 'createdBy': currentUser._id });
				Factory.create('pattern', { 'name': 'My Pattern 2', 'createdBy': currentUser._id });

				const result = Meteor.call('pattern.getPatternCount');
				assert.equal(result, 2);
				unwrapUser();
			});
		});
	});
}

// TODO
// update getPatternCount test when patterns can be public or private
