const fs = require("fs");
const path = require("path");
const { Midi } = require("tonal");

const { outputDir, convertToXML, writePreset } = require("./shared");

function perfectFifths() {
  const output = [];
  for (let i = 24; i < 108; i++) {
    output.push({
      name: `${Midi.midiToNoteName(i, { pitchClass: true })}5`,
      trigger: i,
      notes: [i, i + 7],
    });
  }
  const outDirPath = path.join(outputDir, "intervals");
  fs.mkdirSync(outDirPath, { recursive: true });
  const xml = convertToXML(output);
  writePreset(outDirPath, `perfect-fifths`, xml);
}

module.exports = {
  perfectFifths,
};
