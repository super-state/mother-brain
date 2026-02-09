# Spatial UI Positioning

## Problem
When implementing UI elements with positioning requirements (e.g., "put this near the card"), the agent assumes spatial references without clarifying specifics, leading to misplaced elements.

## Gotcha
Terms like "near X", "at the corner", "next to Y" are ambiguous in UI contexts. "Near the player card" could mean: inside the card, above the card, overlaid on the card, or adjacent to the card. Without clarifying relative to WHICH element and WHERE, implementation wastes cycles.

## Solution
Before implementing any UI element with positioning:
1. Ask user to describe placement relative to SPECIFIC existing elements
2. Clarify: inside vs. above vs. overlay vs. adjacent
3. Clarify: which corner of which element
4. Use concrete reference points, not vague spatial language

Example question: "Should this be inside the player card, above it, or as an overlay on top?"

## When to Consult
- During Step 9 (Task Execution) for any UI/layout task
- When task description includes spatial language ("near", "at", "by", "corner")

## Source
- Discovered during game UI implementation (player card positioning friction)
