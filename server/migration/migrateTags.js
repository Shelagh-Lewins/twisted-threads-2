import {
	Patterns,
	Tags,
} from '../../imports/modules/collection';
import { MAX_TAG_LENGTH, MIN_TAG_LENGTH } from '../../imports/modules/parameters';

const migrateTags = () => {
	console.log('*** starting to migrate tags');
	// tags previously used Meteor package patrickleet:tags@1.2.0
	// which was last updated 5 years ago
	// it requires an older version of Collection2 and SimpleSchema than I am now using. I don't want to backtrack on those so instead have written my own simple system.

	// tags in patterns are an array of names like
	/* "tags" : [
			"missed-hole",
			"warp-twined",
			"viking"
	], */
	// the old Tags collection contains tag objects which are indexed by name but have other data like nRefs

	// in the new scheme the tags collection is similar but each tag is defined by simply _id and name. We trust the methods to make sure is unique (name is indexed), and remove unused tags

	// first clear out the tags collection because it doesn't contain any information we need to keep
	Tags.remove({});

	// for each pattern, ensure the tags are in the Tags collection
	Patterns.find().fetch().forEach((pattern) => {
		const { tags } = pattern;

		if (tags) {
			// ensure lower case and no duplicates
			const oldTags = new Set(tags.map((tag) => {
				let processedTag = tag;

				while (processedTag.length < MIN_TAG_LENGTH) {
					processedTag += '_';
				}

				if (processedTag.length > MAX_TAG_LENGTH) {
					processedTag = processedTag.slice(0, MAX_TAG_LENGTH);
				}

				return processedTag.toLowerCase();
			}));
			const newTags = [];

			oldTags.forEach((tag) => {
				const existingTag = Tags.findOne({ 'name': tag });

				if (!existingTag) { // create a new tag
					Tags.insert({
						'name': tag,
					});
				}

				newTags.push(tag);
			});

			// assign the tags to the pattern
			Patterns.update(
				{ '_id': pattern._id },
				{ '$set': { 'tags': newTags } },
			);
		}
	});
	console.log('*** finished migrating tags');
};

export default migrateTags;
