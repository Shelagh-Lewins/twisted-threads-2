/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import { ColorBooks } from '../../imports/modules/collection';
import '../../imports/server/modules/publications';
import '../methods/colorBook';
import { stubUser, unwrapUser } from './mockUser';

if (Meteor.isServer) {
	describe('test methods for color books', () => {
		beforeEach(() => {
			resetDatabase();
		});
		describe('colorBook.add method', () => {
			it('cannot create color book if not logged in', () => {
				function expectedError() {
					Meteor.call('colorBook.add', 'A color book');
				}
				expect(expectedError).to.throw(Meteor.Error(), 'add-color-book-not-logged-in');
			});
			it('cannot create color book if not verified', () => {
				function expectedError() {
					stubUser({
						'emails': [{
							'address': 'here@there.com',
							'verified': false,
						}],
					});

					Meteor.call('colorBook.add', 'A color book');
				}

				expect(expectedError).to.throw(Meteor.Error(), 'add-color-book-not-verified');
				unwrapUser();
			});
			it('can create color book if verified', () => {
				assert.equal(ColorBooks.find().fetch().length, 0);

				stubUser({
					'emails': [{
						'address': 'here@there.com',
						'verified': true,
					}],
				});

				Meteor.call('colorBook.add', 'A color book');

				assert.equal(ColorBooks.find().fetch().length, 1);
				unwrapUser();
			});
		});
		describe('colorBook.remove method', () => {
			it('cannot remove color book if not logged in', () => {
				const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': 'abc' });

				function expectedError() {
					Meteor.call('colorBook.remove', colorBook._id);
				}
				expect(expectedError).to.throw(Meteor.Error(), 'remove-color-book-not-logged-in');
			});
			it('cannot remove color book if did not create the color book', () => {
				function expectedError() {
					stubUser();

					const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': 'abc' });

					Meteor.call('colorBook.remove', colorBook._id);
				}

				expect(expectedError).to.throw(Meteor.Error(), 'remove-color-book-not-created-by-user');
				unwrapUser();
			});
			it('can remove color book if user created the color book', () => {
				const currentUser = stubUser();
				const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': currentUser._id });

				assert.equal(ColorBooks.find().fetch().length, 1);
				Meteor.call('colorBook.remove', colorBook._id);
				assert.equal(ColorBooks.find().fetch().length, 0);
				unwrapUser();
			});
		});
		describe('colorBook.editColor method', () => {
			it('cannot edit color book color if not logged in', () => {
				const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': 'abc' });

				function expectedError() {
					Meteor.call('colorBook.editColor', {
						'_id': colorBook._id,
						'colorHexValue': '#333',
						'colorIndex': 1,
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-color-book-color-not-logged-in');
			});
			it('cannot edit color book color if did not create the color book', () => {
				function expectedError() {
					stubUser();

					const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': 'abc' });

					Meteor.call('colorBook.editColor', {
						'_id': colorBook._id,
						'colorHexValue': '#333',
						'colorIndex': 1,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'edit-color-book-color-not-created-by-user');
				unwrapUser();
			});
			it('cannot edit color book color if color book does not exist', () => {
				function expectedError() {
					stubUser();

					Meteor.call('colorBook.editColor', {
						'_id': 'abc',
						'colorHexValue': '#333',
						'colorIndex': 1,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'edit-color-book-color-not-found');
				unwrapUser();
			});
			it('cannot edit color book color if user created the color book but color is invalid', () => {
				function expectedError() {
					const currentUser = stubUser();
					const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': currentUser._id });

					Meteor.call('colorBook.editColor', {
						'_id': colorBook._id,
						'colorHexValue': 4,
						'colorIndex': 1,
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'Match error');

				unwrapUser();
			});
			it('can edit color book color if user created the color book', () => {
				const currentUser = stubUser();
				const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': currentUser._id });

				assert.equal(ColorBooks.find().fetch().length, 1);

				Meteor.call('colorBook.editColor', {
					'_id': colorBook._id,
					'colorHexValue': '#000',
					'colorIndex': 1,
				});
				assert.equal(ColorBooks.find().fetch().length, 1);
				const colorBookUpdated = ColorBooks.findOne({ '_id': colorBook._id });

				assert.equal(colorBookUpdated.colors[1], '#000');

				unwrapUser();
			});
		});
		describe('colorBook.editName method', () => {
			it('cannot edit color book name if not logged in', () => {
				const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': 'abc' });

				function expectedError() {
					Meteor.call('colorBook.editName', {
						'_id': colorBook._id,
						'name': 'Something new',
					});
				}
				expect(expectedError).to.throw(Meteor.Error(), 'edit-color-book-name-not-logged-in');
			});
			it('cannot edit color book name if did not create the color book', () => {
				function expectedError() {
					stubUser();

					const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': 'abc' });

					Meteor.call('colorBook.editName', {
						'_id': colorBook._id,
						'name': 'Something new',
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'edit-color-book-name-not-created-by-user');
				unwrapUser();
			});
			it('cannot edit color book name if color book does not exist', () => {
				function expectedError() {
					stubUser();

					Meteor.call('colorBook.editName', {
						'_id': 'abc',
						'name': 'Something new',
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'edit-color-book-name-not-found');
				unwrapUser();
			});
			it('cannot edit color book name if user created the color book but name is invalid', () => {
				function expectedError() {
					const currentUser = stubUser();
					const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': currentUser._id });

					Meteor.call('colorBook.editName', {
						'_id': colorBook._id,
						'name': '',
					});
				}

				expect(expectedError).to.throw(Meteor.Error(), 'Match error');

				unwrapUser();
			});
			it('can edit color book name if user created the color book', () => {
				const currentUser = stubUser();
				const colorBook = Factory.create('colorBook', { 'name': 'Color Book 1', 'createdBy': currentUser._id });

				assert.equal(ColorBooks.find().fetch().length, 1);

				Meteor.call('colorBook.editName', {
					'_id': colorBook._id,
					'name': 'Something new',
				});
				assert.equal(ColorBooks.find().fetch().length, 1);
				const colorBookUpdated = ColorBooks.findOne({ '_id': colorBook._id });

				assert.equal(colorBookUpdated.name, 'Something new');

				unwrapUser();
			});
		});
	});
}
