/* eslint-env mocha */

import { resetDatabase } from 'meteor/xolvio:cleaner';
import { assert, expect } from 'chai';
import { ColorBooks } from '../../imports/modules/collection';
import '../../imports/server/modules/publications';
import '../methods/colorBook';
import { ROLE_LIMITS } from '../../imports/modules/parameters';
import { defaultColorBookData } from './testData';
import { stubUser, unwrapUser } from './mockUser';

if (Meteor.isServer) {
  describe('test methods for color books', () => {
    beforeEach(() => {
      resetDatabase();
    });
    describe('colorBook.add method', () => {
      it('cannot create color book if not logged in', () => {
        function expectedError() {
          Meteor.call('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'add-color-book-not-logged-in',
        );
      });
      it('cannot create color book if not registered', () => {
        function expectedError() {
          stubUser();
          Roles.removeUsersFromRoles(Meteor.userId(), ['registered']);

          Meteor.call('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
          'add-color-book-not-registered',
        );
        unwrapUser();
      });
      it('can create the correct number of color books if registered', () => {
        stubUser();

        const colorBookLimit = ROLE_LIMITS.registered.maxColorBooksPerUser;
        for (let i = 0; i < colorBookLimit; i += 1) {
          Meteor.call('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }

        assert.equal(ColorBooks.find().fetch().length, colorBookLimit);

        function expectedError() {
          Meteor.call('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
          'add-color-book-too-many-color-books',
        );
        unwrapUser();
      });
      it('can create the correct number of color books if verified', () => {
        const currentUser = stubUser();

        Roles.createRole('verified', { unlessExists: true });
        Roles.addUsersToRoles(currentUser._id, ['verified']);

        const colorBookLimit = ROLE_LIMITS.verified.maxColorBooksPerUser;
        for (let i = 0; i < colorBookLimit; i += 1) {
          Meteor.call('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }

        assert.equal(ColorBooks.find().fetch().length, colorBookLimit);

        function expectedError() {
          Meteor.call('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
          'add-color-book-too-many-color-books',
        );
        unwrapUser();
      });
      it('can create the correct number of color books if premium', () => {
        const currentUser = stubUser();

        Roles.createRole('premium', { unlessExists: true });
        Roles.addUsersToRoles(currentUser._id, ['premium']);

        const colorBookLimit = ROLE_LIMITS.premium.maxColorBooksPerUser;
        for (let i = 0; i < colorBookLimit; i += 1) {
          Meteor.call('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }

        assert.equal(ColorBooks.find().fetch().length, colorBookLimit);

        function expectedError() {
          Meteor.call('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
          'add-color-book-too-many-color-books',
        );
        unwrapUser();
      });
    });
    describe('colorBook.remove method', () => {
      it('cannot remove color book if not logged in', () => {
        const colorBook = Factory.create('colorBook', {
          name: 'Color Book 1',
          createdBy: 'abc',
        });

        function expectedError() {
          Meteor.call('colorBook.remove', colorBook._id);
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-color-book-not-logged-in',
        );
      });
      it('cannot remove color book if did not create the color book', () => {
        function expectedError() {
          stubUser();

          const colorBook = Factory.create('colorBook', {
            name: 'Color Book 1',
            createdBy: 'abc',
          });

          Meteor.call('colorBook.remove', colorBook._id);
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
          'remove-color-book-not-created-by-user',
        );
        unwrapUser();
      });
      it('can remove color book if user created the color book', () => {
        const currentUser = stubUser();
        const colorBook = Factory.create('colorBook', {
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });

        assert.equal(ColorBooks.find().fetch().length, 1);
        Meteor.call('colorBook.remove', colorBook._id);
        assert.equal(ColorBooks.find().fetch().length, 0);
        unwrapUser();
      });
    });
    describe('colorBook.edit method', () => {
      it('cannot edit color book color if not logged in', () => {
        const colorBook = Factory.create('colorBook', {
          name: 'Color Book 1',
          createdBy: 'abc',
        });

        function expectedError() {
          Meteor.call('colorBook.edit', {
            _id: colorBook._id,
            data: {
              colorHexValue: '#333333',
              colorIndex: 1,
              type: 'color',
            },
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'edit-color-book-not-logged-in',
        );
      });
      it("cannot edit color book color if color books doesn't exist", () => {
        stubUser();

        function expectedError() {
          Meteor.call('colorBook.edit', {
            _id: 'abc',
            data: {
              colorHexValue: '#333333',
              colorIndex: 1,
              type: 'color',
            },
          });
        }
        expect(expectedError).to.throw(
          Meteor.Error(),
          'edit-color-book-not-found',
        );
        unwrapUser();
      });
      it('cannot edit color book color if did not create the color book', () => {
        function expectedError() {
          stubUser();

          const colorBook = Factory.create('colorBook', {
            name: 'Color Book 1',
            createdBy: 'abc',
          });

          Meteor.call('colorBook.edit', {
            _id: colorBook._id,
            data: {
              colorHexValue: '#333333',
              colorIndex: 1,
              type: 'color',
            },
          });
        }

        expect(expectedError).to.throw(
          Meteor.Error(),
          'edit-color-book-not-created-by-user',
        );
        unwrapUser();
      });

      it('cannot edit color book color if user created the color book but color is not a string', () => {
        function expectedError() {
          const currentUser = stubUser();
          const colorBook = Factory.create('colorBook', {
            name: 'Color Book 1',
            createdBy: currentUser._id,
          });

          Meteor.call('colorBook.edit', {
            _id: colorBook._id,
            data: {
              colorHexValue: 4,
              colorIndex: 1,
              type: 'color',
            },
          });
        }

        expect(expectedError).to.throw(Meteor.Error(), 'Match error');

        unwrapUser();
      });

      it('can edit color book color if user created the color book', async () => {
        const currentUser = stubUser();
        const colorBook = Factory.create('colorBook', {
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });

        assert.equal(ColorBooks.find().fetch().length, 1);

        await Meteor.callAsync('colorBook.edit', {
          _id: colorBook._id,
          data: {
            colorHexValue: '#333333',
            colorIndex: 1,
            type: 'color',
          },
        });

        const colorBookUpdated = await ColorBooks.findOneAsync({
          _id: colorBook._id,
        });

        assert.equal(colorBookUpdated.colors[1], '#333333');

        unwrapUser();
      });

      it('can edit color book name if user created the color book', async () => {
        const currentUser = stubUser();
        const colorBook = Factory.create('colorBook', {
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });

        const newName = 'The new name';

        await Meteor.callAsync('colorBook.edit', {
          _id: colorBook._id,
          data: {
            name: newName,
            colorIndex: 1,
            type: 'name',
          },
        });

        const colorBookUpdated = await ColorBooks.findOneAsync({
          _id: colorBook._id,
        });

        assert.equal(colorBookUpdated.name, newName);

        unwrapUser();
      });
      it('can edit color book isPublic if user created the color book', async () => {
        const currentUser = stubUser();
        const colorBook = Factory.create('colorBook', {
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });

        const colorBookInitial = await ColorBooks.findOneAsync({
          _id: colorBook._id,
        });
        assert.equal(colorBookInitial.isPublic, false);

        await Meteor.callAsync('colorBook.edit', {
          _id: colorBook._id,
          data: {
            isPublic: true,
            type: 'isPublic',
          },
        });

        const colorBookUpdated = await ColorBooks.findOneAsync({
          _id: colorBook._id,
        });

        assert.equal(colorBookUpdated.isPublic, true);

        unwrapUser();
      });
    });
  });
}
