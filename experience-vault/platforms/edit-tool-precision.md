# Edit Tool Precision (Agent Tooling)

## Problem
When using the `edit` tool and it returns "No match found", the `view` tool output may not reflect exact file content due to whitespace, line endings, or encoding differences.

## Gotcha
The `view` tool displays a representation of file content, but the actual raw bytes may differ:
- Spaces vs tabs (look identical in output)
- Trailing whitespace (invisible)
- Line ending differences (CRLF vs LF)
- Unicode encoding variations

## Solution
When `edit` fails with "No match found":
1. Use PowerShell to extract exact bytes: `$content.Substring(index, length)`
2. Use hex inspection if needed to verify exact characters
3. Match indentation precisely (count exact spaces vs tabs)
4. Never assume `view` output matches raw file content exactly

## When to Consult
- When `edit` tool returns "No match found" unexpectedly
- When working with files that have mixed indentation

## Source
- Discovered during SKILL.md editing sessions on Windows
