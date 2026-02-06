#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { init } from './commands/init.js';
import { update } from './commands/update.js';
import { status } from './commands/status.js';

const program = new Command();

program
  .name('mother-brain')
  .description('AI-powered project management framework for GitHub Copilot CLI')
  .version('0.0.1');

program
  .command('init')
  .description('Initialize Mother Brain in the current project')
  .option('-f, --force', 'Overwrite existing skills')
  .action(init);

program
  .command('update')
  .description('Update Mother Brain skills to the latest version')
  .action(update);

program
  .command('status')
  .description('Show installed version and available updates')
  .action(status);

// Default action when no command is provided
program
  .action(() => {
    console.log(chalk.cyan(`
┳┳┓┏┓┏┳┓┓┏┏┓┳┓  ┳┓┳┓┏┓┳┳┓
┃┃┃┃┃ ┃ ┣┫┣ ┣┫  ┣┫┣┫┣┫┃┃┃
┛ ┗┗┛ ┻ ┛┗┗┛┛┗  ┻┛┛┗┛┗┻┛┗
`));
    console.log(chalk.white('AI-powered project management for GitHub Copilot CLI\n'));
    console.log('Commands:');
    console.log(chalk.green('  mother-brain init    ') + 'Add Mother Brain to your project');
    console.log(chalk.green('  mother-brain update  ') + 'Update to the latest version');
    console.log(chalk.green('  mother-brain status  ') + 'Check installed version\n');
    console.log(chalk.dim('Run mother-brain --help for more options'));
  });

program.parse();
