# Task 004: Build Game List Component

**Phase**: 1 - Core PWA Foundation  
**Status**: ✅ COMPLETE  
**Priority**: HIGH  
**Estimated Time**: 1.5 hours  
**Depends On**: Task 003

---

## Objective

Create the main game list component with add, view, and delete functionality using the localStorage data layer.

## Steps

1. **Create AddGameForm component**
   ```typescript
   // src/components/AddGameForm.tsx
   - Form with: title, platform (dropdown), status (dropdown)
   - Validation: title required, min 2 chars
   - Submit → calls useBacklog().addGame()
   - Clear form after success
   - Show success toast/message
   ```

2. **Create GameCard component**
   ```typescript
   // src/components/GameCard.tsx
   - Display game title, platform, status
   - Status badge with color coding
   - Edit button (opens modal)
   - Delete button with confirmation
   - Responsive card layout (Tailwind)
   ```

3. **Create GameList component**
   ```typescript
   // src/components/GameList.tsx
   - Map over games from useBacklog()
   - Render GameCard for each
   - Empty state: "No games yet! Add your first game."
   - Group by status (Want, Playing, Completed)
   ```

4. **Add filtering UI**
   ```typescript
   - Filter by status dropdown
   - Filter by platform dropdown
   - "Clear filters" button
   - Show game count
   ```

5. **Implement delete confirmation**
   ```typescript
   - Confirm dialog before deleting
   - Show game title in confirmation
   - Keyboard shortcut: Escape to cancel
   ```

## Acceptance Criteria

- ✅ Can add new games via form
- ✅ Games display in list
- ✅ Can delete games
- ✅ Delete requires confirmation
- ✅ Empty state shows helpful message
- ✅ Status badges color-coded
- ✅ Mobile-responsive layout

## Deliverables

- `src/components/AddGameForm.tsx`
- `src/components/GameCard.tsx`
- `src/components/GameList.tsx`
- Updated `src/App.tsx` to use components

## Next Task

→ Task 005: Implement Status Workflow
