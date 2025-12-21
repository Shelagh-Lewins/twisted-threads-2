import { check } from 'meteor/check';
import {
  checkCanCreateColorBook,
  nonEmptyStringCheck,
  updatePublicColorBooksCount,
} from '../../imports/server/modules/utils';
import { ColorBooks } from '../../imports/modules/collection';

Meteor.methods({
  'colorBook.add': async function ({ colors, name }) {
    check(colors, [String]);
    check(name, nonEmptyStringCheck);

    const { error } = await checkCanCreateColorBook(this.userId);

    if (error) {
      throw error;
    }

      const colorBookId = await ColorBooks.insertAsync({
        name,
        nameSort: name.toLowerCase(),
        createdAt: new Date(),
        createdBy: this.userId,
        colors,
        isPublic: false,
      });

      // update the user's count of public color books
      await updatePublicColorBooksCount(this.userId);

      return colorBookId;
  },
  'colorBook.remove': async function (_id) {
    check(_id, nonEmptyStringCheck);

    if (!this.userId) {
      throw new Meteor.Error(
        'remove-color-book-not-logged-in',
        'Unable to remove color book because the user is not logged in',
      );
    }

    const colorBook = await ColorBooks.findOneAsync({ _id });

    if (!colorBook) {
      throw new Meteor.Error(
        'remove-color-book-not-found',
        'Unable to remove color book because the color book was not found',
      );
    }

    if (colorBook.createdBy !== this.userId) {
      throw new Meteor.Error(
        'remove-color-book-not-created-by-user',
        'Unable to remove color book because it was not created by the current logged in user',
      );
    }

    const removed = await ColorBooks.removeAsync({ _id });

    // update the user's count of public color books
    await updatePublicColorBooksCount(this.userId);

    return removed;
  },
  'colorBook.copy': async function (_id) {
    check(_id, nonEmptyStringCheck);

    const { error } = await checkCanCreateColorBook();

    if (error) {
      throw error;
    }

    const colorBook = await ColorBooks.findOneAsync({ _id });

    if (!colorBook) {
      throw new Meteor.Error(
        'copy-color-book-not-found',
        'Unable to copy color book because the color book was not found',
      );
    }

    if (colorBook.createdBy !== this.userId && !colorBook.isPublic) {
      throw new Meteor.Error(
        'copy-color-book-not-created-by-user-and-not-public',
        'Unable to copy color book because it was not created by the current logged in user and is not public',
      );
    }

    // create a new color book
    const { colors } = colorBook;
    let { name } = colorBook;
    name = `${name} (copy)`;

    const newColorBookId = await Meteor.callAsync('colorBook.add', {
      colors,
      name,
    });

    return newColorBookId;
  },
  'colorBook.edit': async function ({ _id, data }) {
    check(_id, nonEmptyStringCheck);
    check(data, Match.ObjectIncluding({ type: String }));
    // type specifies the update operation
    // e.g. color, isPublic

    const { type } = data;

    if (!this.userId) {
      throw new Meteor.Error(
        'edit-color-book-not-logged-in',
        'Unable to edit color book because the user is not logged in',
      );
    }

    const colorBook = await ColorBooks.findOneAsync({ _id });

    // to be filled in by data depending on case
    let colorHexValue;
    let colorIndex;
    let isPublic;
    let name;

    if (!colorBook) {
      throw new Meteor.Error(
        'edit-color-book-not-found',
        'Unable to edit color book because the color book was not found',
      );
    }

    if (colorBook.createdBy !== this.userId) {
      throw new Meteor.Error(
        'edit-color-book-not-created-by-user',
        'Unable to edit color book because color book was not created by the current logged in user',
      );
    }

    switch (type) {
      case 'isPublic':
        ({ isPublic } = data);
        check(isPublic, Boolean);

        await ColorBooks.updateAsync({ _id }, { $set: { isPublic } });

        // update the user's count of public color books
        await updatePublicColorBooksCount(this.userId);

        return;

      case 'color':
        ({ colorIndex, colorHexValue } = data);
        check(colorIndex, Number);
        check(colorHexValue, nonEmptyStringCheck);

        // update the value in the nested arrays
        return ColorBooks.updateAsync(
          { _id },
          { $set: { [`colors.${colorIndex}`]: colorHexValue } },
        );

      case 'name':
        ({ name } = data);
        check(name, nonEmptyStringCheck);

        return ColorBooks.updateAsync(
          { _id },
          { $set: { name, nameSort: name.toLowerCase() } },
        );

      default:
        break;
    }
  },
});
