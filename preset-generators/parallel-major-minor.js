const fs = require("fs");
const path = require("path");
const { Key, Midi } = require("tonal");

const { outputDir, convertToXML, writePreset, logPreset } = require("./shared");

function majorTriad(sevenths) {
  // make a scale using C Maj
  const majorMap = [];
  const majChordNames = [
    "Maj I",
    "Maj ii",
    "Maj iii",
    "Maj IV",
    "Maj V",
    "Maj vi",
    "Maj vii (dim)",
  ];
  const majorNotes = Key.majorKey("C").scale;
  const majNoteBank = [
    ...majorNotes.map((n) => Midi.toMidi(`${n}` + (sevenths ? 2 : 4))),
    ...majorNotes.map((n) => Midi.toMidi(`${n}` + (sevenths ? 3 : 5))),
  ];

  for (let i = 0; i < 7; i++) {
    const mapping = {
      trigger: majNoteBank[i],
      notes: [
        majNoteBank[i] + (sevenths ? 24 : 0),
        majNoteBank[i + 2] + (sevenths ? 24 : 0),
        majNoteBank[i + 4] + (sevenths ? 24 : 0),
      ],
      name: majChordNames[i],
    };
    if (sevenths) {
      mapping.notes.push(majNoteBank[i + 6] + 24);
      let name7th = mapping.name.split(" ");
      name7th =
        name7th.slice(0, 2).join(" ") + "7 " + name7th.slice(2).join(" ");
      mapping.name = name7th;
    }
    majorMap.push(mapping);
  }

  return majorMap;
}

function minorTriad(sevenths) {
  // make a scale using C natural min
  const minorMap = [];
  const minChordNames = [
    "min i",
    "min ii (dim)",
    "min III",
    "min iv",
    "min v",
    "min VI",
    "min VII",
  ];
  const minorNotes = Key.minorKey("C").natural.scale;
  const minNoteBank = [
    ...minorNotes.map((n) => Midi.toMidi(`${n}` + (sevenths ? 3 : 5))),
    ...minorNotes.map((n) => Midi.toMidi(`${n}` + (sevenths ? 4 : 6))),
  ];

  for (let i = 0; i < 7; i++) {
    const mapping = {
      trigger: minNoteBank[i],
      notes: [
        minNoteBank[i] + (sevenths ? 12 : -12),
        minNoteBank[i + 2] + (sevenths ? 12 : -12),
        minNoteBank[i + 4] + (sevenths ? 12 : -12),
      ],
      name: minChordNames[i],
    };
    if (sevenths) {
      mapping.notes.push(minNoteBank[i + 6] + 12);
      let name7th = mapping.name.split(" ");
      name7th =
        name7th.slice(0, 2).join(" ") + "7 " + name7th.slice(2).join(" ");
      mapping.name = name7th;
    }
    minorMap.push(mapping);
  }

  return minorMap;
}

function parallelMajorMinor() {
  const fullPreset = [
    ...majorTriad(true),
    ...minorTriad(true),
    ...majorTriad(),
    ...minorTriad(),
  ];

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

  const outDirPath = path.join(outputDir, "combo", "parallel-major-minor");
  fs.mkdirSync(outDirPath, { recursive: true });
  for (let i = 0; i < allNotes.length; i++) {
    const transposed = fullPreset.map((e) => ({
      name: e.name,
      trigger: e.trigger + i,
      notes: e.notes.map((n) => n + i),
    }));
    const xml = convertToXML(transposed);
    writePreset(outDirPath, `${allNotes[i]}-parallel-major-minor`, xml);
  }
}

module.exports = { parallelMajorMinor };
