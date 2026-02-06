import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function status(): Promise<void> {
  const cwd = process.cwd();
  const motherBrainDir = path.join(cwd, '.mother-brain');
  const versionFile = path.join(motherBrainDir, 'version.json');
  const skillsDir = path.join(cwd, '.github', 'skills');

  console.log(chalk.cyan('\n🧠 Mother Brain Status\n'));

  // Check if initialized
  if (!await fs.pathExists(versionFile)) {
    console.log(chalk.yellow('Not initialized in this project.'));
    console.log(chalk.dim('Run: mother-brain init\n'));
    return;
  }

  const currentVersion = await fs.readJSON(versionFile);
  
  // Get package version - after bundling, __dirname is cli/dist
  const packageRoot = path.resolve(__dirname, '..');
  const pkg = await fs.readJSON(path.join(packageRoot, 'package.json'));
  
  console.log(chalk.white('Installed version: ') + chalk.green(`v${currentVersion.installed}`));
  console.log(chalk.white('Package version:   ') + chalk.dim(`v${pkg.version}`));
  
  // Check for updates from npm
  try {
    const { stdout } = await execAsync('npm view @super-state/mother-brain version 2>/dev/null');
    const latestVersion = stdout.trim();
    if (latestVersion && latestVersion !== currentVersion.installed) {
      console.log(chalk.yellow(`\n⬆️  Update available: v${latestVersion}`));
      console.log(chalk.dim('Run: mother-brain update\n'));
    } else {
      console.log(chalk.green('\n✓ Up to date\n'));
    }
  } catch {
    console.log(chalk.dim('\n(Could not check for updates)\n'));
  }

  // List installed skills
  console.log(chalk.white('Installed skills:'));
  if (await fs.pathExists(skillsDir)) {
    const skills = await fs.readdir(skillsDir);
    const coreSkills = ['mother-brain', 'child-brain', 'skill-creator'];
    
    for (const skill of skills) {
      const skillPath = path.join(skillsDir, skill);
      const stat = await fs.stat(skillPath);
      if (stat.isDirectory()) {
        const isCore = coreSkills.includes(skill);
        const label = isCore ? chalk.dim(' (core)') : chalk.cyan(' (project)');
        console.log(chalk.green(`  ✓ ${skill}`) + label);
      }
    }
  } else {
    console.log(chalk.dim('  No skills found'));
  }

  // Show project state if exists
  const sessionFile = path.join(motherBrainDir, 'session-state.json');
  if (await fs.pathExists(sessionFile)) {
    const session = await fs.readJSON(sessionFile);
    if (session.project) {
      console.log(chalk.white('\nProject: ') + chalk.cyan(session.project));
      if (session.currentPhase) {
        console.log(chalk.dim(`  Phase ${session.currentPhase}`));
      }
    }
  }

  console.log('');
}
