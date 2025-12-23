// expectedDoubleFacedThreading.js
// Explicit expected threading for double-faced: 10 rows (holes), 8 tablets
// These values are based on DOUBLE_FACED_THREADING = ['F', 'F', 'B', 'B'] and colors 1 (foreground), 3 (background)
// The threading pattern repeats every 4 rows: [F, F, B, B]

module.exports = [
  [1,1,1,1,1,1,1,1], // row 0: F
  [1,1,1,1,1,1,1,1], // row 1: F
  [3,3,3,3,3,3,3,3], // row 2: B
  [3,3,3,3,3,3,3,3], // row 3: B
];
