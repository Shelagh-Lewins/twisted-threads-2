import { check } from 'meteor/check';
import {
  checkCanCreateColorBook,
  nonEmptyStringCheck,
  updatePublicColorBooksCount,
} from '../../imports/server/modules/utils';
import { ColorBooks } from '../../imports/modules/collection';

/**
 * Utility: Throws if user is not logged in
 * @param {string} userId - The user's ID
 * @param {string} errorCode - Meteor error code
 * @param {string} errorMsg - Error message
 */
function requireUser(userId, errorCode, errorMsg) {
  if (!userId) {
    throw new Meteor.Error(errorCode, errorMsg);
  }
}

/**
 * Utility: Throws if colorBook not found
 * @param {object|null} colorBook - The color book document
 * @param {string} errorCode - Meteor error code
 * @param {string} errorMsg - Error message
 */
function requireColorBook(colorBook, errorCode, errorMsg) {
  if (!colorBook) {
    throw new Meteor.Error(errorCode, errorMsg);
  }
}

/**
 * Utility: Throws if colorBook not created by user
 * @param {object} colorBook - The color book document
 * @param {string} userId - The user's ID
 * @param {string} errorCode - Meteor error code
 * @param {string} errorMsg - Error message
 */
function requireCreatedByUser(colorBook, userId, errorCode, errorMsg) {
  if (colorBook.createdBy !== userId) {
    throw new Meteor.Error(errorCode, errorMsg);
  }
}

/**
 * Utility: Update public color book count for user
 * @param {string} userId - The user's ID
 */
async function updateUserPublicColorBookCount(userId) {
  await updatePublicColorBooksCount(userId);
}

Meteor.methods({
  /**
   * Add a new color book
   * Throws if user is not registered or exceeds limit
   */
  async 'colorBook.add'({ colors, name }) {
    check(colors, [String]);
    check(name, nonEmptyStringCheck);

    // Check user registration/role/limit
    const { error } = await checkCanCreateColorBook(this.userId);
    if (error) throw error;

    const colorBookId = await ColorBooks.insertAsync({
      name,
      nameSort: name.toLowerCase(),
      createdAt: new Date(),
      createdBy: this.userId,
      colors,
      isPublic: false,
    });

    await updateUserPublicColorBookCount(this.userId);
    return colorBookId;
  },
  /**
   * Remove a color book
   * Throws if not logged in, not found, or not created by user
   */
  async 'colorBook.remove'(_id) {
    check(_id, nonEmptyStringCheck);
    requireUser(
      this.userId,
      'remove-color-book-not-logged-in',
      'Unable to remove color book because the user is not logged in',
    );
    const colorBook = await ColorBooks.findOneAsync({ _id });
    requireColorBook(
      colorBook,
      'remove-color-book-not-found',
      'Unable to remove color book because the color book was not found',
    );
    requireCreatedByUser(
      colorBook,
      this.userId,
      'remove-color-book-not-created-by-user',
      'Unable to remove color book because it was not created by the current logged in user',
    );
    const removed = await ColorBooks.removeAsync({ _id });
    await updateUserPublicColorBookCount(this.userId);
    return removed;
  },
  /**
   * Copy a color book
   * Throws if not registered, not found, or not public/not created by user
   */
  async 'colorBook.copy'(_id) {
    check(_id, nonEmptyStringCheck);
    const { error } = await checkCanCreateColorBook(this.userId);
    if (error) throw error;
    const colorBook = await ColorBooks.findOneAsync({ _id });
    requireColorBook(
      colorBook,
      'copy-color-book-not-found',
      'Unable to copy color book because the color book was not found',
    );
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
  /**
   * Edit a color book
   * Throws if not logged in, not found, or not created by user
   * Supports updating isPublic, color, or name
   */
  async 'colorBook.edit'({ _id, data }) {
    check(_id, nonEmptyStringCheck);
    check(data, Match.ObjectIncluding({ type: String }));
    // type specifies the update operation (e.g. color, isPublic)
    const { type } = data;
    requireUser(
      this.userId,
      'edit-color-book-not-logged-in',
      'Unable to edit color book because the user is not logged in',
    );
    const colorBook = await ColorBooks.findOneAsync({ _id });
    requireColorBook(
      colorBook,
      'edit-color-book-not-found',
      'Unable to edit color book because the color book was not found',
    );
    requireCreatedByUser(
      colorBook,
      this.userId,
      'edit-color-book-not-created-by-user',
      'Unable to edit color book because color book was not created by the current logged in user',
    );
    // to be filled in by data depending on case
    let colorHexValue;
    let colorIndex;
    let isPublic;
    let name;
    switch (type) {
      case 'isPublic':
        ({ isPublic } = data);
        check(isPublic, Boolean);
        await ColorBooks.updateAsync({ _id }, { $set: { isPublic } });
        await updateUserPublicColorBookCount(this.userId);
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
