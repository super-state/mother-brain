# Task 006: Add Platform Tags

**Phase**: 1 - Core PWA Foundation  
**Status**: TODO  
**Priority**: MEDIUM  
**Estimated Time**: 45 minutes  
**Depends On**: Task 004

---

## Objective

Add platform tag system with filtering and visual icons for major gaming platforms.

## Steps

1. **Create PlatformBadge component**
   ```typescript
   // src/components/PlatformBadge.tsx
   - Display platform name with icon
   - Platform-specific colors:
     * PC: Blue
     * PlayStation: Blue/Dark Blue
     * Xbox: Green
     * Nintendo: Red
     * Mobile: Purple
     * Other: Gray
   - Small, compact badge design
   ```

2. **Add platform icons**
   ```typescript
   - Use heroicons or lucide-react
   - Map platform to icon:
     * PC: ComputerDesktopIcon
     * PlayStation/Xbox/Nintendo: DeviceTabletIcon
     * Mobile: DevicePhoneMobileIcon
   ```

3. **Create PlatformFilter component**
   ```typescript
   // src/components/PlatformFilter.tsx
   - Dropdown or button group
   - "All Platforms" option
   - Filter games by selected platform
   - Show game count per platform
   ```

4. **Update GameCard with platform badge**
   ```typescript
   - Display PlatformBadge prominently
   - Position near title or status
   ```

5. **Add platform statistics**
   ```typescript
   // src/components/PlatformStats.tsx
   - Show game count by platform
   - Visual breakdown (simple list)
   ```

## Acceptance Criteria

- ✅ Platform badges display with correct colors
- ✅ Platform filter works
- ✅ Can filter by specific platform
- ✅ "All Platforms" shows all games
- ✅ Platform statistics accurate
- ✅ Icons render correctly

## Deliverables

- `src/components/PlatformBadge.tsx`
- `src/components/PlatformFilter.tsx`
- `src/components/PlatformStats.tsx`
- Updated `GameCard` and `GameList`

## Next Task

→ Task 007: Design Mobile-First UI
