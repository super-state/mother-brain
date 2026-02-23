#!/usr/bin/env node
// Detect build and test commands for a project
// Usage: node detect-commands.mjs [project-path]

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const projectPath = process.argv[2] || '.';

function detect(projectPath) {
  const results = { build: null, test: null, type: 'unknown' };

  // Node.js
  const pkgPath = join(projectPath, 'package.json');
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    results.type = 'nodejs';
    if (pkg.scripts?.build) results.build = 'npm run build';
    if (pkg.scripts?.test && !pkg.scripts.test.includes('echo "Error')) {
      results.test = 'npm test';
    }
    return results;
  }

  // Rust
  if (existsSync(join(projectPath, 'Cargo.toml'))) {
    results.type = 'rust';
    results.build = 'cargo build';
    results.test = 'cargo test';
    return results;
  }

  // Go
  if (existsSync(join(projectPath, 'go.mod'))) {
    results.type = 'go';
    results.build = 'go build ./...';
    results.test = 'go test ./...';
    return results;
  }

  // Python
  if (existsSync(join(projectPath, 'pyproject.toml')) || existsSync(join(projectPath, 'setup.py'))) {
    results.type = 'python';
    if (existsSync(join(projectPath, 'pytest.ini')) || existsSync(join(projectPath, 'pyproject.toml'))) {
      results.test = 'pytest';
    }
    return results;
  }

  // Java (Maven)
  if (existsSync(join(projectPath, 'pom.xml'))) {
    results.type = 'java-maven';
    results.build = 'mvn compile';
    results.test = 'mvn test';
    return results;
  }

  return results;
}

const result = detect(projectPath);
console.log('\nProject Detection Results');
console.log('========================');
console.log(`Type: ${result.type}`);
console.log(`Build: ${result.build || '(none detected)'}`);
console.log(`Test: ${result.test || '(none detected)'}`);
