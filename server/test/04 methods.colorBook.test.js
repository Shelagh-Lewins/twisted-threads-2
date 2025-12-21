/* eslint-env mocha */

import { resetDatabase, ensureAllRolesExist } from './00_setup';
import { assert, expect } from 'chai';
import { Roles } from 'meteor/roles';
import { ColorBooks } from '../../imports/modules/collection';
import '../../imports/server/modules/publications';
import '../methods/colorBook';
import { ROLE_LIMITS } from '../../imports/modules/parameters';
import { defaultColorBookData, createColorBook } from './testData';
import { stubUser, unwrapUser, callMethodWithUser } from './mockUser';

if (Meteor.isServer) {
  describe('test methods for color books', () => {
    beforeEach(async () => {
      await unwrapUser();
      await resetDatabase();
      await ensureAllRolesExist();
    });
    describe('colorBook.add method', () => {
      // Should reject if no user is logged in
      it('cannot create color book if not logged in', async () => {
        async function expectedError() {
          await Meteor.callAsync('colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-color-book-not-logged-in',
        );
      });

      // Should reject if user is not registered
      it('cannot create color book if not registered', async () => {
        const currentUser = await stubUser();
        await Roles.removeUsersFromRolesAsync(
          [currentUser._id],
          ['registered'],
        );
        // Ensure Meteor.userId and Meteor.userAsync stubs are set for currentUser
        Meteor.userId.returns(currentUser._id);
        Meteor.userAsync.returns(currentUser);
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-color-book-not-registered',
        );
        await unwrapUser();
      });

      // Should allow up to the registered user limit, then reject
      it('can create the correct number of color books if registered', async () => {
        const currentUser = await stubUser();
        Meteor.userId.returns(currentUser._id);
        Meteor.userAsync.returns(currentUser);
        const colorBookLimit = ROLE_LIMITS.registered.maxColorBooksPerUser;
        for (let i = 0; i < colorBookLimit; i += 1) {
          await callMethodWithUser(currentUser._id, 'colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        assert.equal(await ColorBooks.find().countAsync(), colorBookLimit);
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-color-book-too-many-color-books',
        );
        await unwrapUser();
      });

      // Should allow up to the verified user limit, then reject
      it('can create the correct number of color books if verified', async () => {
        const currentUser = await stubUser();
        Meteor.userId.returns(currentUser._id);
        Meteor.userAsync.returns(currentUser);
        await Roles.createRoleAsync('verified', { unlessExists: true });
        await Roles.addUsersToRolesAsync([currentUser._id], ['verified']);
        const colorBookLimit = ROLE_LIMITS.verified.maxColorBooksPerUser;
        for (let i = 0; i < colorBookLimit; i += 1) {
          await callMethodWithUser(currentUser._id, 'colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        assert.equal(await ColorBooks.find().countAsync(), colorBookLimit);
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-color-book-too-many-color-books',
        );
        await unwrapUser();
      });

      // Should allow up to the premium user limit, then reject
      it('can create the correct number of color books if premium', async () => {
        const currentUser = await stubUser();
        Meteor.userId.returns(currentUser._id);
        Meteor.userAsync.returns(currentUser);
        await Roles.createRoleAsync('premium', { unlessExists: true });
        await Roles.addUsersToRolesAsync([currentUser._id], ['premium']);
        const colorBookLimit = ROLE_LIMITS.premium.maxColorBooksPerUser;
        for (let i = 0; i < colorBookLimit; i += 1) {
          await callMethodWithUser(currentUser._id, 'colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        assert.equal(await ColorBooks.find().countAsync(), colorBookLimit);
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'colorBook.add', {
            colors: defaultColorBookData.colors,
            name: defaultColorBookData.name,
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'add-color-book-too-many-color-books',
        );
        await unwrapUser();
      });
    });

    describe('colorBook.remove method', () => {
      // Should reject if no user is logged in
      it('cannot remove color book if not logged in', async () => {
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: 'abc',
        });

        async function expectedError() {
          await Meteor.callAsync('colorBook.remove', colorBook._id);
        }

        await expect(expectedError()).to.be.rejectedWith(
          'remove-color-book-not-logged-in',
        );
      });

      // Should reject if user did not create the color book
      it('cannot remove color book if did not create the color book', async () => {
        const currentUser = await stubUser();
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: 'abc',
        });
        async function expectedError() {
          await callMethodWithUser(
            currentUser._id,
            'colorBook.remove',
            colorBook._id,
          );
        }
        await expect(expectedError()).to.be.rejectedWith(
          'remove-color-book-not-created-by-user',
        );
        await unwrapUser();
      });

      // Should allow removal if user created the color book
      it('can remove color book if user created the color book', async () => {
        const currentUser = await stubUser();
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });
        assert.equal(await ColorBooks.find().countAsync(), 1);
        await callMethodWithUser(
          currentUser._id,
          'colorBook.remove',
          colorBook._id,
        );
        assert.equal(await ColorBooks.find().countAsync(), 0);
        await unwrapUser();
      });
    });

    describe('colorBook.edit method', () => {
      // Should reject edit if not logged in
      it('cannot edit color book color if not logged in', async () => {
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: 'abc',
        });

        async function expectedError() {
          await Meteor.callAsync('colorBook.edit', {
            _id: colorBook._id,
            data: {
              colorHexValue: '#333333',
              colorIndex: 1,
              type: 'color',
            },
          });
        }

        await expect(expectedError()).to.be.rejectedWith(
          'edit-color-book-not-logged-in',
        );
      });

      // Should reject edit if color book does not exist
      it("cannot edit color book color if color books doesn't exist", async () => {
        const currentUser = await stubUser();
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'colorBook.edit', {
            _id: 'abc',
            data: {
              colorHexValue: '#333333',
              colorIndex: 1,
              type: 'color',
            },
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'edit-color-book-not-found',
        );
        await unwrapUser();
      });

      // Should reject edit if user did not create the color book
      it('cannot edit color book color if did not create the color book', async () => {
        const currentUser = await stubUser();
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: 'abc',
        });
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'colorBook.edit', {
            _id: colorBook._id,
            data: {
              colorHexValue: '#333333',
              colorIndex: 1,
              type: 'color',
            },
          });
        }
        await expect(expectedError()).to.be.rejectedWith(
          'edit-color-book-not-created-by-user',
        );
        await unwrapUser();
      });

      // Should reject edit if colorHexValue is not a string
      it('cannot edit color book color if user created the color book but color is not a string', async () => {
        const currentUser = await stubUser();
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });
        async function expectedError() {
          await callMethodWithUser(currentUser._id, 'colorBook.edit', {
            _id: colorBook._id,
            data: {
              colorHexValue: 4,
              colorIndex: 1,
              type: 'color',
            },
          });
        }
        await expect(expectedError()).to.be.rejectedWith('Match error');
        await unwrapUser();
      });

      // Should allow edit if user created the color book and colorHexValue is valid
      it('can edit color book color if user created the color book', async () => {
        const currentUser = await stubUser();
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });
        assert.equal(await ColorBooks.find().countAsync(), 1);
        await callMethodWithUser(currentUser._id, 'colorBook.edit', {
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
        await unwrapUser();
      });

      // Should allow name edit if user created the color book
      it('can edit color book name if user created the color book', async () => {
        const currentUser = await stubUser();
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });
        const newName = 'The new name';
        await callMethodWithUser(currentUser._id, 'colorBook.edit', {
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
        await unwrapUser();
      });

      // Should allow isPublic edit if user created the color book
      it('can edit color book isPublic if user created the color book', async () => {
        const currentUser = await stubUser();
        const colorBook = await createColorBook({
          name: 'Color Book 1',
          createdBy: currentUser._id,
        });
        const colorBookInitial = await ColorBooks.findOneAsync({
          _id: colorBook._id,
        });
        assert.equal(colorBookInitial.isPublic, false);
        await callMethodWithUser(currentUser._id, 'colorBook.edit', {
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
        await unwrapUser();
      });
    });
  });
}
