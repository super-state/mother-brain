import path from 'path';
import os from 'os';
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
  const agentsSkillsDir = path.join(cwd, '.agents', 'skills');
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
    installedAt: new Date().toISOString(),
    // Startup can use this to avoid hitting the network every run.
    lastUpdateCheckAt: new Date().toISOString(),
    lastKnownLatest: pkg.version
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

  // Create/merge AGENTS.md at project root for always-active rules
  // Uses markers to preserve user content while keeping our section updatable
  const agentsFile = path.join(cwd, 'AGENTS.md');
  const sourceAgentsFile = path.join(packageRoot, 'AGENTS.md');
  if (await fs.pathExists(sourceAgentsFile)) {
    const mbContent = await fs.readFile(sourceAgentsFile, 'utf-8');
    const markerStart = '<!-- mother-brain:start -->';
    const markerEnd = '<!-- mother-brain:end -->';
    const wrappedContent = `${markerStart}\n${mbContent}\n${markerEnd}`;

    if (await fs.pathExists(agentsFile)) {
      const existing = await fs.readFile(agentsFile, 'utf-8');
      const startIdx = existing.indexOf(markerStart);
      const endIdx = existing.indexOf(markerEnd);
      if (startIdx !== -1 && endIdx !== -1) {
        // Replace existing Mother Brain section
        const merged = existing.substring(0, startIdx) + wrappedContent + existing.substring(endIdx + markerEnd.length);
        await fs.writeFile(agentsFile, merged);
        console.log(chalk.green('Updated Mother Brain section in AGENTS.md (user content preserved)'));
      } else {
        // No markers — append our section to the end
        await fs.writeFile(agentsFile, existing.trimEnd() + '\n\n' + wrappedContent + '\n');
        console.log(chalk.green('Appended Mother Brain rules to existing AGENTS.md'));
      }
    } else {
      // No existing file — create with markers
      await fs.writeFile(agentsFile, wrappedContent + '\n');
      console.log(chalk.green('Created AGENTS.md (always-active rules for Codex/Copilot)'));
    }
  }

  console.log('');
  console.log('Next steps:');
  console.log(chalk.dim('  1. Commit the new files to your repo'));
  console.log(chalk.dim('  2. Open your AI CLI:'));
  console.log(chalk.dim('     GitHub Copilot CLI: ghcs "/mother-brain"'));
  console.log(chalk.dim('     Codex CLI:          $mother-brain or /prompts:mother-brain'));
  console.log(chalk.dim('  3. Follow the wizard to define your vision\n'));
  
  if (copiedCount > 0) {
    console.log(chalk.green(`Added ${copiedCount} skill(s) to .github/skills/`));
  }
  console.log(chalk.green('Created .mother-brain/ for project state\n'));

  // Create .agents/skills/ links for Codex CLI compatibility
  // Codex CLI discovers skills by scanning .agents/skills/ for SKILL.md files
  // Try symlink first (survives git clone), fall back to junction (Windows, no elevation needed)
  await fs.ensureDir(agentsSkillsDir);
  let linkedCount = 0;
  for (const skill of coreSkills) {
    const source = path.join(skillsDir, skill);
    const link = path.join(agentsSkillsDir, skill);
    const relTarget = path.join('..', '..', '.github', 'skills', skill);
    if (await fs.pathExists(source)) {
      const exists = await fs.pathExists(link);
      if (exists && !options.force) {
        continue;
      }
      if (exists) {
        await fs.remove(link);
      }
      try {
        await fs.symlink(relTarget, link, 'dir');
        linkedCount++;
      } catch {
        try {
          // Junction fallback: works on Windows without Developer Mode
          // Junctions require absolute paths and don't survive git clone,
          // but mother-brain init/update recreates them
          const absTarget = path.resolve(path.dirname(link), relTarget);
          await fs.symlink(absTarget, link, 'junction');
          linkedCount++;
        } catch {
          // Last resort: copy (creates duplication but always works)
          await fs.copy(source, link, { overwrite: true });
          linkedCount++;
        }
      }
    }
  }
  if (linkedCount > 0) {
    console.log(chalk.green(`Linked ${linkedCount} skill(s) to .agents/skills/ (Codex CLI compatible)`));
  }

  // Create Codex CLI custom prompt for /prompts:mother-brain slash command
  const codexPromptsDir = path.join(os.homedir(), '.codex', 'prompts');
  const promptFile = path.join(codexPromptsDir, 'mother-brain.md');
  try {
    await fs.ensureDir(codexPromptsDir);
    const skillPath = path.join(cwd, '.github', 'skills', 'mother-brain', 'SKILL.md');
    const relSkillPath = path.relative(os.homedir(), skillPath).replace(/\\/g, '/');
    await fs.writeFile(promptFile, [
      '---',
      'description: Launch Mother Brain — AI project management framework',
      '---',
      '',
      `Read and follow the complete instructions in ~/${relSkillPath}`,
      '',
      'This is the Mother Brain skill. Follow all steps, rules, and processes defined in that file.',
      ''
    ].join('\n'));
    console.log(chalk.green('Registered /prompts:mother-brain slash command for Codex CLI'));
  } catch {
    // Non-critical: slash command is a convenience, $mother-brain still works
  }
}
