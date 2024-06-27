const fs = require("fs");
const path = require("path");
const { Midi } = require("tonal");
const { program } = require("commander");
const midiParser = require("midi-parser-js");
const { create } = require("xmlbuilder2");

program
  .option("-i, --input <path>", "relative input path", "./input")
  .option("-o, --output <path>", "relative output path", "./output")
  .option("-s --single", "include single chord files", false)
  .option("-c --middlec", "force triggers to group around middle c", false)
  .option("-d --dedupe", "remove duplicate chords", false);

program.parse();
const options = program.opts();

let doneOne = false;

let written = 0;
function printProgress() {
  written++;
  process.stdout.clearLine(0);
  process.stdout.cursorTo(0);
  process.stdout.write(`presets written: ${written}`);
}

function getNewPath(filePath) {
  let inputPath = options.input;
  if (!inputPath.startsWith("./")) {
    inputPath = "./" + inputPath;
  }

  let outputPath = options.output;
  if (!outputPath.startsWith("./")) {
    outputPath = "./" + outputPath;
  }

  let relativeFilePath = filePath;
  if (!relativeFilePath.startsWith("./")) {
    relativeFilePath = "./" + relativeFilePath;
  }

  const converted = relativeFilePath
    .replace(inputPath, outputPath)
    .replace(".mid", ".rpc");

  return converted;
}

function writePreset(filePath, data) {
  // doneOne = true

  const ripchordElement = create().ele("ripchord");
  const presetElement = ripchordElement.ele("preset");

  // different trigger strategies, order of preference:
  // - use the first note in the chord
  // - use the lowest note in the chord
  // - group notes around middle c
  let triggerIsFirstNote = !options.middlec;
  let triggerIsLowNote = !options.middlec;
  if (!options.middlec) {
    let firstNoteMap = {};
    let lowNoteMap = {};
    data.forEach((e) => {
      if (!triggerIsFirstNote && !triggerIsLowNote) return;

      if (firstNoteMap[e.notes[0]]) {
        triggerIsFirstNote = false;
      } else {
        firstNoteMap[e.notes[0]] = true;
      }

      const sortedNotes = e.notes.sort();
      if (lowNoteMap[sortedNotes[0]]) {
        triggerIsLowNote = false;
      } else {
        lowNoteMap[sortedNotes[0]] = true;
      }
    });
  }

  // if we don't have clear root numbers,
  // group mappings around middle C
  let middleCTrigger = 60 - Math.floor(data.length / 2);
  if (Midi.midiToNoteName(middleCTrigger).includes("b")) {
    middleCTrigger -= 1;
  }
  data.forEach((e) => {
    const trigger = triggerIsFirstNote
      ? e.notes[0]
      : triggerIsLowNote
      ? e.notes.sort()[0]
      : middleCTrigger;

    const input = presetElement.ele("input");
    input.att("note", `${trigger}`);
    const chord = input.ele("chord");
    chord.att("name", e.name);
    chord.att("notes", e.notes.join(";"));

    // keep notes on white keys when grouping around middle c
    // TODO reconsider this?
    middleCTrigger += Midi.midiToNoteName(middleCTrigger + 1).includes("b")
      ? 2
      : 1;
  });

  const xml = ripchordElement.end({ prettyPrint: true });
  const outputPath = getNewPath(filePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, xml);
  printProgress();
}

function isSharp(str) {
  return /[A-Ga-g]#/.test(str);
}

function isFlat(str) {
  return /[A-Ga-g]b/.test(str);
}

function convertFile(filePath) {
  if (filePath.slice(-4) !== ".mid") {
    return;
  }

  const loaded = fs.readFileSync(filePath);
  var midiArray = midiParser.parse(loaded);

  let chords = [];
  let name = "";
  let notes = [];

  const baseName = path.basename(filePath);
  let sharps = isSharp(baseName);
  let flats = isFlat(baseName);

  midiArray.track.forEach((t) => {
    // TODO this is probably too naive
    t.event.forEach((e) => {
      // note one
      if (e.type === 9) {
        notes.push(e.data[0]);
      }
      // note off
      else if (e.type === 8 && notes.length) {
        chords.push({
          name,
          notes,
        });
        name = "";
        notes = [];
      }
      // maybe name?
      else if (e.type === 255 && e.metaType === 3 && e.data) {
        name = e.data;
        if (isSharp(name)) {
          sharps = true;
        } else if (isFlat(name)) {
          flats = true;
        }
      }
    });
  });

  const allNamed = chords.every((c) => !!c.name);

  chords.forEach((c) => {
    const notesString = c.notes
      .map((n) =>
        // if sharps and flats are both true: use sharps
        // if flats is true: don't use sharps
        // otherwise: use sharps
        Midi.midiToNoteName(n, {
          sharps: sharps && flats ? true : flats ? false : true,
        })
      )
      .join(" ");

    if (allNamed) {
      c.notesString = notesString;
    } else {
      c.name = notesString;
    }
  });

  // optionally remove chords that use the same keys
  if (options.dedupe) {
    const existing = {};
    const deduped = [];

    chords.forEach((c) => {
      const key = c.notes.sort().join(";");
      if (!existing[key]) {
        deduped.push(c);
        existing[key] = true;
      }
    });

    chords = deduped;
  }

  if (chords.length && (options.single || chords.length > 1)) {
    writePreset(filePath, chords);
  }
}

function convertDir(dir) {
  fs.readdirSync(dir).forEach((file) => {
    if (doneOne) return;

    const fullPath = path.join(dir, file);
    if (!fs.existsSync(fullPath)) {
      return;
    }

    if (fs.lstatSync(fullPath).isDirectory()) {
      return convertDir(fullPath);
    }

    return convertFile(fullPath);
  });
}

function main() {
  if (!fs.existsSync(options.input)) {
    console.error("input path not found");
  }

  if (!fs.existsSync(options.output)) {
    console.error("output path not found");
  }

  console.log("converting (this could take awhile)");

  if (fs.lstatSync(options.input).isDirectory()) {
    convertDir(options.input);
  } else {
    convertFile(options.input);
  }
}

main();
