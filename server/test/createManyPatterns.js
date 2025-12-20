// Creates patterns for tests. Not used in main application.

import { Patterns } from '../../imports/modules/collection';
import { defaultPatternData } from './testData';

// this must be called with async / await
const createManyPatterns = async () => {
  await Patterns.removeAsync({});

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

  const setCreatedAt = async (patternId) => {
    const newDate = now.setSeconds(now.getSeconds() + 10 * count);

    await Patterns.updateAsync(
      { _id: patternId },
      { $set: { createdAt: newDate } },
    );
    count += 1;
  };

  // patterns belonging to current user
  for (let i = 0; i < numberOfMyPublicPatterns; i += 1) {
    const name = `${i} my public pattern`;
    publicMyPatternNames.push(name);

    const patternId = await Patterns.insertAsync({
      ...defaultPatternData,
      name,
      nameSort: name,
      createdBy: Meteor.userId(),
      isPublic: true,
    });

    await setCreatedAt(patternId);
  }

  for (let i = 0; i < numberOfMyPrivatePatterns; i += 1) {
    const name = `${i} my private pattern`;
    privateMyPatternNames.push(name);

    const patternId = await Patterns.insertAsync({
      ...defaultPatternData,
      name,
      nameSort: name,
      createdBy: Meteor.userId(),
      isPublic: false,
    });

    await setCreatedAt(patternId);
  }

  // patterns belonging to some other user
  for (let i = 0; i < numberOfOtherPublicPatterns; i += 1) {
    const name = `${i} other public pattern`;
    publicOtherPatternNames.push(name);

    const patternId = await Patterns.insertAsync({
      ...defaultPatternData,
      name,
      nameSort: name,
      createdBy: 'xxx',
      isPublic: true,
    });

    await setCreatedAt(patternId);
  }

  for (let i = 0; i < numberOfOtherPrivatePatterns; i += 1) {
    const name = `${i} other private pattern`;
    privateOtherPatternNames.push(name);

    const patternId = await Patterns.insertAsync({
      ...defaultPatternData,
      name,
      nameSort: name,
      createdBy: 'xxx',
      isPublic: false,
    });

    await setCreatedAt(patternId);
  }

  return {
    publicMyPatternNames,
    privateMyPatternNames,
    publicOtherPatternNames,
    privateOtherPatternNames,
  };
};

export default createManyPatterns;
