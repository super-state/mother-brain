import { Command } from 'commander';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import readline from 'readline';

interface Improvement {
  type: 'add' | 'update';
  section: string;
  description: string;
  template: string;
}

function generateImprovements(skillPath: string): Improvement[] {
  const skillMdPath = join(skillPath, 'SKILL.md');
  const improvements: Improvement[] = [];

  if (!existsSync(skillMdPath)) {
    return improvements;
  }

  const content = readFileSync(skillMdPath, 'utf-8');

  // Check for missing frontmatter
  if (!/^---\r?\n[\s\S]*?\r?\n---/m.test(content)) {
    improvements.push({
      type: 'add',
      section: 'Frontmatter',
      description: 'Add YAML frontmatter with skill metadata',
      template: `---
name: ${extractSkillName(content)}
description: [Add description]
allowed-tools: powershell view grep glob create edit ask_user
---

`
    });
  }

  // Check for missing Purpose section
  if (!/^##?\s*Purpose/im.test(content)) {
    improvements.push({
      type: 'add',
      section: 'Purpose',
      description: 'Add Purpose section explaining what the skill does',
      template: `\n## Purpose\n\n[Describe what this skill does and when to use it]\n\n`
    });
  }

  // Check for missing Steps section
  if (!/^##?\s*Steps/im.test(content)) {
    improvements.push({
      type: 'add',
      section: 'Steps',
      description: 'Add Steps section with structured workflow',
      template: `\n## Steps\n\n### 1. [First Step]\n- [Details]\n\n### 2. [Second Step]\n- [Details]\n\n`
    });
  }

  // Check for wizard patterns
  if (!/wizard|ask_user|choices/i.test(content)) {
    improvements.push({
      type: 'add',
      section: 'Wizard Pattern',
      description: 'Add wizard-style user prompts for better interaction',
      template: `\n### User Interaction Pattern\n\nUse \`ask_user\` tool with choices for all user decisions:\n- Provide 2-3 clear options\n- Allow freeform for custom inputs\n- Never ask yes/no in plain text\n\n`
    });
  }

  // Check for validation
  if (!/validation|verify|check/i.test(content)) {
    improvements.push({
      type: 'add',
      section: 'Validation',
      description: 'Add validation steps to verify output quality',
      template: `\n### Validation\n\nBefore marking complete:\n- [ ] Output matches requirements\n- [ ] User has reviewed and approved\n- [ ] No errors in execution\n\n`
    });
  }

  return improvements;
}

function extractSkillName(content: string): string {
  const match = content.match(/^#\s*(.+)$/m);
  if (match) {
    return match[1]
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);
  }
  return 'unnamed-skill';
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

export function upgradeCommand(program: Command): void {
  program
    .command('upgrade [skill]')
    .description('Apply improvements to a skill based on analysis')
    .option('-a, --all', 'Upgrade all skills')
    .option('-y, --yes', 'Accept all improvements without prompting')
    .action(async (skillName, options) => {
      const skillsDir = join(process.cwd(), '.github', 'skills');

      if (!existsSync(skillsDir)) {
        console.log(chalk.red('❌ No skills found at .github/skills/'));
        console.log('   Run "npx mother-brain init" first.');
        return;
      }

      if (!skillName && !options.all) {
        console.log(chalk.yellow('Usage: mother-brain upgrade <skill-name>'));
        console.log(chalk.yellow('   or: mother-brain upgrade --all'));
        return;
      }

      const skills = options.all 
        ? require('fs').readdirSync(skillsDir, { withFileTypes: true })
            .filter((d: any) => d.isDirectory())
            .map((d: any) => d.name)
        : [skillName];

      let totalApplied = 0;
      let totalSkipped = 0;

      for (const skill of skills) {
        const skillPath = join(skillsDir, skill);
        
        if (!existsSync(skillPath)) {
          console.log(chalk.red(`❌ Skill "${skill}" not found`));
          continue;
        }

        console.log(chalk.cyan(`\n🔧 Upgrading: ${skill}`));
        console.log('─'.repeat(40));

        const improvements = generateImprovements(skillPath);

        if (improvements.length === 0) {
          console.log(chalk.green('✅ No improvements needed'));
          continue;
        }

        const skillMdPath = join(skillPath, 'SKILL.md');
        let content = readFileSync(skillMdPath, 'utf-8');

        for (const improvement of improvements) {
          console.log(`\n${chalk.yellow('💡')} ${improvement.description}`);
          console.log(chalk.dim(`   Section: ${improvement.section}`));
          console.log(chalk.dim(`   Preview:`));
          const previewLines = improvement.template.split('\n').slice(0, 5);
          previewLines.forEach(line => console.log(chalk.dim(`   ${line}`)));
          if (improvement.template.split('\n').length > 5) {
            console.log(chalk.dim('   ...'));
          }

          let action = 'a';
          if (!options.yes) {
            console.log(`\n   ${chalk.green('[a]')}ccept  ${chalk.yellow('[s]')}kip  ${chalk.blue('[t]')}weak`);
            action = await promptUser('   Choice: ');
          }

          if (action === 'a' || action === 'accept' || action === '') {
            // Apply improvement
            if (improvement.section === 'Frontmatter') {
              content = improvement.template + content;
            } else {
              // Add at end of file
              content = content.trimEnd() + '\n' + improvement.template;
            }
            console.log(chalk.green('   ✅ Applied'));
            totalApplied++;
          } else if (action === 't' || action === 'tweak') {
            console.log(chalk.yellow('   📝 Tweaking is available in interactive mode'));
            console.log(chalk.yellow('      For now, edit the skill manually after upgrade'));
            totalSkipped++;
          } else {
            console.log(chalk.dim('   ⏭️ Skipped'));
            totalSkipped++;
          }
        }

        // Write updated content
        writeFileSync(skillMdPath, content);
        console.log(chalk.green(`\n✅ ${skill} saved`));
      }

      console.log(chalk.cyan('\n' + '═'.repeat(40)));
      console.log(chalk.white(`📊 Summary:`));
      console.log(`   Applied: ${totalApplied} improvements`);
      console.log(`   Skipped: ${totalSkipped}`);
      
      if (totalApplied > 0) {
        console.log(chalk.green('\n✅ Skills upgraded! Review changes before committing.'));
      }
    });
}
