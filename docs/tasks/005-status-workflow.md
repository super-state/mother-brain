# Task 005: Implement Status Workflow

**Phase**: 1 - Core PWA Foundation  
**Status**: ✅ COMPLETE  
**Priority**: HIGH  
**Estimated Time**: 1 hour  
**Depends On**: Task 004

---

## Objective

Implement the game status workflow (Want to Play → Playing → Completed) with transitions and timestamp tracking.

## Steps

1. **Create StatusPill component**
   ```typescript
   // src/components/StatusPill.tsx
   - Colored badge for each status:
     * Want: Gray/Blue
     * Playing: Yellow/Orange
     * Completed: Green
     * Abandoned: Red
   - Click to open status menu
   - Keyboard accessible (Space/Enter)
   ```

2. **Create StatusMenu component**
   ```typescript
   // src/components/StatusMenu.tsx
   - Dropdown with 4 status options
   - Current status highlighted
   - Click option → updates game status
   - Auto-updates timestamps:
     * Want → Playing: Set dateStarted
     * Playing → Completed: Set dateCompleted
   ```

3. **Add status transition logic**
   ```typescript
   // src/utils/statusTransitions.ts
   - Validate allowed transitions
   - Update relevant date fields
   - Calculate playtime when completing
   ```

4. **Update GameCard to use StatusPill**
   ```typescript
   - Replace static status with StatusPill
   - Pass game and updateGame callback
   - Show transition animation
   ```

5. **Add keyboard shortcuts**
   ```typescript
   - W: Mark as Want to Play
   - P: Mark as Playing
   - C: Mark as Completed
   - A: Mark as Abandoned
   ```

## Acceptance Criteria

- ✅ Status changes work via click
- ✅ Status badges color-coded correctly
- ✅ dateStarted set when moving to Playing
- ✅ dateCompleted set when moving to Completed
- ✅ Keyboard shortcuts work
- ✅ Status menu accessible

## Deliverables

- `src/components/StatusPill.tsx`
- `src/components/StatusMenu.tsx`
- `src/utils/statusTransitions.ts`
- Updated `GameCard` with status workflow

## Next Task

→ Task 006: Add Platform Tags
