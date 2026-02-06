import { Command } from 'commander';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';

interface SkillAnalysis {
  name: string;
  path: string;
  issues: string[];
  suggestions: string[];
  score: number; // 0-100
}

interface SkillSection {
  name: string;
  required: boolean;
  pattern: RegExp;
  description: string;
}

const EXPECTED_SECTIONS: SkillSection[] = [
  { name: 'Frontmatter', required: true, pattern: /^---\r?\n[\s\S]*?\r?\n---/m, description: 'YAML metadata block' },
  { name: 'name', required: true, pattern: /^name:\s*.+$/m, description: 'Skill name in frontmatter' },
  { name: 'description', required: true, pattern: /^description:\s*.+$/m, description: 'Skill description' },
  { name: 'allowed-tools', required: false, pattern: /^allowed-tools:\s*.+$/m, description: 'List of allowed tools' },
  { name: 'Purpose section', required: true, pattern: /^##?\s*Purpose/im, description: 'Explains what the skill does' },
  { name: 'Steps section', required: false, pattern: /^##?\s*Steps/im, description: 'Step-by-step instructions' },
  { name: 'Examples', required: false, pattern: /(^##?\s*Example|```)/im, description: 'Usage examples' },
];

function analyzeSkill(skillPath: string, skillName: string): SkillAnalysis {
  const skillMdPath = join(skillPath, 'SKILL.md');
  const analysis: SkillAnalysis = {
    name: skillName,
    path: skillPath,
    issues: [],
    suggestions: [],
    score: 100,
  };

  if (!existsSync(skillMdPath)) {
    analysis.issues.push('Missing SKILL.md file');
    analysis.score = 0;
    return analysis;
  }

  const content = readFileSync(skillMdPath, 'utf-8');

  // Check each expected section
  for (const section of EXPECTED_SECTIONS) {
    if (!section.pattern.test(content)) {
      if (section.required) {
        analysis.issues.push(`Missing required: ${section.name} - ${section.description}`);
        analysis.score -= 15;
      } else {
        analysis.suggestions.push(`Consider adding: ${section.name} - ${section.description}`);
        analysis.score -= 5;
      }
    }
  }

  // Check file size (too short or too long)
  const lines = content.split('\n').length;
  if (lines < 20) {
    analysis.suggestions.push('Skill is quite short - consider adding more detail');
    analysis.score -= 5;
  } else if (lines > 2000) {
    analysis.suggestions.push('Skill is very long - consider splitting into sub-skills');
    analysis.score -= 5;
  }

  // Check for common best practices
  if (!/wizard|ask_user|choices/i.test(content)) {
    analysis.suggestions.push('Consider adding wizard-style prompts for user input');
  }

  if (!/validation|verify|check/i.test(content)) {
    analysis.suggestions.push('Consider adding validation steps');
  }

  // Ensure score doesn't go below 0
  analysis.score = Math.max(0, analysis.score);

  return analysis;
}

function printAnalysis(analysis: SkillAnalysis): void {
  const scoreEmoji = analysis.score >= 80 ? '✅' : analysis.score >= 50 ? '⚠️' : '❌';
  
  console.log(`\n${scoreEmoji} ${analysis.name} (Score: ${analysis.score}/100)`);
  console.log(`   Path: ${analysis.path}`);
  
  if (analysis.issues.length > 0) {
    console.log('\n   Issues:');
    analysis.issues.forEach(issue => console.log(`   ❌ ${issue}`));
  }
  
  if (analysis.suggestions.length > 0) {
    console.log('\n   Suggestions:');
    analysis.suggestions.forEach(suggestion => console.log(`   💡 ${suggestion}`));
  }
  
  if (analysis.issues.length === 0 && analysis.suggestions.length === 0) {
    console.log('   This skill looks great!');
  }
}

export function analyzeCommand(program: Command): void {
  program
    .command('analyze')
    .description('Analyze existing skills and suggest improvements')
    .option('-s, --skill <name>', 'Analyze a specific skill')
    .action((options) => {
      const skillsDir = join(process.cwd(), '.github', 'skills');

      if (!existsSync(skillsDir)) {
        console.log('❌ No skills found at .github/skills/');
        console.log('   Run "npx mother-brain init" first to install skills.');
        return;
      }

      const skills = readdirSync(skillsDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      if (skills.length === 0) {
        console.log('❌ No skills found in .github/skills/');
        return;
      }

      // Filter to specific skill if requested
      const targetSkills = options.skill 
        ? skills.filter(s => s === options.skill)
        : skills;

      if (options.skill && targetSkills.length === 0) {
        console.log(`❌ Skill "${options.skill}" not found`);
        return;
      }

      console.log('\n🔍 Analyzing skills...\n');
      console.log('━'.repeat(50));

      const analyses: SkillAnalysis[] = [];

      for (const skillName of targetSkills) {
        const skillPath = join(skillsDir, skillName);
        const analysis = analyzeSkill(skillPath, skillName);
        analyses.push(analysis);
        printAnalysis(analysis);
      }

      console.log('\n' + '━'.repeat(50));

      // Summary
      const avgScore = Math.round(analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length);
      const totalIssues = analyses.reduce((sum, a) => sum + a.issues.length, 0);
      const totalSuggestions = analyses.reduce((sum, a) => sum + a.suggestions.length, 0);

      console.log(`\n📊 Summary:`);
      console.log(`   Skills analyzed: ${analyses.length}`);
      console.log(`   Average score: ${avgScore}/100`);
      console.log(`   Total issues: ${totalIssues}`);
      console.log(`   Total suggestions: ${totalSuggestions}`);

      if (totalIssues > 0 || totalSuggestions > 0) {
        console.log(`\n💡 Run "npx mother-brain upgrade <skill-name>" to apply improvements`);
      }
    });
}
