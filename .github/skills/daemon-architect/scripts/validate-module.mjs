#!/usr/bin/env node
// Validate daemon module structure
// Usage: node validate-module.js <module-path>

import { existsSync, readFileSync } from 'fs';
import { join, basename } from 'path';

const modulePath = process.argv[2];
if (!modulePath) {
  console.error('Usage: node validate-module.js <module-path>');
  process.exit(1);
}

const checks = [];

// Check file exists and is TypeScript
if (!existsSync(modulePath)) {
  checks.push({ pass: false, msg: `File not found: ${modulePath}` });
} else {
  const content = readFileSync(modulePath, 'utf-8');
  
  // Check for console.log (should use pino)
  if (content.includes('console.log') || content.includes('console.error')) {
    checks.push({ pass: false, msg: 'Uses console.log — should use pino logger' });
  } else {
    checks.push({ pass: true, msg: 'No console.log found (uses structured logging)' });
  }

  // Check for graceful shutdown
  if (content.includes('stop(') || content.includes('shutdown(') || content.includes('destroy(')) {
    checks.push({ pass: true, msg: 'Has graceful shutdown method' });
  } else {
    checks.push({ pass: false, msg: 'Missing graceful shutdown method (stop/shutdown/destroy)' });
  }

  // Check for error handling
  if (content.includes('try') && content.includes('catch')) {
    checks.push({ pass: true, msg: 'Has error handling' });
  } else {
    checks.push({ pass: false, msg: 'Missing try/catch error handling' });
  }

  // Check for TypeScript types
  if (content.includes(': ') || content.includes('interface ') || content.includes('type ')) {
    checks.push({ pass: true, msg: 'Uses TypeScript types' });
  }
}

// Report
console.log(`\nModule Validation: ${basename(modulePath)}`);
console.log('='.repeat(40));
for (const check of checks) {
  console.log(`${check.pass ? '✅' : '❌'} ${check.msg}`);
}

const failures = checks.filter(c => !c.pass);
if (failures.length > 0) {
  console.log(`\n❌ ${failures.length} issue(s) found`);
  process.exit(1);
} else {
  console.log('\n✅ All checks passed');
}
