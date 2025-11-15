# Multi-Drag Support for Splitter Intersections

This document explains the multi-drag feature for the Zag.js Splitter component, which allows users to resize panels in multiple directions simultaneously when dragging at the intersection of horizontal and vertical splitters.

## Overview

When you have nested splitters (e.g., a horizontal splitter containing a vertical splitter), the resize handles can intersect. With multi-drag support enabled, users can drag at these intersection points to resize both splitters simultaneously, providing a more intuitive experience similar to popular applications like VS Code.

## How It Works

### Architecture

The multi-drag feature is implemented using a **Registry System** that:

1. **Tracks all resize handles** across multiple splitter instances
2. **Detects intersections** using browser-native `document.elementsFromPoint()` plus expanded hit areas
3. **Coordinates activation** of multiple handles when the pointer is at an intersection
4. **Manages cursor feedback** to indicate multi-directional resizing capability

### Key Components

1. **SplitterRegistry** (`utils/registry.ts`):
   - Singleton instance that manages all resize handles globally
   - Listens for pointer events at the document level
   - Calculates which handles are under the cursor (with configurable margins)
   - Activates/deactivates handles based on pointer position

2. **Updated Types** (`splitter.types.ts`):
   - `SplitterRegistry` interface for the registry contract
   - `HitAreaMargins` for configurable touch vs mouse margins
   - New props: `registry` and `hitAreaMargins`

3. **Connect Integration** (`splitter.connect.ts`):
   - `getResizeTriggerProps` now supports registry registration via `ref` callback
   - When registry is provided, handles delegate pointer event handling to the registry
   - Cursor management is disabled when registry is active (registry handles it globally)

## Usage

### Basic Setup

```typescript
import * as splitter from "@zag-js/splitter"
import { useMachine, normalizeProps } from "@zag-js/react"

function MyComponent() {
  // Create a shared registry with custom hit area margins
  const registry = splitter.registry({
    hitAreaMargins: { coarse: 15, fine: 8 }, // Optional
  })

  // Horizontal splitter
  const horizontalService = useMachine(splitter.machine, {
    id: "horizontal",
    orientation: "horizontal",
    panels: [{ id: "left" }, { id: "center" }, { id: "right" }],
    registry, // Enable multi-drag
  })

  const horizontalApi = splitter.connect(horizontalService, normalizeProps)

  // Vertical splitter (nested)
  const verticalService = useMachine(splitter.machine, {
    id: "vertical",
    orientation: "vertical",
    panels: [{ id: "top" }, { id: "bottom" }],
    registry, // Share the same registry
  })

  const verticalApi = splitter.connect(verticalService, normalizeProps)

  // Render nested splitters...
}
```

### Hit Area Margins

Configure hit area margins when creating the registry to make it easier to grab resize handles, especially on touch devices:

```typescript
const registry = splitter.registry({
  hitAreaMargins: {
    coarse: 15, // For touch/pen pointers (default: 15px)
    fine: 8,    // For mouse pointers (default: 5px)
  }
})
```

The registry automatically detects the pointer type and applies the appropriate margin, expanding the interactive area around each handle.

### Custom Registry

You can create custom registry instances for isolated groups of splitters or for shadow DOM support:

```typescript
import { registry } from "@zag-js/splitter"

// Basic custom registry
const customRegistry = registry()

// With shadow DOM support
const shadowRegistry = registry({
  getRootNode: () => shadowRoot,
  nonce: "your-csp-nonce", // For Content Security Policy compliance
  hitAreaMargins: { coarse: 20, fine: 10 },
})

// Use customRegistry instead of the default
```

### Shadow DOM Support

When using splitters inside a shadow DOM, create a registry scoped to that shadow root:

```typescript
import { registry } from "@zag-js/splitter"

class MyWebComponent extends HTMLElement {
  constructor() {
    super()
    const shadowRoot = this.attachShadow({ mode: "open" })

    // Create a registry scoped to this shadow root
    this.registry = registry({
      getRootNode: () => shadowRoot,
    })
  }
}
```

### Content Security Policy (CSP)

If you have a CSP that requires nonces for inline styles, provide the nonce when creating the registry:

```typescript
const myRegistry = registry({
  nonce: document.querySelector("meta[property=csp-nonce]")?.content,
})
```

The registry will apply this nonce to the injected cursor stylesheet.

## Features

### 1. Intersection Detection

The registry uses multiple strategies to detect handles under the cursor:

- **Browser-native**: Uses `document.elementsFromPoint()` for accurate hit testing
- **Expanded hit areas**: Adds configurable margins around handles for easier grabbing
- **Pointer type awareness**: Different margins for touch vs mouse

### 2. Cursor Feedback

When multiple handles intersect, the cursor changes to indicate multi-directional resizing:

- **Horizontal only**: `ew-resize` cursor
- **Vertical only**: `ns-resize` cursor
- **Both directions**: `move` cursor

### 3. Independent State Machines

Each splitter maintains its own state machine and operates independently. The registry only coordinates **when** handles are activated, not **how** they resize. This maintains the purity of the state machine architecture.

### 4. Framework Agnostic

The registry works across all supported frameworks (React, Vue, Solid, Svelte) because:

- It operates at the DOM level
- Uses standard browser APIs
- Doesn't depend on framework-specific features

## Examples

### React

See: `examples/next-ts/pages/splitter-nested.tsx`

### Svelte

See: `examples/svelte-ts/src/routes/splitter-nested/+page.svelte`

## Implementation Details

### Registration Flow

1. When a resize handle is rendered with `registry` prop:
   ```typescript
   ref(node: HTMLElement | null) {
     if (!registry || !node) return

     const unregister = registry.register({
       id: dom.getResizeTriggerId(scope, id),
       element: node,
       orientation: prop("orientation"),
       hitAreaMargins: getHitAreaMargins(),
       onActivate(point) {
         send({ type: "POINTER_DOWN", id, point })
       },
       onDeactivate() {
         send({ type: "POINTER_UP" })
       },
     })

     return unregister
   }
   ```

2. Registry attaches global listeners (once for all handles)
3. On pointer move, registry calculates intersecting handles
4. On pointer down at intersection, registry calls `onActivate` for all intersecting handles
5. Each state machine processes the activation independently

### Event Delegation

When registry is enabled:

- `onPointerDown`, `onPointerOver`, `onPointerLeave` are bypassed
- Registry handles all pointer events globally
- Individual cursors are disabled (registry sets global cursor)
- Keyboard events still work normally (not affected by registry)

### Performance

The registry is designed for performance:

- Single set of global listeners (not per handle)
- Debounced intersection calculations
- Efficient DOM queries using `elementsFromPoint()`
- Cleanup on unmount to prevent memory leaks

## Backward Compatibility

The multi-drag feature is **completely opt-in**:

- Without `registry` prop: Splitters work exactly as before
- With `registry` prop: Multi-drag is enabled
- No breaking changes to existing API

## Browser Support

Multi-drag uses standard Web APIs available in all modern browsers:

- `document.elementsFromPoint()` (IE11+)
- `PointerEvent` API (IE11+ with polyfill)
- `Element.getBoundingClientRect()` (all browsers)

## Future Enhancements

Potential improvements:

1. **Constrained multi-drag**: Respect min/max sizes across both dimensions
2. **Visual indicators**: Highlight intersection zones
3. **Accessibility**: Keyboard shortcuts for multi-resize
4. **Touch gestures**: Multi-finger pinch/spread for diagonal resizing

## Testing

To test multi-drag functionality:

1. Create nested splitters (horizontal + vertical)
2. Add `registry={splitter.splitterRegistry}` to both
3. Move cursor to where handles intersect
4. Verify cursor changes to "move"
5. Click and drag
6. Both panels should resize simultaneously

## Troubleshooting

### Multi-drag not working

- Ensure both splitters use the same `registry` instance
- Check that `registry` prop is passed to both machines
- Verify handles are actually intersecting visually
- Increase `hitAreaMargins` if handles are hard to grab

### Cursor not changing

- Check that individual cursor styles aren't overriding global cursor
- Verify registry is actually detecting intersection (add console logs)
- Ensure no other elements are blocking the handles (z-index issues)

### Only one splitter resizes

- Each machine must have unique `id`
- Verify both handles are being activated (check state machines)
- Ensure handles have proper `data-part` attributes

## API Reference

### Types

```typescript
interface SplitterRegistry {
  register(data: {
    id: string
    element: HTMLElement
    orientation: "horizontal" | "vertical"
    hitAreaMargins: { coarse: number; fine: number }
    onActivate: (point: { x: number; y: number }) => void
    onDeactivate: () => void
  }): () => void
}

interface SplitterRegistryOptions {
  /**
   * The root node for the registry. Use this to scope the registry to a shadow DOM.
   * @default () => document
   */
  getRootNode?: () => Document | ShadowRoot
  /**
   * The nonce for the injected cursor stylesheet (for CSP compliance).
   */
  nonce?: string
}

interface HitAreaMargins {
  coarse?: number  // Default: 15
  fine?: number    // Default: 5
}
```

### Exports

```typescript
import {
  registry,                   // Factory function to create registry instances
  type SplitterRegistryOptions,
} from "@zag-js/splitter"

// Create registry with options
const myRegistry = registry({
  getRootNode: () => shadowRoot,
  nonce: "csp-nonce",
  hitAreaMargins: { coarse: 15, fine: 5 },
})
```

### Props

```typescript
interface SplitterProps {
  // ...existing props
  registry?: SplitterRegistry
  hitAreaMargins?: HitAreaMargins
}
```

## Credits

Inspired by [react-resizable-panels](https://github.com/bvaughn/react-resizable-panels) by Brian Vaughn.
