# Task 007: Design Mobile-First Responsive UI

**Phase**: 1 - Core PWA Foundation  
**Status**: TODO  
**Priority**: HIGH  
**Estimated Time**: 2 hours  
**Depends On**: Tasks 004, 005, 006

---

## Objective

Polish the UI with mobile-first responsive design, consistent spacing, and professional appearance using Tailwind CSS.

## Steps

1. **Design mobile layout (320px+)**
   ```typescript
   - Single column list
   - Full-width cards
   - Sticky header with title
   - Bottom navigation (if needed)
   - Touch-friendly button sizes (min 44px)
   ```

2. **Design tablet layout (768px+)**
   ```typescript
   - 2-column grid
   - Sidebar with filters
   - Larger card previews
   ```

3. **Design desktop layout (1024px+)**
   ```typescript
   - 3-column grid or kanban layout
   - Left sidebar: Filters, stats
   - Main area: Game cards
   - Right sidebar: Quick actions
   ```

4. **Create consistent spacing system**
   ```typescript
   - Use Tailwind spacing scale
   - Padding: p-4 (cards), p-6 (containers)
   - Gaps: gap-4 (lists), gap-6 (sections)
   - Margins: mb-4, mt-8 for sections
   ```

5. **Implement dark mode**
   ```typescript
   - Dark background (#1a1a1a)
   - Light text (#ffffff)
   - Accent color (#6366f1 - Indigo)
   - Card backgrounds (#2a2a2a)
   - Use Tailwind dark: variants
   ```

6. **Add loading states**
   ```typescript
   - Skeleton screens for cards
   - Loading spinners for actions
   - Smooth transitions
   ```

7. **Add animations**
   ```typescript
   - Fade in new cards
   - Slide out deleted cards
   - Status change animation
   - Use Tailwind transitions
   ```

8. **Optimize touch interactions**
   ```typescript
   - Larger tap targets
   - Swipe to delete (optional)
   - Pull to refresh (optional)
   ```

## Acceptance Criteria

- ✅ Looks great on mobile (320px+)
- ✅ Responsive on tablet and desktop
- ✅ Dark mode implemented
- ✅ Consistent spacing throughout
- ✅ Touch-friendly button sizes
- ✅ Smooth animations
- ✅ Loading states for async actions
- ✅ No horizontal scroll on mobile

## Testing Checklist

- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on tablet (iPad)
- [ ] Test on desktop (1920px wide)
- [ ] Test on small phones (320px)
- [ ] Verify dark mode contrast (WCAG AA)
- [ ] Test touch interactions

## Deliverables

- Responsive layouts for all breakpoints
- Dark mode theme
- Loading states
- Animations
- Updated components with Tailwind classes

## Notes

- Mobile-first means design for small screens FIRST
- Use Tailwind breakpoints: sm, md, lg, xl
- Test on real devices, not just DevTools
- Consider accessibility (color contrast, touch targets)

## Next Task

→ Task 008: Test Offline Functionality
