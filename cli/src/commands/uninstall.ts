import { existsSync, rmSync, readdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import readline from 'readline';

const CORE_SKILLS = ['mother-brain', 'child-brain', 'skill-creator'];

async function confirm(question: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

interface UninstallOptions {
  force?: boolean;
  all?: boolean;
  keepDocs?: boolean;
}

export async function uninstall(options: UninstallOptions): Promise<void> {
  const skillsDir = join(process.cwd(), '.github', 'skills');
  const motherBrainDir = join(process.cwd(), '.mother-brain');

  // Check if Mother Brain is installed
  if (!existsSync(skillsDir) && !existsSync(motherBrainDir)) {
    console.log(chalk.yellow('⚠️ Mother Brain is not installed in this project.'));
    return;
  }

  console.log(chalk.cyan('\n🧹 Mother Brain Uninstall\n'));

  // Identify what will be removed
  const coreSkillsToRemove: string[] = [];
  const projectSkillsFound: string[] = [];
  
  if (existsSync(skillsDir)) {
    const skills = readdirSync(skillsDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name);
    
    for (const skill of skills) {
      if (CORE_SKILLS.includes(skill)) {
        coreSkillsToRemove.push(skill);
      } else {
        projectSkillsFound.push(skill);
      }
    }
  }

  // Show what will happen
  console.log(chalk.white.bold('What will be removed:'));
  
  if (coreSkillsToRemove.length > 0) {
    console.log(chalk.red('\n  Core Skills:'));
    coreSkillsToRemove.forEach(s => console.log(chalk.red(`    ❌ .github/skills/${s}/`)));
  }
  
  if (existsSync(motherBrainDir)) {
    console.log(chalk.red('\n  Configuration:'));
    if (!options.keepDocs) {
      console.log(chalk.red('    ❌ .mother-brain/version.json'));
    }
  }

  // Show what will be kept
  console.log(chalk.white.bold('\nWhat will be kept:'));
  
  if (projectSkillsFound.length > 0) {
    console.log(chalk.green('\n  Project Skills:'));
    projectSkillsFound.forEach(s => console.log(chalk.green(`    ✅ .github/skills/${s}/`)));
  }
  
  if (existsSync(motherBrainDir)) {
    console.log(chalk.green('\n  Project Docs:'));
    console.log(chalk.green('    ✅ .mother-brain/docs/vision.md'));
    console.log(chalk.green('    ✅ .mother-brain/docs/roadmap.md'));
    console.log(chalk.green('    ✅ .mother-brain/docs/tasks/'));
    console.log(chalk.green('    ✅ .mother-brain/session-state.json'));
  }

  if (options.all) {
    console.log(chalk.yellow('\n  ⚠️  --all flag: Will also remove .mother-brain/ docs'));
  }

  console.log('');

  // Confirm unless --force
  if (!options.force) {
    const proceed = await confirm(chalk.yellow('Proceed with uninstall? (y/N): '));
    if (!proceed) {
      console.log(chalk.dim('\nUninstall cancelled.'));
      return;
    }
  }

  console.log('');

  // Remove core skills
  for (const skill of coreSkillsToRemove) {
    const skillPath = join(skillsDir, skill);
    try {
      rmSync(skillPath, { recursive: true, force: true });
      console.log(chalk.green(`✓ Removed .github/skills/${skill}/`));
    } catch (err) {
      console.log(chalk.red(`✗ Failed to remove ${skill}: ${err}`));
    }
  }

  // Remove version.json
  const versionFile = join(motherBrainDir, 'version.json');
  if (existsSync(versionFile)) {
    try {
      rmSync(versionFile);
      console.log(chalk.green('✓ Removed .mother-brain/version.json'));
    } catch (err) {
      console.log(chalk.red(`✗ Failed to remove version.json: ${err}`));
    }
  }

  // If --all, remove entire .mother-brain
  if (options.all && existsSync(motherBrainDir)) {
    try {
      rmSync(motherBrainDir, { recursive: true, force: true });
      console.log(chalk.green('✓ Removed .mother-brain/'));
    } catch (err) {
      console.log(chalk.red(`✗ Failed to remove .mother-brain/: ${err}`));
    }
  }

  // Clean up empty .github/skills if no skills left
  if (existsSync(skillsDir)) {
    const remaining = readdirSync(skillsDir);
    if (remaining.length === 0) {
      try {
        rmSync(skillsDir, { recursive: true });
        console.log(chalk.green('✓ Removed empty .github/skills/'));
      } catch (err) {
        // Ignore
      }
    }
  }

  console.log(chalk.cyan('\n✅ Mother Brain uninstalled.\n'));
  
  if (!options.all && existsSync(motherBrainDir)) {
    console.log(chalk.dim('Your project docs (.mother-brain/) were preserved.'));
    console.log(chalk.dim('Use --all to remove everything including docs.'));
  }
  
  console.log(chalk.dim('\nTo reinstall: npx mother-brain init'));
}
