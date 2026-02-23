import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import type { Logger } from 'pino';
import type { RoadmapTask, RoadmapOutcome } from './roadmap-parser.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TaskContext {
  systemPrompt: string;
  taskPrompt: string;
  estimatedTokens: number;
}

// ---------------------------------------------------------------------------
// Context Builder
// ---------------------------------------------------------------------------

/**
 * Build minimal LLM context for a task.
 * Target: ~4,700 tokens total (system + task + files).
 *
 * Context structure:
 * 1. Task objective (~50 tokens)
 * 2. Skill instructions (~2,000 tokens)
 * 3. Relevant files (~2,500 tokens)
 * 4. Constraints (~150 tokens)
 */
export function buildTaskContext(
  task: RoadmapTask,
  outcome: RoadmapOutcome,
  repoPath: string,
  logger: Logger,
): TaskContext {
  // Find the relevant skill for this task
  const skillContent = findSkillForTask(task, outcome, repoPath, logger);

  // Find relevant files for context
  const relevantFiles = findRelevantFiles(task, repoPath, logger);

  const systemPrompt = [
    'You are an autonomous code generation agent.',
    'You write production-quality TypeScript code.',
    'Follow the skill instructions and coding patterns exactly.',
    'Return ONLY the file changes needed — no explanation.',
    '',
    '## Skill Instructions',
    skillContent,
  ].join('\n');

  const taskPrompt = [
    `## Task: ${task.id}`,
    `**Objective**: ${task.description}`,
    `**Outcome**: ${outcome.title}`,
    '',
    '## Relevant Files',
    ...relevantFiles.map((f) => `### ${f.path}\n\`\`\`\n${f.content}\n\`\`\``),
    '',
    '## Constraints',
    '- Follow existing code patterns in the repository',
    '- Do not modify files outside the scope of this task',
    '- Use TypeScript strict mode, ESM modules, async/await',
    '- Use pino for logging (never console.log)',
    '- Handle errors gracefully — daemon must never crash',
  ].join('\n');

  // Rough token estimate: ~4 chars per token
  const estimatedTokens = Math.ceil((systemPrompt.length + taskPrompt.length) / 4);

  logger.info(
    { taskId: task.id, files: relevantFiles.length, estimatedTokens },
    'Task context built',
  );

  return { systemPrompt, taskPrompt, estimatedTokens };
}

// ---------------------------------------------------------------------------
// Skill Finder
// ---------------------------------------------------------------------------

/** Find the most relevant skill SKILL.md for a task. */
function findSkillForTask(
  task: RoadmapTask,
  _outcome: RoadmapOutcome,
  repoPath: string,
  logger: Logger,
): string {
  // Check for skills in the repo's .github/skills/ directory
  const skillsDir = join(repoPath, '.github', 'skills');
  const skillMap: Record<string, string> = {
    'daemon-architect': 'daemon|lifecycle|config|core|module|scaffold|database|sqlite',
    'telegram-integrator': 'telegram|bot|command|notification|report|grammy',
    'verification-engine': 'verif|gate|build|test|confidence|commit|revert',
  };

  const taskLower = task.description.toLowerCase();

  for (const [skillName, keywords] of Object.entries(skillMap)) {
    const pattern = new RegExp(keywords);
    if (pattern.test(taskLower)) {
      const skillPath = join(skillsDir, skillName, 'SKILL.md');
      if (existsSync(skillPath)) {
        logger.debug({ skill: skillName }, 'Matched skill for task');
        return readFileSync(skillPath, 'utf-8');
      }
    }
  }

  // Fallback: use daemon-architect as the default
  const defaultSkill = join(skillsDir, 'daemon-architect', 'SKILL.md');
  if (existsSync(defaultSkill)) {
    return readFileSync(defaultSkill, 'utf-8');
  }

  return 'No skill found — use general best practices for TypeScript daemon development.';
}

// ---------------------------------------------------------------------------
// File Finder
// ---------------------------------------------------------------------------

interface FileContext {
  path: string;
  content: string;
}

const MAX_FILE_CHARS = 3000; // ~750 tokens per file, 3 files = ~2,250 tokens

/** Find relevant files for a task based on keywords in the description. */
function findRelevantFiles(
  task: RoadmapTask,
  repoPath: string,
  _logger: Logger,
): FileContext[] {
  const files: FileContext[] = [];

  // Always include package.json for dependency context
  const pkgPath = join(repoPath, 'daemon', 'package.json');
  if (existsSync(pkgPath)) {
    files.push(readContextFile(pkgPath, repoPath));
  }

  // Include existing source files related to the task
  const srcDir = join(repoPath, 'daemon', 'src');
  const relatedDirs = guessRelatedDirs(task.description);

  for (const dir of relatedDirs) {
    const dirPath = join(srcDir, dir);
    if (existsSync(dirPath)) {
      // Read the first .ts file in the directory for pattern context
      try {
        const entries = readdirSync(dirPath).filter((f: string) => f.endsWith('.ts'));
        for (const entry of entries.slice(0, 2)) {
          files.push(readContextFile(join(dirPath, entry), repoPath));
        }
      } catch {
        // Directory might not exist yet
      }
    }
  }

  return files.slice(0, 3); // Max 3 files for context
}

/** Guess which source directories are relevant based on task description. */
function guessRelatedDirs(description: string): string[] {
  const lower = description.toLowerCase();
  const dirs: string[] = [];

  if (lower.includes('config') || lower.includes('daemon') || lower.includes('lifecycle')) dirs.push('core');
  if (lower.includes('schedule') || lower.includes('cron') || lower.includes('task picker')) dirs.push('scheduler');
  if (lower.includes('llm') || lower.includes('api') || lower.includes('context') || lower.includes('claude')) dirs.push('llm');
  if (lower.includes('git') || lower.includes('workspace') || lower.includes('roadmap') || lower.includes('file')) dirs.push('workspace');
  if (lower.includes('verif') || lower.includes('build') || lower.includes('test') || lower.includes('gate')) dirs.push('verifier');
  if (lower.includes('telegram') || lower.includes('bot') || lower.includes('report') || lower.includes('notification')) dirs.push('reporter');
  if (lower.includes('budget') || lower.includes('cost') || lower.includes('token')) dirs.push('budget');
  if (lower.includes('database') || lower.includes('sqlite') || lower.includes('migration')) dirs.push('db');

  // Always include core for pattern reference
  if (!dirs.includes('core')) dirs.push('core');

  return dirs;
}

function readContextFile(filePath: string, repoPath: string): FileContext {
  let content = readFileSync(filePath, 'utf-8');
  if (content.length > MAX_FILE_CHARS) {
    content = content.slice(0, MAX_FILE_CHARS) + '\n// ... truncated for context';
  }
  return {
    path: filePath.replace(resolve(repoPath) + '\\', '').replace(resolve(repoPath) + '/', ''),
    content,
  };
}
