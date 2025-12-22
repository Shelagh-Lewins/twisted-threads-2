// gatekeepers for pattern, color book, set visibility

// logged in user can see their own patterns
// and any public patterns
// not logged in user sees only public patterns
export const getPatternPermissionQuery = (userId) => {
  let permissionQuery = {
    isPublic: { $eq: true },
  };

  if (userId) {
    permissionQuery = {
      $or: [{ isPublic: { $eq: true } }, { createdBy: userId }],
    };
  }

  return permissionQuery;
};

// select users that have public patterns, sets or color books
// or are the logged in user
export const getUserPermissionQuery = (userId) => {
  let permissionQuery = {
    $or: [
      { publicColorBooksCount: { $gt: 0 } },
      { publicSetsCount: { $gt: 0 } },
      { publicPatternsCount: { $gt: 0 } },
    ],
  };

  if (userId) {
    permissionQuery = {
      $or: [
        { publicColorBooksCount: { $gt: 0 } },
        { publicSetsCount: { $gt: 0 } },
        { publicPatternsCount: { $gt: 0 } },
        { _id: userId },
      ],
    };
  }

  return permissionQuery;
};

// /////////////////////////
// sets

// select sets that contain public patterns
// or were created by the logged in user
export const getSetPermissionQuery = (userId) => {
  let permissionQuery = {
    publicPatternsCount: { $gt: 0 },
  };

  if (userId) {
    permissionQuery = {
      $or: [{ publicPatternsCount: { $gt: 0 } }, { createdBy: userId }],
    };
  }

  return permissionQuery;
};
