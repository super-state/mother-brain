# Verification Strategies by Project Type

## Node.js / TypeScript Projects
- **Build**: `npm run build` or `npx tsc --noEmit`
- **Test**: `npm test` (check package.json scripts.test)
- **Lint**: `npm run lint` if available (bonus check)
- **Timeout**: Build 2min, Test 5min
- **Common failures**: Missing types, import errors, test assertion failures

## Rust Projects
- **Build**: `cargo build` (also catches type errors)
- **Test**: `cargo test`
- **Lint**: `cargo clippy` if available
- **Timeout**: Build 5min (Rust compiles slow), Test 5min
- **Common failures**: Borrow checker, lifetime errors

## Python Projects
- **Build**: Check `pyproject.toml` for build steps, or just syntax check
- **Test**: `pytest` or `python -m unittest discover`
- **Lint**: `ruff check` or `flake8` if available
- **Timeout**: Build 1min, Test 5min
- **Common failures**: Import errors, type errors (if using mypy)

## Go Projects
- **Build**: `go build ./...`
- **Test**: `go test ./...`
- **Lint**: `golangci-lint run` if available
- **Timeout**: Build 2min, Test 5min
- **Common failures**: Unused imports/variables (Go is strict)

## Fallback (Unknown Project Type)
- **Build**: Look for Makefile, then try common build commands
- **Test**: Look for test directories, test files
- **Confidence**: MEDIUM at best (can't verify without known tooling)
