const fs = require("fs")
const path = require("path")
const { Midi } = require("tonal");
const { program } = require("commander");
const midiParser  = require('midi-parser-js');

program
  .option("-i, --input <path>", "input path", "./input")
  .option("-o, --output <path>", "output path", "./output")
  .option("-s --single", "include single chord files", false);

program.parse();
const options = program.opts();

let doneOne = false

function writePreset(filePath, data) {
  // doneOne = true

  console.log(filePath, data)
}

function isSharp(str) {
  return /[A-Ga-g]#/.test(str)
}

function isFlat(str) {
  return /[A-Ga-g]b/.test(str)
}

function convertFile(filePath) {
  if (filePath.slice(-4) !== ".mid") {
    return
  }

  const loaded = fs.readFileSync(filePath)
  var midiArray = midiParser.parse(loaded)

  let chords = []
  let name = ""
  let notes = []

  const baseName = path.basename(filePath)
  let sharps = isSharp(baseName)
  let flats = isFlat(baseName)

  midiArray.track.forEach(t => {
    // TODO this is probably too naive
    t.event.forEach(e => {
      // note one
      if (e.type === 9) {
        notes.push(e.data[0])
      }
      // note off
      else if (e.type === 8 && notes.length) {
        chords.push({
          name,
          notes
        })
        name = ""
        notes = []
      }
      // maybe name?
      else if (e.type === 255 && e.metaType === 3 && e.data) {
        name = e.data
        if (isSharp(name)) {
          sharps = true
        } else if (isFlat(name)) {
          flats = true
        }
      }
    })
  })

  const allNamed = chords.every(c => !!c.name)

  chords.forEach(c => {
    const notesString = c.notes.map(n => (
      // if sharps and flats are both true: use sharps
      // if flats is true: don't use sharps
      // otherwise: use sharps
      Midi.midiToNoteName(n, { sharps: (sharps && flats) ? true : flats ? false : true })
    )).join(" ")

    if (allNamed) {
      c.notesString = notesString
    } else {
      c.name = notesString
    }
  })

  if (chords.length && (options.single || chords.length > 1)) {
    writePreset(filePath, chords)
  }
}

function convertDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    if (doneOne) return

    const fullPath = path.join(dir, file)
    if (!fs.existsSync(fullPath)) {
      return
    }
    
    if (fs.lstatSync(fullPath).isDirectory()) {
      return convertDir(fullPath)
    }
    
    return convertFile(fullPath)
  })
}

function main() {
  if (!fs.existsSync(options.input)) {
    console.error('input path not found')
  }

  if (!fs.existsSync(options.output)) {
    console.error('output path not found')
  }

  if (fs.lstatSync(options.input).isDirectory()) {
    convertDir(options.input)
  } else {
    convertFile(options.input)
  }
}

main()