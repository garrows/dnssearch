#! /usr/bin/env node

var _ = require('underscore'),
  main = require('./main'),
  helpers = require('./helpers'),
  program = require('commander');

program
  .usage('[options] <domain>')
  .option('-L, --nolog', 'Do not log to a file')
  .option('-t, --tlds <items>', 'Comma seperated list of TLDS to search', helpers.list)
  .option('-v, --verbose', 'Verbose mode')
  .parse(process.argv);

main(program.args, {
  nolog: program.nolog,
  tlds: program.tlds || [],
  unavailable: program.unavailable === true,
  verbose: program.verbose === true
});