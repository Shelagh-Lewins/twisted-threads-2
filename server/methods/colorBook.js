import { check } from 'meteor/check';
import { nonEmptyStringCheck } from '../utils';
import { ColorBooks } from '../../imports/collection';
import {
	COLORS_IN_COLOR_BOOK,
	DEFAULT_COLOR_BOOK_COLOR,
} from '../../imports/parameters';

Meteor.methods({
	'colorBook.add': function (name) {
		check(name, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('add-color-book-not-logged-in', 'Unable to create color book because the user is not logged in');
		}

		if (!Meteor.user().emails[0].verified) {
			throw new Meteor.Error('add-color-book-not-verified', 'Unable to create color book because the user\'s email address is not verified');
		}

		const colors = new Array(COLORS_IN_COLOR_BOOK).fill(DEFAULT_COLOR_BOOK_COLOR);

		return ColorBooks.insert({
			name,
			'nameSort': name.toLowerCase(),
			'createdAt': new Date(),
			'createdBy': Meteor.userId(),
			'colors': colors,
			'isPublic': false,
		});
	},
	'colorBook.editColor': function ({
		_id,
		colorHexValue,
		colorIndex,
	}) {
		check(_id, nonEmptyStringCheck);
		check(colorHexValue, nonEmptyStringCheck);
		check(colorIndex, Match.Integer);

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-color-not-logged-in', 'Unable to edit color book color because the user is not logged in');
		}

		const colorBook = ColorBooks.findOne({ _id });

		if (!colorBook) {
			throw new Meteor.Error('edit-color-book-color-not-found', 'Unable to edit color book color because the color book was not found');
		}

		if (colorBook.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-color-not-created-by-user', 'Unable to edit color book color because it was not created by the current logged in user');
		}

		// update the value in the nested arrays
		return ColorBooks.update({ _id }, { '$set': { [`colors.${colorIndex}`]: colorHexValue } });
	},
	'colorBook.editName': function ({
		_id,
		name,
	}) {
		check(_id, nonEmptyStringCheck);
		check(name, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-name-not-logged-in', 'Unable to edit color book name because the user is not logged in');
		}

		const colorBook = ColorBooks.findOne({ _id });

		if (!colorBook) {
			throw new Meteor.Error('edit-color-book-name-not-found', 'Unable to edit color book name because the color book was not found');
		}

		if (colorBook.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-name-not-created-by-user', 'Unable to edit color book name because it was not created by the current logged in user');
		}

		return ColorBooks.update({ _id }, { '$set': { 'name': name, 'nameSort': name.toLowerCase() } });
	},
	'colorBook.remove': function (_id) {
		check(_id, nonEmptyStringCheck);

		if (!Meteor.userId()) {
			throw new Meteor.Error('remove-color-book-not-logged-in', 'Unable to remove color book because the user is not logged in');
		}

		const colorBook = ColorBooks.findOne({ _id });

		if (!colorBook) {
			throw new Meteor.Error('remove-color-book-not-found', 'Unable to remove color book because the color book was not found');
		}

		if (colorBook.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('remove-color-book-not-created-by-user', 'Unable to remove color book because it was not created by the current logged in user');
		}

		check(_id, String);

		return ColorBooks.remove({ _id });
	},
});
