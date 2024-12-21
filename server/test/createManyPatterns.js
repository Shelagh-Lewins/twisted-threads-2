// Creates patterns for tests. Not used in main application.

import { Patterns } from '../../imports/modules/collection';

// this must be called with async / await
const createManyPatterns = async () => {
  Patterns.removeAsync({});

  const publicMyPatternNames = [];
  const privateMyPatternNames = [];

  const publicOtherPatternNames = [];
  const privateOtherPatternNames = [];

  const numberOfMyPublicPatterns = 20;
  const numberOfMyPrivatePatterns = 15;
  const numberOfOtherPublicPatterns = 9;
  const numberOfOtherPrivatePatterns = 23;

  // make sure all patterns have consistent, different createdAt dates
  const now = new Date();
  let count = 0;

  const setCreatedAt = async (pattern) => {
    const newDate = now.setSeconds(now.getSeconds() + 10 * count);

    await Patterns.updateAsync(
      { _id: pattern._id },
      { $set: { createdAt: newDate } },
    );
    count += 1;
  };

  // patterns belonging to current user
  for (let i = 0; i < numberOfMyPublicPatterns; i += 1) {
    const name = `${i} my public pattern`;
    publicMyPatternNames.push(name);

    const pattern = Factory.create('pattern', {
      name,
      nameSort: name,
      createdBy: Meteor.userAsync()._id,
      isPublic: true,
    });

    setCreatedAt(pattern);
  }

  for (let i = 0; i < numberOfMyPrivatePatterns; i += 1) {
    const name = `${i} my private pattern`;
    privateMyPatternNames.push(name);

    const pattern = Factory.create('pattern', {
      name,
      nameSort: name,
      createdBy: Meteor.userAsync()._id,
      isPublic: false,
    });

    setCreatedAt(pattern);
  }

  // patterns belonging to some other user
  for (let i = 0; i < numberOfOtherPublicPatterns; i += 1) {
    const name = `${i} other public pattern`;
    publicOtherPatternNames.push(name);

    const pattern = Factory.create('pattern', {
      name,
      nameSort: name,
      createdBy: 'xxx',
      isPublic: true,
    });

    setCreatedAt(pattern);
  }

  for (let i = 0; i < numberOfOtherPrivatePatterns; i += 1) {
    const name = `${i} other private pattern`;
    privateOtherPatternNames.push(name);

    const pattern = Factory.create('pattern', {
      name,
      nameSort: name,
      createdBy: 'xxx',
      isPublic: false,
    });

    setCreatedAt(pattern);
  }

  // Patterns.find()
  //   .fetch()
  //   .forEach(async (pattern) => {
  //     const newDate = pattern.createdAt.setSeconds(
  //       now.getSeconds() + 10 * count,
  //     );
  //     await Patterns.updateAsync(
  //       { _id: pattern._id },
  //       { $set: { createdAt: newDate } },
  //     );
  //     count += 1;
  //   });

  return {
    publicMyPatternNames,
    privateMyPatternNames,
    publicOtherPatternNames,
    privateOtherPatternNames,
  };
};

export default createManyPatterns;
