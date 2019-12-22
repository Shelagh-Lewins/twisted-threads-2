import { check } from 'meteor/check';
import { checkUserCanCreateColorBook, nonEmptyStringCheck } from '../../imports/server/modules/utils';
import { ColorBooks } from '../../imports/modules/collection';
import {
	COLORS_IN_COLOR_BOOK,
	DEFAULT_COLOR_BOOK_COLOR,
} from '../../imports/modules/parameters';

Meteor.methods({
	'colorBook.add': function (name) {
		check(name, nonEmptyStringCheck);

		const { error, result } = checkUserCanCreateColorBook();

		if (error) {
			throw error;
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

		return ColorBooks.remove({ _id });
	},
	'colorBook.copy': function (_id) {
		check(_id, nonEmptyStringCheck);

		const { error, result } = checkUserCanCreateColorBook();

		if (error) {
			throw error;
		}

		const colorBook = ColorBooks.findOne({ _id });

		if (!colorBook) {
			throw new Meteor.Error('copy-color-book-not-found', 'Unable to copy color book because the color book was not found');
		}

		if (colorBook.createdBy !== Meteor.userId()
			&& !colorBook.isPublic) {
			throw new Meteor.Error('copy-color-book-not-created-by-user-and-not-public', 'Unable to copy color book because it was not created by the current logged in user and is not public');
		}

		// create a new color book
		const { colors } = colorBook;
		let { name } = colorBook;
		name = `${name} (copy)`;

		const newColorBookId = Meteor.call('colorBook.add', name);

		ColorBooks.update({ '_id': newColorBookId },
			{
				'$set': {
					'colors': colors,
				},
			});

		return newColorBookId;
	},
	'colorBook.edit': function ({
		_id,
		data,
	}) {
		check(_id, nonEmptyStringCheck);
		check(data, Match.ObjectIncluding({ 'type': String }));
		// type specifies the update operation
		// e.g. color, isPublic

		const { type } = data;

		if (!Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-not-logged-in', 'Unable to edit color book because the user is not logged in');
		}

		const colorBook = ColorBooks.findOne({ _id });

		// to be filled in by data depending on case
		let colorHexValue;
		let colorIndex;
		let isPublic;
		let name;

		if (!colorBook) {
			throw new Meteor.Error('edit-color-book-not-found', 'Unable to edit color book because the color book was not found');
		}

		if (colorBook.createdBy !== Meteor.userId()) {
			throw new Meteor.Error('edit-color-book-not-created-by-user', 'Unable to edit color book because color book was not created by the current logged in user');
		}

		switch (type) {
			case 'isPublic':
				({ isPublic } = data);
				check(isPublic, Boolean);

				return ColorBooks.update({ _id }, { '$set': { 'isPublic': isPublic } });

			case 'color':
				({ colorIndex, colorHexValue } = data);
				check(colorIndex, Number);
				check(colorHexValue, nonEmptyStringCheck);

				// update the value in the nested arrays
				return ColorBooks.update({ _id }, { '$set': { [`colors.${colorIndex}`]: colorHexValue } });

			case 'name':
				({ name } = data);
				check(name, nonEmptyStringCheck);

				return ColorBooks.update({ _id }, { '$set': { 'name': name, 'nameSort': name.toLowerCase() } });

			default:
				break;
		}
	},
});
