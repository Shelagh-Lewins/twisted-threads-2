/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import { Patterns } from '../../imports/collection';
import '../publications';
import '../methods/auth';
import { stubUser, unwrapUser } from './mockUser';
import { defaultPatternData } from './testData';

if (Meteor.isServer) {
	describe('test methods', () => {
		beforeEach(() => {
			resetDatabase();
		});
		describe('sendVerificationEmail method', () => {
			it('throws an error if the user is not logged in', () => {
				function expectedError() {
					Meteor.call('auth.sendVerificationEmail', 'abc');
				}
				expect(expectedError).to.throw(Meteor.Error(), 'send-verification-email-not-logged-in');
			});
		});
	});
}
