import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface InitOptions {
  force?: boolean;
}

export async function init(options: InitOptions = {}): Promise<void> {
  const cwd = process.cwd();
  const skillsDir = path.join(cwd, '.github', 'skills');
  const motherBrainDir = path.join(cwd, '.mother-brain');
  
  // Display ASCII art banner
  console.log('');
  console.log(chalk.cyan('┳┳┓┏┓┏┳┓┓┏┏┓┳┓  ┳┓┳┓┏┓┳┳┓'));
  console.log(chalk.cyan('┃┃┃┃┃ ┃ ┣┫┣ ┣┫  ┣┫┣┫┣┫┃┃┃'));
  console.log(chalk.cyan('┛ ┗┗┛ ┻ ┛┗┗┛┛┗  ┻┛┛┗┛┗┻┛┗'));
  console.log('');
  console.log(chalk.cyan('🧠 Initializing Mother Brain...\n'));

  // Check if already initialized
  const versionFile = path.join(motherBrainDir, 'version.json');
  if (await fs.pathExists(versionFile) && !options.force) {
    const version = await fs.readJSON(versionFile);
    console.log(chalk.yellow(`Mother Brain is already installed (v${version.installed})`));
    console.log(chalk.dim('Use --force to reinstall, or run: mother-brain update\n'));
    return;
  }

  // Find the skills bundled with this package
  // After bundling, __dirname is cli/dist, skills is at cli/skills
  const packageRoot = path.resolve(__dirname, '..');
  const sourceSkillsDir = path.join(packageRoot, 'skills');
  
  // Core skills to copy
  const coreSkills = ['mother-brain', 'child-brain', 'skill-creator'];
  
  // Create directories
  await fs.ensureDir(skillsDir);
  await fs.ensureDir(path.join(motherBrainDir, 'docs'));
  
  // Copy each skill
  let copiedCount = 0;
  for (const skill of coreSkills) {
    const sourcePath = path.join(sourceSkillsDir, skill);
    const destPath = path.join(skillsDir, skill);
    
    if (await fs.pathExists(sourcePath)) {
      const exists = await fs.pathExists(destPath);
      if (exists && !options.force) {
        console.log(chalk.yellow(`  ⚠ ${skill} already exists (skipping)`));
        continue;
      }
      
      await fs.copy(sourcePath, destPath, { overwrite: true });
      console.log(chalk.green(`  ✓ ${skill}`));
      copiedCount++;
    } else {
      console.log(chalk.red(`  ✗ ${skill} not found in package`));
    }
  }

  // Create version tracking file
  const pkg = await fs.readJSON(path.join(packageRoot, 'package.json'));
  await fs.writeJSON(versionFile, {
    installed: pkg.version,
    installedAt: new Date().toISOString()
  }, { spaces: 2 });

  // Create initial session state if it doesn't exist
  const sessionFile = path.join(motherBrainDir, 'session-state.json');
  if (!await fs.pathExists(sessionFile)) {
    await fs.writeJSON(sessionFile, {
      project: null,
      currentPhase: null,
      currentTask: null,
      tasksCompleted: [],
      lastSession: new Date().toISOString(),
      installedVersion: pkg.version,
      skills: []
    }, { spaces: 2 });
  }

  console.log(chalk.cyan('\n✅ Mother Brain initialized!\n'));
  console.log('Next steps:');
  console.log(chalk.dim('  1. Commit the new files to your repo'));
  console.log(chalk.dim('  2. Open GitHub Copilot CLI'));
  console.log(chalk.dim('  3. Type: /mother-brain\n'));
  
  if (copiedCount > 0) {
    console.log(chalk.green(`Added ${copiedCount} skill(s) to .github/skills/`));
  }
  console.log(chalk.green('Created .mother-brain/ for project state\n'));
}
