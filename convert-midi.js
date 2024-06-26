const fs = require("fs")
const { program } = require("commander");
const midiParser  = require('midi-parser-js');

program
  .option("-i, --input <path>", "input path", "./input")
  .option("-o, --output <path>", "output path", "./output")
  .option("-s --single", "include single chord files", false);

program.parse();
const options = program.opts();

function convertFile(path) {
  console.log("file: " + path)
}

function convertDir(path) {
  console.log("dir: " + path)
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