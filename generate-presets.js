const { majorTriads } = require("./preset-generators/major-triads");
const { majorSevenths } = require("./preset-generators/major-sevenths");
const { perfectFifths } = require("./preset-generators/perfect-fifths");
const { perfectFourths } = require("./preset-generators/perfect-fourths");
const { scaleFifths } = require("./preset-generators/scale-fifths");
const {
  parallelMajorMinor,
} = require("./preset-generators/parallel-major-minor");

function main() {
  // chords in scales
  // majorTriads();
  // majorSevenths();
  // scaleFifths();

  // intervals
  // perfectFifths();
  // perfectFourths();

  // combos
  parallelMajorMinor();
}

main();
