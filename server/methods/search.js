import { check } from 'meteor/check';
import { Promise } from 'meteor/promise';
import { nonEmptyStringCheck } from '../../imports/server/modules/utils';
import { Patterns } from '../../imports/modules/collection';


/*
The challenge with search is to return on partial matches and to exclude any pattern the user should not see

Easysearch works well but has no server-side security, so the entire pattern list would have to be loaded onto the client

MongoDB full text search only matches whole words

Below is a regex search which matches partial words but is executed on the server and will not be cheap

Because nameSort and tags are lower case, we can convert the searchTerm to lower case also to get a case-insensitive search, presumably more cheaply than using the case-insensitive option

The aggregation allows us to pull in tags and search on those also

And to return the username of the pattern's creator
*/

Meteor.methods({
	'search.searchStart': function ({ searchTerm, limit = 10 }) {
		check(searchTerm, nonEmptyStringCheck);

		const searchString = `${searchTerm.toLowerCase()}`;

		// only return patterns the user is allowed to see
		const filter = {};

		if (Meteor.userId()) {
			filter.$or = [
				{ 'isPublic': { '$eq': true } },
				{ 'createdBy': this.userId },
			];
		} else {
			filter.isPublic = { '$eq': true };
		}

		const pipeline = [
			{
				'$match': filter,
			},
			// find the username of the pattern's owner
			{
				'$lookup': {
					'from': 'users',
					'localField': 'createdBy',
					'foreignField': '_id',
					'as': 'users',
				},
			},
			{
				'$addFields': {
					'user': { '$arrayElemAt': ['$users', 0] },
				},
			},
			{
				'$project': {
					'_id': 1,
					'name': 1,
					'numberOfTablets': 1,
					'nameSort': 1,
					'tags': 1,
					'username': '$user.username',
				},
			},
			// add tags
			{
				'$lookup': {
					'from': 'tags',
					'localField': 'tags',
					'foreignField': '_id',
					'as': 'tagObjects',
				},
			},
			{
				'$addFields': {
					'tagTexts': '$tagObjects.name',
				},
			},
			// search nameSort and tags
			{
				'$match': {
					'$or': [
						{
							'nameSort': {
								'$regex': searchString,
							},
						},
						{
							'tagTexts': {
								'$regex': searchString,
							},
						},
					],
				},
			},
		];
//TO DO limit
		const options = {};

		const result = Promise.await(Patterns.rawCollection().aggregate(pipeline, options)).toArray();

		//console.log('result 1', result1);

		//const result2 = Promise.await(result1.toArray());

		console.log('result', result);

		return result;

		/* const query = {
			'nameSort': {
				'$regex': searchString,
			},
		};

		// only return patterns the user should see
		if (Meteor.userId()) {
			query.$or = [
				{ 'isPublic': { '$eq': true } },
				{ 'createdBy': this.userId },
			];
		} else {
			query.isPublic = { '$eq': true };
		}

		const result = Patterns.find(
			query,
			{
				'fields': {
					'name': 1,
					'createdBy': 1, // TODO get username
					'numberOfTablets': 1,
				},
				'limit': limit,
			},
		).fetch(); */
		//console.log('limit', limit);
		//console.log('results', result);
// TO DO search on tags also
// aggregate?
// search for users
// show pretty results
// link to pattern /user
// show more
		return result;
	},
});
