// after subscribing to an array of patterns
// now subscribe to pattern previews and users
// for those patterns
// Returns an object with subscription handles for checking readiness
const secondaryPatternSubscriptions = (patterns) => {
  const patternIds = patterns.map((pattern) => pattern._id);

  const patternPreviewsHandle = Meteor.subscribe('patternPreviews', {
    patternIds,
  });

  const userIds = patterns.map((pattern) => pattern.createdBy);
  const uniqueUsers = [...new Set(userIds)];

  const usersHandle = Meteor.subscribe('users', uniqueUsers);

  return {
    patternPreviewsHandle,
    usersHandle,
    ready: () => patternPreviewsHandle.ready() && usersHandle.ready(),
  };
};

export default secondaryPatternSubscriptions;
