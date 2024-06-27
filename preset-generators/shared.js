const fs = require("fs");
const path = require("path");
const { create } = require("xmlbuilder2");
const { Midi } = require("tonal");

const outputDir = "base";

function writePreset(dir, name, xml) {
  fs.writeFileSync(path.join(dir, `${name}.rpc`), xml);
}

function logPreset(data) {
  data.forEach((e) => {
    console.log();
    console.log(e.name);
    console.log(Midi.midiToNoteName(e.trigger));
    console.log(e.notes.map(Midi.midiToNoteName).join(" "));
  });
}

function convertToXML(data) {
  const ripchordElement = create().ele("ripchord");
  const presetElement = ripchordElement.ele("preset");

  data.forEach((e) => {
    const input = presetElement.ele("input");
    input.att("note", `${e.trigger}`);
    const chord = input.ele("chord");
    chord.att("name", e.name);
    chord.att("notes", e.notes.join(";"));
  });

  const xml = ripchordElement.end({ prettyPrint: true });
  return xml;
}

module.exports = {
  outputDir,
  convertToXML,
  logPreset,
  writePreset,
};
