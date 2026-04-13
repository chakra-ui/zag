# @zag-js/dnd

Framework-agnostic drag and drop state machine with full keyboard and screen reader accessibility.

## Features

- Pointer-based drag (no HTML5 DnD limitations)
- Full keyboard DnD session (Enter to grab, Tab to cycle targets, Arrow to change placement, Enter to drop, Escape to cancel)
- Screen reader support (live region announcements, ariaHideOutside during keyboard drag)
- Pluggable collision detection (closestEdge, closestCenter, pointerWithin)
- Drop placements: before, after, on
- Multi-item drag (via selectedValues prop)
- Drag preview overlay
- Auto-scroll near container edges
- Grid layout support (columnCount prop)
- Activation constraints (distance/delay thresholds)
- Composable with tree-view, gridlist, listbox, or any component

## Known Limitations

### Virtualized lists

The DnD machine discovers drop targets from the DOM via `[data-dnd-drop-target]` attribute selectors. This means:

- **Only items rendered in the DOM participate in collision detection.** Items virtualized out of view (not mounted) cannot be drop targets until they scroll into view.
- **Auto-scroll brings items into view.** As the user drags near the edge of a scrollable container, auto-scroll continuously reveals new items which become valid drop targets.
- **Keyboard navigation is limited to visible items.** The Tab sequence is built from DOM-mounted targets at grab time. Off-screen virtualized items are not reachable via Tab until scrolled into view.

This is a deliberate tradeoff: DOM-based collision detection works with any virtualizer (tanstack-virtual, react-window, etc.) without special integration. The alternative (synthetic rects from a virtual layout) would require tight coupling to specific virtualizers.

**Recommendation:** For lists with 100+ items, use virtualization. The combination of auto-scroll + virtualization handles large datasets well — only ~20-30 items are in the DOM at any time, keeping collision detection fast.

### Large non-virtualized lists

Without virtualization, `getBoundingClientRect()` is called on every drop target per pointer move (~60 times/second). For lists under 100 items this is fast. For larger non-virtualized lists, consider:

- Enabling virtualization
- Using a custom `collisionStrategy` that limits the search space
- Reducing the number of drop targets (e.g. group items into containers)

## Installation

```bash
pnpm add @zag-js/dnd
```
