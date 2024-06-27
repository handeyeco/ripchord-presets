const fs = require("fs");
const path = require("path");
const { Key, Midi } = require("tonal");
const { create } = require("xmlbuilder2");

const outputdir = "base";

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

function writePreset(dir, name, xml) {
  fs.writeFileSync(path.join(dir, `${name}.rpc`), xml);
}

function majorScaleChords() {
  const baseMap = [];
  const chordNames = ["I", "ii", "iii", "IV", "V", "vi", "vii (dim)"];
  const scaleNotes = Key.majorKey("C").scale;
  const notes = [
    ...scaleNotes.map((n) => Midi.toMidi(`${n}1`)),
    ...scaleNotes.map((n) => Midi.toMidi(`${n}2`)),
  ];

  for (let i = 0; i < 7; i++) {
    baseMap.push({
      trigger: notes[i],
      notes: [notes[i], notes[i + 2], notes[i + 4]],
      name: chordNames[i],
    });
  }

  const fullPreset = [];
  for (let i = 0; i < 7; i++) {
    const transpose = i * 12;
    baseMap.forEach((e) => {
      fullPreset.push({
        name: e.name,
        trigger: e.trigger + transpose,
        notes: e.notes.map((n) => n + transpose),
      });
    });
  }

  const allNotes = [
    "c",
    "cs",
    "d",
    "ds",
    "e",
    "f",
    "fs",
    "g",
    "gs",
    "a",
    "as",
    "b",
  ];
  const outDirPath = path.join(outputdir, "major-scale");
  fs.mkdirSync(outDirPath, { recursive: true });

  for (let i = 0; i < allNotes.length; i++) {
    const transposed = fullPreset.map((e) => ({
      name: e.name,
      trigger: e.trigger + i,
      notes: e.notes.map((n) => n + i),
    }));
    console.log(transposed);
    const xml = convertToXML(transposed);
    writePreset(outDirPath, `${allNotes[i]}-major`, xml);
  }
}

function main() {
  majorScaleChords();
}

main();
