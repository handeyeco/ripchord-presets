const { program } = require('commander');

program
  .option('-i, --input <path>', 'input path', './input')
  .option('-o, --output <path>', 'output path', "./output");