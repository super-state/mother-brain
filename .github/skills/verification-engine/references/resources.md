# Verification Engine — Resources

## Testing Frameworks (Auto-Detection)
- **Node.js**: `npm test` (jest, vitest, mocha, ava)
- **Rust**: `cargo test`
- **Go**: `go test ./...`
- **Python**: `pytest`, `python -m unittest`
- **Java**: `mvn test`, `gradle test`

## Build Tools (Auto-Detection)
- **Node.js**: `npm run build` (tsc, webpack, esbuild, tsup, vite)
- **Rust**: `cargo build`
- **Go**: `go build ./...`
- **Python**: N/A (interpreted, but check `pyproject.toml` for build steps)
- **Java**: `mvn compile`, `gradle build`

## Independent Verification Research
- **Principle**: Implementer ≠ Verifier (dual control principle from security)
- **Why**: LLMs can hallucinate that their own output is correct. A separate context without implementation knowledge provides genuinely independent review.
- **Cost**: ~500 tokens for a diff review (minimal context needed)
- **Quality**: Best results when verifier prompt is focused and specific

## Confidence Scoring Patterns
- Software testing: Build + test is the minimum quality bar
- Code review: Independent review adds ~20% defect detection
- Formal verification: Out of scope for daemon (too slow/expensive)

## References
- Anthropic: "Building Effective Agents" — verification as a core loop component
- Google: "Testing on the Toilet" series — automated testing best practices
- Martin Fowler: "Continuous Integration" — build + test gates
