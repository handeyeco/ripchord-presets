const fs = require("fs");
const path = require("path");
const { Midi } = require("tonal");

const { outputDir, convertToXML, writePreset } = require("./shared");

function perfectFourths() {
  const output = [];
  for (let i = 24; i < 108; i++) {
    output.push({
      name: `${Midi.midiToNoteName(i, { pitchClass: true })}4`,
      trigger: i,
      notes: [i, i + 5],
    });
  }
  const outDirPath = path.join(outputDir, "intervals");
  fs.mkdirSync(outDirPath, { recursive: true });
  const xml = convertToXML(output);
  writePreset(outDirPath, `perfect-fourths`, xml);
}

module.exports = {
  perfectFourths,
};
