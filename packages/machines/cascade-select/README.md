# Cascade Select Machine

A machine for building cascade select (cascading dropdowns) components.

## Features

- Support for hierarchical data structures
- Keyboard navigation
- Multiple selection mode
- Parent item selection (optional)
- **Safe Triangle Navigation** - Prevents premature submenu closure when moving mouse from parent items to their
  children

## Safe Triangle Feature

The safe triangle is a user experience enhancement that solves a common problem in cascading menus: when you move your
mouse from a parent item toward its submenu, the mouse briefly leaves the parent item, which would normally cause the
submenu to close before you can reach it.

The safe triangle creates an invisible triangular area between the parent item and its submenu. As long as the mouse
stays within this triangle, the submenu remains open, allowing users to smoothly navigate to child items.

### How it works

1. When `highlightTrigger` is set to `"hover"` (default)
2. And a user moves their mouse away from a parent item that has children
3. A safe triangle is calculated from the mouse position to the submenu area
4. The submenu stays open as long as the mouse is within this triangle
5. If the mouse moves outside the triangle, the submenu closes
6. The triangle automatically expires after 300ms to prevent indefinite hovering

### Key improvements for cascade-select layout

- **Bidirectional navigation**: Works when moving from parent to child AND child to parent
- **Straight-line optimized**: Designed for the cascade-select's horizontal level layout
- **Simple corridor**: Creates a rectangular "corridor" between adjacent levels rather than complex triangular areas

### Debugging the safe triangle

To help debug safe triangle behavior, you can temporarily add this to your CSS to visualize the polygon:

```css
/* Add this temporarily to see the safe triangle area */
.safe-triangle-debug {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 9999;
}
```

The safe triangle is automatically enabled for hover-based highlighting and requires no additional configuration.

## Installation

```bash
npm install @zag-js/cascade-select
```
