/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { expect } from 'chai';
import '../../imports/server/modules/publications';
import '../methods/auth';
import { stubUser, unwrapUser } from './mockUser';

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
		it('throws an error if the users email address is verified', () => {
			const currentUser = stubUser();

			Meteor.users.update({ '_id': currentUser._id }, { '$set': { 'emails.0.verified': true } });

			function expectedError() {
				Meteor.call('auth.sendVerificationEmail', currentUser._id);
			}
			expect(expectedError).to.throw(Meteor.Error(), 'no unverified email');

			unwrapUser();
		});
		it('sends the email if the user is logged in and unverified', () => {
			const currentUser = stubUser();

			Meteor.users.update({ '_id': currentUser._id }, { '$set': { 'emails.0.verified': false } });

			Meteor.call('auth.sendVerificationEmail', currentUser._id);

			// if there is no error, we assume it worked
			unwrapUser();
		});
	});
}
