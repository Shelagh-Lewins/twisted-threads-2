/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import { ColorBooks } from '../../imports/collection';
import '../publications';
import '../methods/colorBook';
import { stubUser, unwrapUser } from './mockUser';
import { defaultPatternBookData } from './testData';

if (Meteor.isServer) {
	describe('test methods for color books', () => {
		beforeEach(() => {
			resetDatabase();
		});
		describe('colorBook.add method', () => {
			it('cannot create color book if not logged in', () => {
				function expectedError() {
					Meteor.call('colorBook.add', defaultPatternBookData);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-color-book-not-logged-in');
			});
		});
	});
}

// create color book
// edit color book
// edit name
// remove