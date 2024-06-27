const { majorTriads } = require("./preset-generators/major-triads");
const { majorSevenths } = require("./preset-generators/major-sevenths");
const { perfectFifths } = require("./preset-generators/perfect-fifths");

function main() {
  majorTriads();
  perfectFifths();
  majorSevenths();
}

main();
