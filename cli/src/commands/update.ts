import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function update(): Promise<void> {
  const cwd = process.cwd();
  const skillsDir = path.join(cwd, '.github', 'skills');
  const motherBrainDir = path.join(cwd, '.mother-brain');
  const versionFile = path.join(motherBrainDir, 'version.json');

  console.log(chalk.cyan('\n🧠 Updating Mother Brain...\n'));

  // Check if initialized
  if (!await fs.pathExists(versionFile)) {
    console.log(chalk.yellow('Mother Brain is not initialized in this project.'));
    console.log(chalk.dim('Run: mother-brain init\n'));
    return;
  }

  const currentVersion = await fs.readJSON(versionFile);
  
  // Find the skills bundled with this package
  // After bundling, __dirname is cli/dist, skills is at cli/skills
  const packageRoot = path.resolve(__dirname, '..');
  const pkg = await fs.readJSON(path.join(packageRoot, 'package.json'));
  const sourceSkillsDir = path.join(packageRoot, 'skills');
  
  console.log(chalk.dim(`Current: v${currentVersion.installed}`));
  console.log(chalk.dim(`Latest:  v${pkg.version}\n`));
  
  if (currentVersion.installed === pkg.version) {
    console.log(chalk.green('✅ Already on the latest version!\n'));
    return;
  }

  // Core skills to update
  const coreSkills = ['mother-brain', 'child-brain', 'skill-creator'];
  
  // Update each skill
  for (const skill of coreSkills) {
    const sourcePath = path.join(sourceSkillsDir, skill);
    const destPath = path.join(skillsDir, skill);
    
    if (await fs.pathExists(sourcePath)) {
      await fs.copy(sourcePath, destPath, { overwrite: true });
      console.log(chalk.green(`  ✓ Updated ${skill}`));
    }
  }

  // Update version file
  await fs.writeJSON(versionFile, {
    installed: pkg.version,
    installedAt: new Date().toISOString(),
    previousVersion: currentVersion.installed
  }, { spaces: 2 });

  console.log(chalk.cyan(`\n✅ Updated to v${pkg.version}!\n`));
  console.log(chalk.dim('Don\'t forget to commit the updated files.\n'));
}
