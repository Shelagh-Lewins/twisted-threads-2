/* eslint-env mocha */
// test for sets methods

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import '../../imports/server/modules/publications';
// import all the methods we'll need
import { Patterns, Sets } from '../../imports/modules/collection';
import '../methods/set';
import { MAX_SETS } from '../../imports/modules/parameters';
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
		this.timeout(15000);
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
	});
}
