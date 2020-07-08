/* eslint-env mocha */
// test for sets methods

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import { Sets } from '../../imports/modules/collection';
import '../methods/set';
import {
	MAX_PATTERNS_IN_SET,
	MAX_SETS,
} from '../../imports/modules/parameters';
import {
	stubNoUser,
	stubOtherUser,
	stubUser,
	unwrapUser,
} from './mockUser';
import {
	addPatternDataIndividual,
} from './testData';

if (Meteor.isServer) {
	describe('test methods for sets', function () { // eslint-disable-line func-names
		this.timeout(30000);
		beforeEach(() => {
			resetDatabase();
			stubUser();
			this.patternId = Meteor.call('pattern.add', addPatternDataIndividual);
		});
		afterEach(() => {
			unwrapUser();
		});
		describe('set.add method', () => {
			// create a set and assign a pattern to it
			it('cannot create set if not logged in', () => {
				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();
				const { patternId } = this; // seems to be a scoping issue otherwise

				function expectedError() {
					Meteor.call('set.add', {
						patternId,
						'name': 'Favourites',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-set-not-logged-in');
			});
			it('cannot create set if not registered', () => {
				Roles.removeUsersFromRoles(Meteor.userId(), ['registered']);
				const { patternId } = this; // seems to be a scoping issue otherwise

				function expectedError() {
					Meteor.call('set.add', {
						patternId,
						'name': 'Favourites',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-set-not-registered');
			});
			it('can create the correct number of sets if registered', () => {
				const { patternId } = this; // seems to be a scoping issue otherwise

				for (let i = 0; i < MAX_SETS; i += 1) {
					Meteor.call('set.add', {
						patternId,
						'name': `Favourites ${i}`,
					});
				}

				assert.equal(Sets.find().fetch().length, MAX_SETS);

				// check the user's public sets count
				assert.equal(Meteor.users.findOne({}).publicSetsCount, 0);

				// set 1 pattern to public
				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(Meteor.userId(), ['verified']);

				Meteor.call('pattern.edit', {
					'_id': patternId,
					'data': {
						'type': 'editIsPublic',
						'isPublic': true,
					},
				});

				// since this pattern is in all sets, the user should now have all sets public
				assert.equal(Meteor.users.findOne({}).publicSetsCount, MAX_SETS);

				function expectedError() {
					Meteor.call('set.add', {
						patternId,
						'name': 'Favourites',
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'add-set-too-many-sets');
			});
			it('cannot create set if pattern not found', () => {
				function expectedError() {
					Meteor.call('set.add', {
						'patternId': 'abc',
						'name': 'Favourites',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-set-not-found');
			});
		});
		describe('set.addPattern method', () => {
			// create a set and assign a pattern to it
			it('cannot add pattern to set if not logged in', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				// create a second pattern
				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(Meteor.userId(), ['verified']);
				const newPatternId = Meteor.call('pattern.add', addPatternDataIndividual);

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				function expectedError() {
					Meteor.call('set.addPattern', {
						'patternId': newPatternId,
						setId,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-to-set-not-logged-in');
			});
			it('cannot add pattern to set if the set does not exist', () => {
				const { patternId } = this; // seems to be a scoping issue otherwise

				function expectedError() {
					Meteor.call('set.addPattern', {
						'patternId': patternId,
						'setId': '123',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-to-set-set-not-found');
			});
			it('cannot add pattern to set if another user created the set', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				// create a second pattern
				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(Meteor.userId(), ['verified']);
				const newPatternId = Meteor.call('pattern.add', addPatternDataIndividual);

				// log in a different user
				stubOtherUser();

				function expectedError() {
					Meteor.call('set.addPattern', {
						'patternId': newPatternId,
						setId,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-to-set-not-created-by-user');
			});
			it('cannot add pattern to set if pattern not found', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				function expectedError() {
					Meteor.call('set.addPattern', {
						'patternId': 'abc',
						setId,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-to-set-pattern-not-found');
			});
			it('cannot add pattern to set if the pattern is already in the set', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				function expectedError() {
					Meteor.call('set.addPattern', {
						patternId,
						setId,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-to-set-already-in-set');
			});
			it('can add the correct number of patterns to the set', () => {
				// give user premium role so they can create many patterns
				Roles.createRole('premium', { 'unlessExists': true });
				Roles.addUsersToRoles(Meteor.userId(), ['premium']);

				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				for (let i = 0; i < MAX_PATTERNS_IN_SET - 1; i += 1) {
					const newPatternId = Meteor.call('pattern.add', addPatternDataIndividual);

					Meteor.call('set.addPattern', {
						'patternId': newPatternId,
						setId,
					});
				}

				const newPatternId2 = Meteor.call('pattern.add', addPatternDataIndividual);

				function expectedError() {
					Meteor.call('set.addPattern', {
						'patternId': newPatternId2,
						setId,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'add-set-too-many-patterns');
			});
		});
		describe('set.removePattern method', () => {
			it('cannot remove pattern from set if not logged in', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				// create a second pattern
				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(Meteor.userId(), ['verified']);
				const newPatternId = Meteor.call('pattern.add', addPatternDataIndividual);

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				function expectedError() {
					Meteor.call('set.removePattern', {
						'patternId': newPatternId,
						setId,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-from-set-not-logged-in');
			});
			it('cannot remove pattern from set if the set not found', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				function expectedError() {
					Meteor.call('set.removePattern', {
						patternId,
						'setId': 'abc',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-from-set-set-not-found');
			});
			it('cannot remove pattern from set if the set was created by another user', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				// log in a different user
				stubOtherUser();

				function expectedError() {
					Meteor.call('set.removePattern', {
						patternId,
						setId,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-from-set-not-created-by-user');
			});
			it('cannot remove pattern from set if the pattern was not found', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				function expectedError() {
					Meteor.call('set.removePattern', {
						'patternId': 'abc',
						setId,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-from-set-pattern-not-found');
			});
			it('cannot remove pattern from set if the pattern was not in the set', () => {
				// give user verified role so they can create many patterns
				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(Meteor.userId(), ['verified']);

				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				const newPatternId = Meteor.call('pattern.add', addPatternDataIndividual);

				function expectedError() {
					Meteor.call('set.removePattern', {
						'patternId': newPatternId,
						setId,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-from-set-not-in-set');
			});
			it('can remove pattern from set', () => {
				// give user verified role so they can create many patterns
				Roles.createRole('verified', { 'unlessExists': true });
				Roles.addUsersToRoles(Meteor.userId(), ['verified']);

				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				// add a second pattern to the set
				const newPatternId = Meteor.call('pattern.add', addPatternDataIndividual);

				Meteor.call('set.addPattern', {
					'patternId': newPatternId,
					setId,
				});

				assert.equal(Sets.findOne({}).patterns.length, 2);

				Meteor.call('set.removePattern', {
					'patternId': patternId,
					setId,
				});

				assert.equal(Sets.findOne({}).patterns.length, 1);

				// check set is removed now it has no patterns
				Meteor.call('set.removePattern', {
					'patternId': newPatternId,
					setId,
				});

				assert.equal(Sets.find({}).fetch().length, 0);
			});
		});
		describe('set.remove method', () => {
			it('cannot remove a set if not logged in', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				function expectedError() {
					Meteor.call('set.remove', setId);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-set-not-logged-in');
			});
			it('cannot remove a set if set not found', () => {
				function expectedError() {
					Meteor.call('set.remove', 'abc');
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-set-not-found');
			});
			it('cannot remove a set if set not created by the user', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				stubOtherUser();

				function expectedError() {
					Meteor.call('set.remove', setId);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-set-not-created-by-user');
			});
			it('can remove a set', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				assert.equal(Sets.find({}).fetch().length, 1);

				Meteor.call('set.remove', setId);

				assert.equal(Sets.find({}).fetch().length, 0);
			});
		});
		describe('set.edit method', () => {
			it('cannot edit a set if not logged in', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				// make sure publications know there is no user
				unwrapUser();
				stubNoUser();

				const fieldName = 'name';
				const fieldValue = 'My favourites';

				function expectedError() {
					Meteor.call('set.edit', {
						'_id': setId,
						'data': {
							fieldName,
							fieldValue,
							'type': 'editTextField',
						},
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-set-not-logged-in');
			});
			it('cannot edit a set if the set was not found', () => {
				const fieldName = 'name';
				const fieldValue = 'My favourites';

				function expectedError() {
					Meteor.call('set.edit', {
						'_id': 'abc',
						'data': {
							fieldName,
							fieldValue,
							'type': 'editTextField',
						},
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-set-not-found');
			});
			it('cannot edit a set if the set was not created by the current user', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				stubOtherUser();

				const fieldName = 'name';
				const fieldValue = 'My favourites';

				function expectedError() {
					Meteor.call('set.edit', {
						'_id': setId,
						'data': {
							fieldName,
							fieldValue,
							'type': 'editTextField',
						},
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-set-not-created-by-user');
			});
			it('can edit a set', () => {
				// create a set by adding a pattern
				const { patternId } = this; // seems to be a scoping issue otherwise

				const setId = Meteor.call('set.add', {
					patternId,
					'name': 'Favourites',
				});

				assert.equal(Sets.findOne({}).name, 'Favourites');
				assert.equal(Sets.findOne({}).description, undefined);

				let fieldName = 'name';
				let fieldValue = 'My favourites';

				Meteor.call('set.edit', {
					'_id': setId,
					'data': {
						fieldName,
						fieldValue,
						'type': 'editTextField',
					},
				});

				assert.equal(Sets.findOne({})[fieldName], fieldValue);

				fieldName = 'description';
				fieldValue = 'This set contains patterns';

				Meteor.call('set.edit', {
					'_id': setId,
					'data': {
						fieldName,
						fieldValue,
						'type': 'editTextField',
					},
				});

				assert.equal(Sets.findOne({})[fieldName], fieldValue);
			});
		});
	});
}
