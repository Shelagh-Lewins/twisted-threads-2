import {
	Patterns,
	Tags,
} from '../../imports/modules/collection';

const migrateTags = () => {
	console.log('*** starting to migrate tags');
	// tags previously used Meteor package patrickleet:tags@1.2.0
	// which was last updated 5 years ago
	// it may be fine but I don't want to use a stale package

	// we are now using npm package "react-tag-autocomplete": "^6.0.0-beta.3",

	// tags in the old format are an array of names like
	/* "tags" : [
			"missed-hole",
			"warp-twined",
			"viking"
	], */
	// the tags array contains tag objects which must be keyed by name but have an id, and lots of other data like nRefs

	// in the new scheme the tags database is managed manually
	// each tag is defined by simply _id and name, which we trust the server to make sure is unique (name is indexed), and remove unused tags
	// the disadvantage is that tags in pattern data are not human readable
	// but we do avoid duplicate data
	// this could be rewritten but would make the React component more complex

	// first clear out the tags collection because it doesn't contain any information we need to keep
	Tags.remove({});

	// for each pattern, convert the tags to the new form
	Patterns.find().fetch().forEach((pattern) => {
		// old tags for pattern; ensure lower case and no duplicates
		const { tags } = pattern;

		if (tags) {
			const oldTags = new Set(tags.map((tag) => tag.toLowerCase()));
			const newTags = [];
			//const oldTags = new Set(tags);

			oldTags.forEach((tag) => {
				let tagId;
				const existingTag = Tags.findOne({ 'name': tag });

				if (existingTag) { // use an existing tag
					tagId = existingTag._id;
				} else { // create a new tag
					tagId = Tags.insert({
						'name': tag,
					});
				}

				newTags.push(tagId);
			});
			// assign the ids to the pattern
			Patterns.update(
				{ '_id': pattern._id },
				{ '$set': { 'tags': newTags } },
			);
		}
	});
	console.log('*** finished migrating tags');
};

export default migrateTags;
