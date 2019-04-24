#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const yargs = require('yargs');
const { getFileBasenamesInDir } = require('./utils');
const globalOptions = require('./options/global');

// eslint-disable-next-line
yargs
  .usage(null)

  // Global options
  .options(globalOptions)
  .group('help', 'Global options:')
  .group('version', 'Global options:')

  // Commands
  .commandDir('cmds')
  .demandCommand(
    1,
    chalk.red(
      `You need to use a command in ${JSON.stringify(
        getFileBasenamesInDir(path.join(__dirname, 'cmds'))
      )}`
    )
  )

  // Examples
  .example('$0 init', 'Create a new project step by step with prompts\n')

  .example('$0 web dev [options]', 'Develop React web application')
  .example('$0 web build [options]', 'Build React web application')
  .example(
    '$0 web analyze [options]',
    'Analyze React web application bundles\n'
  )

  .example('$0 lib dev [options]', 'Develop React components library')
  .example(
    '$0 lib build [options]',
    'Build React components library to static document'
  )
  .example(
    '$0 lib compile [options]',
    'Compile React components library to node module\n'
  )

  .example('$0 doc dev [options]', 'Develop document')
  .example('$0 doc build [options]', 'Build document')
  .example('$0 doc analyze [options]', 'Analyze document bundles')

  // Misc
  .strict(true)
  .wrap(yargs.terminalWidth())
  .epilogue(chalk.cyan('For more information, see https://fedlinker.com'))
  .fail(function(message, err, yargs) {
    console.error(yargs.help());
    console.error('\n' + chalk.red(message));
    process.exit(1);
  })
  .showHelpOnFail().argv;
