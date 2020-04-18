// gatekeepers for pattern, color book, set visibility

// logged in user can see their own patterns
// and any public patterns
// not logged in user sees only public patterns
export const getPatternPermissionQuery = () => {
	let permissionQuery = {
		'isPublic': { '$eq': true },
	};

	if (Meteor.userId()) {
		permissionQuery = {
			'$or': [
				{ 'isPublic': { '$eq': true } },
				{ 'createdBy': Meteor.userId() },
			],
		};
	}

	return permissionQuery;
};

// select users that have public color books or public patterns
// or are the logged in user
export const getUserPermissionQuery = () => {
	let permissionQuery = {
		'$or': [
			{ 'publicPatternsCount': { '$gt': 0 } },
			{ 'publicColorBooksCount': { '$gt': 0 } },
		],
	};

	if (Meteor.userId()) {
		permissionQuery = {
			'$or': [
				{ 'publicPatternsCount': { '$gt': 0 } },
				{ 'publicColorBooksCount': { '$gt': 0 } },
				{ '_id': Meteor.userId() },
			],
		};
	}

	return permissionQuery;
};

// /////////////////////////
// sets

// THIS IS WRONG - sets are returned for a specified user
// sets can only be returned for the current user
// or a user with public patterns
// note a further check is required on individual sets, that 
// they contain public patterns
/* export const getSetsForUserPermissionQuery = () => {
	let permissionQuery = { 'publicPatternsCount': { '$gt': 0 } };

	if (Meteor.userId()) {
		permissionQuery = {
			'$or': [
				{ 'publicPatternsCount': { '$gt': 0 } },
				{ '_id': Meteor.userId() },
			],
		};
	}

	return permissionQuery;
};
 */