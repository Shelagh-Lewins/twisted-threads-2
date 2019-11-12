/* eslint-env mocha */

import { Factory } from 'meteor/dburles:factory';
import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import Patterns from '../imports/collection';
import './publications';
import './methods';

const sinon = require('sinon');

if (Meteor.isServer) {
	// PUBLICATIONS
	describe('methods', () => {
		before(() => {
			resetDatabase();

			const currentUser = Factory.create('user');
			sinon.stub(Meteor, 'user');
			Meteor.user.returns(currentUser); // now Meteor.user() will return the user we just created
			// console.log('test user', Meteor.user());

			sinon.stub(Meteor, 'userId');
			Meteor.userId.returns(currentUser._id); // needed in methods

			// this.firstDocument = Factory.create('pattern', { 'name': 'Pattern 1', 'created_by': currentUser._id });
			// Factory.create('pattern', { 'name': 'Pattern 2', 'created_by': currentUser._id });
		});
		after(() => {
			Meteor.user.restore(); // Unwraps the spy
			Meteor.userId.restore(); // Unwraps the sp
		});
		describe('addPattern method', () => {
			it('cannot create pattern if not logged in', () => {
				function expectedError() {
					Meteor.call('addPattern', 'my pattern');
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-pattern-not-logged-in');
			});
		});
	});
}
