// expectedTwillThreading.js
// Explicit expected threading for broken twill: 4 holes, 8 tablets, startTablet: 0
// BROKEN_TWILL_THREADING = [
//   ['F', 'B', 'B', 'B'],
//   ['F', 'F', 'B', 'F'],
//   ['B', 'F', 'F', 'F'],
//   ['B', 'B', 'F', 'B'],
// ]
// BROKEN_TWILL_FOREGROUND = 1, BROKEN_TWILL_BACKGROUND = 3
// For each hole, for each tablet, use the threading pattern cycling every 4 tablets

module.exports = [
  // Hole 0: ['F', 'B', 'B', 'B']
  [1, 3, 3, 3, 1, 3, 3, 3],
  // Hole 1: ['F', 'F', 'B', 'F']
  [1, 1, 3, 1, 1, 1, 3, 1],
  // Hole 2: ['B', 'F', 'F', 'F']
  [3, 1, 1, 1, 3, 1, 1, 1],
  // Hole 3: ['B', 'B', 'F', 'B']
  [3, 3, 1, 3, 3, 3, 1, 3],
];
