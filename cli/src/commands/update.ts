import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function update(): Promise<void> {
  const cwd = process.cwd();
  const skillsDir = path.join(cwd, '.github', 'skills');
  const agentsSkillsDir = path.join(cwd, '.agents', 'skills');
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
  
  // Check npm for latest version
  let latestVersion: string;
  try {
    const { stdout } = await execAsync('npm view mother-brain version');
    latestVersion = stdout.trim();
  } catch {
    console.log(chalk.yellow('Could not check npm for latest version.'));
    console.log(chalk.dim('Using bundled package version instead.\n'));
    // Fall back to bundled version
    const packageRoot = path.resolve(__dirname, '..');
    const pkg = await fs.readJSON(path.join(packageRoot, 'package.json'));
    latestVersion = pkg.version;
  }
  
  console.log(chalk.dim(`Installed: v${currentVersion.installed}`));
  console.log(chalk.dim(`Latest:    v${latestVersion}\n`));
  
  if (currentVersion.installed === latestVersion) {
    console.log(chalk.green('✅ Already on the latest version!\n'));
    return;
  }

  // Download and extract latest package
  console.log(chalk.dim('Downloading latest version...'));
  
  try {
    // Create temp directory for extraction
    const tempDir = path.join(cwd, '.mother-brain', '.update-temp');
    await fs.ensureDir(tempDir);
    
    // Use npm pack to download the package
    await execAsync(`npm pack mother-brain@${latestVersion} --pack-destination "${tempDir}"`);
    
    // Find the tarball
    const files = await fs.readdir(tempDir);
    const tarball = files.find(f => f.endsWith('.tgz'));
    
    if (!tarball) {
      throw new Error('Could not find downloaded package');
    }
    
    // Extract tarball
    await execAsync(`tar -xzf "${path.join(tempDir, tarball)}" -C "${tempDir}"`);
    
    // Copy skills from extracted package
    const extractedSkillsDir = path.join(tempDir, 'package', 'skills');
    const coreSkills = ['mother-brain', 'child-brain', 'skill-creator'];
    
    for (const skill of coreSkills) {
      const sourcePath = path.join(extractedSkillsDir, skill);
      const destPath = path.join(skillsDir, skill);
      
      if (await fs.pathExists(sourcePath)) {
        await fs.copy(sourcePath, destPath, { overwrite: true });
        console.log(chalk.green(`  ✓ Updated ${skill}`));
      }
    }
    
    // Clean up temp directory
    await fs.remove(tempDir);
    
    // Update version file
    await fs.writeJSON(versionFile, {
      installed: latestVersion,
      installedAt: new Date().toISOString(),
      previousVersion: currentVersion.installed
    }, { spaces: 2 });

    console.log(chalk.cyan(`\n✅ Updated to v${latestVersion}!\n`));
    console.log(chalk.dim('Don\'t forget to commit the updated files.\n'));

    // Refresh .agents/skills/ symlinks for Codex CLI compatibility
    // Symlinks point to .github/skills/ so they auto-update when source changes
    // Only recreate if missing (symlinks don't need refresh since they're pointers)
    await fs.ensureDir(agentsSkillsDir);
    for (const skill of coreSkills) {
      const source = path.join(skillsDir, skill);
      const link = path.join(agentsSkillsDir, skill);
      const relTarget = path.join('..', '..', '.github', 'skills', skill);
      if (await fs.pathExists(source) && !await fs.pathExists(link)) {
        try {
          await fs.symlink(relTarget, link, 'dir');
        } catch {
          await fs.copy(source, link, { overwrite: true });
        }
      }
    }
    console.log(chalk.green('Verified .agents/skills/ (Codex CLI compatible)'));
    
  } catch (error) {
    console.log(chalk.red('Failed to download update.'));
    console.log(chalk.dim('Try running: npx mother-brain@latest init --force\n'));
  }
}
