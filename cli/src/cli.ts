#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { init } from './commands/init.js';
import { update } from './commands/update.js';
import { status } from './commands/status.js';
import { analyzeCommand } from './commands/analyze.js';
import { upgradeCommand } from './commands/upgrade.js';
import { uninstall } from './commands/uninstall.js';
import { exec } from 'child_process';

const program = new Command();

const VERSION = '0.0.33';

program
  .name('mother-brain')
  .description('AI-powered project management framework for GitHub Copilot CLI')
  .version(VERSION);

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

// Add analyze command
analyzeCommand(program);

// Add upgrade command
upgradeCommand(program);

// Docs command
program
  .command('docs')
  .description('Open Mother Brain documentation in browser')
  .action(() => {
    const url = 'https://github.com/super-state/mother-brain#readme';
    console.log(chalk.cyan('📖 Opening documentation...'));
    
    // Cross-platform browser open
    const cmd = process.platform === 'win32' ? 'start' :
                process.platform === 'darwin' ? 'open' : 'xdg-open';
    exec(`${cmd} ${url}`, (err) => {
      if (err) {
        console.log(chalk.yellow(`\nCouldn't open browser. Visit: ${url}`));
      }
    });
  });

// Quick start command
program
  .command('quickstart')
  .description('Show quick start guide')
  .action(() => {
    console.log(chalk.cyan(`
┳┳┓┏┓┏┳┓┓┏┏┓┳┓  ┳┓┳┓┏┓┳┳┓
┃┃┃┃┃ ┃ ┣┫┣ ┣┫  ┣┫┣┫┣┫┃┃┃
┛ ┗┗┛ ┻ ┛┗┗┛┛┗  ┻┛┛┗┛┗┻┛┗
`));
    console.log(chalk.white.bold('🚀 Quick Start Guide\n'));
    
    console.log(chalk.yellow('Step 1:') + ' Initialize Mother Brain in your project');
    console.log(chalk.dim('  npx -y mother-brain init\n'));
    
    console.log(chalk.yellow('Step 2:') + ' Start using it with GitHub Copilot CLI');
    console.log(chalk.dim('  ghcs "/mother-brain"\n'));
    
    console.log(chalk.yellow('Step 3:') + ' Follow the wizard to define your vision');
    console.log(chalk.dim('  Mother Brain will guide you through:\n'));
    console.log(chalk.dim('  - Vision Discovery (what are you building?)'));
    console.log(chalk.dim('  - Roadmap Generation (how to get there)'));
    console.log(chalk.dim('  - Skill Creation (automate repetitive tasks)'));
    console.log(chalk.dim('  - Task Execution (build it step by step)\n'));
    
    console.log(chalk.green('That\'s it!') + ' Mother Brain will help you ship faster.\n');
    console.log(chalk.dim('For more info: mother-brain docs'));
  });

// Uninstall command
program
  .command('uninstall')
  .description('Remove Mother Brain core skills from project')
  .option('-f, --force', 'Skip confirmation prompt')
  .option('-a, --all', 'Also remove .mother-brain/ docs folder')
  .action(uninstall);

// Default action when no command is provided
program
  .action(() => {
    console.log(chalk.cyan(`
┳┳┓┏┓┏┳┓┓┏┏┓┳┓  ┳┓┳┓┏┓┳┳┓
┃┃┃┃┃ ┃ ┣┫┣ ┣┫  ┣┫┣┫┣┫┃┃┃
┛ ┗┗┛ ┻ ┛┗┗┛┛┗  ┻┛┛┗┛┗┻┛┗
`));
    console.log(chalk.white('AI-powered project management for GitHub Copilot CLI'));
    console.log(chalk.dim(`v${VERSION}\n`));
    
    console.log(chalk.white.bold('Getting Started:'));
    console.log(chalk.green('  npx -y mother-brain init       ') + 'Add to your project');
    console.log(chalk.green('  npx -y mother-brain quickstart ') + 'Show quick start guide\n');
    
    console.log(chalk.white.bold('Commands:'));
    console.log(chalk.green('  init       ') + 'Add Mother Brain skills to project');
    console.log(chalk.green('  update     ') + 'Update to the latest version');
    console.log(chalk.green('  status     ') + 'Check installed version');
    console.log(chalk.green('  analyze    ') + 'Analyze skills and suggest improvements');
    console.log(chalk.green('  upgrade    ') + 'Apply improvements to skills');
    console.log(chalk.green('  uninstall  ') + 'Remove Mother Brain from project');
    console.log(chalk.green('  docs       ') + 'Open documentation in browser');
    console.log(chalk.green('  quickstart ') + 'Show quick start guide\n');
    
    console.log(chalk.dim('Run mother-brain <command> --help for command details'));
  });

program.parse();









