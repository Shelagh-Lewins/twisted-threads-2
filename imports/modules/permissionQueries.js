// gatekeepers for pattern and color book visibility

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
