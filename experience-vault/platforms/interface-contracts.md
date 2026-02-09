# Interface Contract Verification

## Problem
When creating utility functions that return data to be consumed elsewhere, mismatched interfaces cause "undefined" errors at runtime because the producer and consumer expect different data shapes.

## Gotcha
It's tempting to implement the producer function first and then wire it up. But if the consumer expects `{ items: [] }` and the producer returns `[]` directly, you get silent failures or runtime crashes.

## Solution
Before implementing a producer function:
1. Check the call site (consumer) FIRST
2. Verify expected interface/shape at the consumer
3. Trace data flow: producer → consumer
4. Ensure interface compatibility BEFORE marking implementation complete
5. Write the return type to match what the consumer expects

## When to Consult
- When creating utility functions, API endpoints, or data transformation layers
- When connecting two separate modules or components

## Source
- Discovered during cross-module integration tasks
