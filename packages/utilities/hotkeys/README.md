# @zag-js/hotkeys

A lightweight, TypeScript-first utility for managing keyboard shortcuts and hotkey sequences. Supports both regular DOM
and Shadow DOM contexts with automatic cleanup and memory management.

## Installation

```sh
yarn add @zag-js/hotkeys
# or
npm i @zag-js/hotkeys
```

## Features

- 🎯 **Simple API** - Register hotkeys with a single function call
- 🔥 **Key Sequences** - Support for vim-like key sequences (e.g., `"g>g"`)
- 🌗 **Shadow DOM** - Works seamlessly in both regular DOM and Shadow DOM
- 🧹 **Auto Cleanup** - Automatic event listener management and memory cleanup
- ⚡ **TypeScript** - Full type safety with TypeScript support
- 🎛️ **Configurable** - Extensive options for customization
- 📦 **Lightweight** - Minimal bundle size with tree-shaking support

## Basic Usage

### Register a Simple Hotkey

```typescript
import { registerHotkey } from "@zag-js/hotkeys"

// Register a hotkey
const cleanup = registerHotkey("ctrl+s", (event) => {
  console.log("Save shortcut pressed!")
  // Your save logic here
})

// Clean up when done
cleanup()
```

### Key Combinations

```typescript
// Modifier keys
registerHotkey("ctrl+shift+z", () => console.log("Redo"))
registerHotkey("alt+tab", () => console.log("Switch window"))
registerHotkey("meta+space", () => console.log("Spotlight on macOS"))

// Different modifier names are supported
registerHotkey("cmd+c", () => console.log("Copy")) // same as meta+c
registerHotkey("option+f", () => console.log("Find")) // same as alt+f
```

### Key Sequences

```typescript
// Vim-like sequences
registerHotkey("g>g", () => console.log("Go to top"))
registerHotkey("d>d", () => console.log("Delete line"))

// Custom sequence timeout
registerHotkey("g>g", () => console.log("Go to top"), {
  sequenceTimeoutMs: 1500, // Wait 1.5s for sequence completion
})
```

### Event Capturing

Control when your hotkeys are triggered during the event propagation phase:

```typescript
import { registerHotkey } from "@zag-js/hotkeys"

// Capture phase (default) - triggers before child elements
registerHotkey("ctrl+s", saveHandler, { capture: true })

// Bubble phase - triggers after child elements
registerHotkey("esc", closeModal, { capture: false })

// Mixed usage - same key can have different handlers for different phases
registerHotkey("tab", handleTabCapture, { capture: true }) // Runs first
registerHotkey("tab", handleTabBubble, { capture: false }) // Runs after
```

**Use Cases:**

- **Capture (default)**: Intercept keys before they reach form elements
- **Bubble**: Handle keys after child elements have processed them
- **Mixed**: Different behavior at different event phases

### Overlapping Hotkeys Priority

The library automatically handles overlapping hotkeys by prioritizing more specific combinations:

```typescript
import { registerHotkey } from "@zag-js/hotkeys"

// Less specific hotkey
registerHotkey("d", () => console.log("Delete"))

// More specific hotkey - this will take priority when both g and d are pressed
registerHotkey("g+d", () => console.log("Go to definition"))

// When you press g+d, only "Go to definition" will execute
// When you press just d, "Delete" will execute
```

For even more control, use the `exactMatch` option:

```typescript
// This will ONLY execute when exactly these keys are pressed
registerHotkey("ctrl+s", saveFile, { exactMatch: true })

// This allows other combinations that include these keys
registerHotkey("s", searchHandler) // Will still work with ctrl+s unless exactMatch is used above
```

### Scoped Hotkeys

Use scopes to enable/disable groups of hotkeys based on application state:

```typescript
import { registerHotkey, setScope, addScope, removeScope } from "@zag-js/hotkeys"

// Register hotkeys with specific scopes
registerHotkey("ctrl+s", saveFile, { scopes: "editor" })
registerHotkey("ctrl+z", undo, { scopes: "editor" })
registerHotkey("esc", closeModal, { scopes: "modal" })
registerHotkey("ctrl+n", newFile, { scopes: "*" }) // Always active

// Set active scope (replaces all current scopes)
setScope("editor") // Only editor hotkeys will work

// Add additional scopes
addScope("modal") // Both editor and modal hotkeys work

// Remove specific scope
removeScope("modal") // Only editor hotkeys work

// Multiple scopes for a hotkey
registerHotkey("ctrl+f", find, { scopes: ["editor", "viewer"] })
```

## Advanced Usage

### Using with Shadow DOM

```typescript
import { registerHotkey, createHotkeyManager } from "@zag-js/hotkeys"

// For a specific shadow root
const shadowRoot = element.shadowRoot!

registerHotkey("ctrl+c", copyHandler, {
  getRootNode: () => shadowRoot,
})

// Or use a manager for multiple hotkeys
const manager = createHotkeyManager(() => shadowRoot)
manager.register("ctrl+v", pasteHandler).register("ctrl+x", cutHandler)
```

### Hotkey Manager

For managing multiple hotkeys with automatic cleanup:

```typescript
import { createHotkeyManager } from "@zag-js/hotkeys"

const manager = createHotkeyManager()

// Register multiple hotkeys
manager
  .register("ctrl+s", saveFile)
  .register("ctrl+o", openFile)
  .register("ctrl+n", newFile)
  .register("esc", closeModal)

// Unregister specific hotkey
manager.unregister("esc")

// Clear all hotkeys
manager.clear()

// Clean up everything
manager.destroy()
```

## Configuration Options

```typescript
interface HotkeyOptions {
  enabled?: boolean // Enable/disable hotkey (default: true)
  preventDefault?: boolean // Prevent default browser behavior (default: true)
  stopPropagation?: boolean // Stop event propagation (default: false)
  enableOnFormTags?: boolean // Allow in form elements (default: false)
  enableOnContentEditable?: boolean // Allow in contentEditable (default: false)
  scopes?: string | string[] // Scopes where hotkey is active (default: all)
  sequenceTimeoutMs?: number // Sequence timeout in ms (default: 1000)
  getRootNode?: () => Document | ShadowRoot // Custom root node (default: document)
  exactMatch?: boolean // Only execute this hotkey, block less specific ones (default: false)
  capture?: boolean // Use capture phase for event listeners (default: true)
}
```

### Example with Options

```typescript
registerHotkey("ctrl+s", saveHandler, {
  preventDefault: true, // Prevent browser's save dialog
  enableOnFormTags: true, // Allow when focused on inputs
  enableOnContentEditable: true, // Allow in contentEditable elements
  capture: false, // Use bubble phase instead of capture
  exactMatch: true, // Only this exact combination
})
```

## Utility Functions

### Check Currently Pressed Keys

```typescript
import { isHotkeyPressed, getCurrentlyPressedKeys } from "@zag-js/hotkeys"

// Check if specific keys are pressed
if (isHotkeyPressed("shift")) {
  console.log("Shift is currently pressed")
}

// Get all currently pressed keys
const pressedKeys = getCurrentlyPressedKeys()
console.log("Currently pressed:", pressedKeys)
```

### Global Cleanup

```typescript
import { clearAllHotkeys } from "@zag-js/hotkeys"

// Clear all registered hotkeys for document
clearAllHotkeys()

// Clear for specific shadow root
clearAllHotkeys(() => shadowRoot)
```

### Scope Management

```typescript
import { setScope, addScope, removeScope, getActiveScopes, isScopeActive } from "@zag-js/hotkeys"

// Check current scopes
console.log(getActiveScopes()) // ['*'] (default)

// Set specific scopes
setScope(["editor", "sidebar"])

// Add scope without replacing others
addScope("toolbar")

// Remove specific scope
removeScope("sidebar")

// Check if scope is active
if (isScopeActive("editor")) {
  console.log("Editor hotkeys are active")
}

// Scope management with shadow DOM
setScope("modal", () => shadowRoot)
```

## Key Mapping

The library normalizes key names for consistency:

```typescript
// These are equivalent:
registerHotkey("ctrl+s", handler)
registerHotkey("control+s", handler)

// These are equivalent:
registerHotkey("meta+space", handler) // meta key
registerHotkey("cmd+space", handler) // macOS command key
registerHotkey("command+space", handler)

// These are equivalent:
registerHotkey("alt+tab", handler)
registerHotkey("option+tab", handler) // macOS option key

// Cross-platform modifier - resolves to Ctrl on Windows/Linux, Cmd on macOS
registerHotkey("ctrlOrMeta+s", handler) // Ctrl+S on Windows/Linux, Cmd+S on macOS
registerHotkey("ctrlOrMeta+c", copyHandler) // Cross-platform copy
```

## Cross-Platform Shortcuts

Use `ctrlOrMeta` for shortcuts that should work consistently across platforms:

```typescript
import { registerHotkey } from '@zag-js/hotkeys'

// Standard cross-platform shortcuts
registerHotkey('ctrlOrMeta+s', saveFile)     // Ctrl+S (Win/Linux) / Cmd+S (Mac)
registerHotkey('ctrlOrMeta+c', copy)         // Ctrl+C (Win/Linux) / Cmd+C (Mac)
registerHotkey('ctrlOrMeta+v', paste)        // Ctrl+V (Win/Linux) / Cmd+V (Mac)
registerHotkey('ctrlOrMeta+z', undo)         // Ctrl+Z (Win/Linux) / Cmd+Z (Mac)
registerHotkey('ctrlOrMeta+shift+z', redo)   // Cross-platform redo

// Platform detection utility
import { isMac } from '@zag-js/hotkeys'

if (isMac()) {
  console.log('Running on macOS - using Cmd key')
} else {
  console.log('Running on Windows/Linux - using Ctrl key')
}
```

**Why use ctrlOrMeta?**
- **Consistent UX**: Users get familiar shortcuts regardless of platform
- **Less code**: One registration instead of platform-specific logic
- **Automatic**: No need to manually detect platform in your app

## Framework Integration

### React

```typescript
import { useEffect } from 'react'
import { registerHotkey, setScope } from '@zag-js/hotkeys'

function useHotkey(keys: string, handler: (event: KeyboardEvent) => void) {
  useEffect(() => {
    const cleanup = registerHotkey(keys, handler)
    return cleanup
  }, [keys, handler])
}

// Usage with scopes
function MyComponent() {
  useHotkey('ctrl+s', () => {
    // Save logic
  })

  useEffect(() => {
    // Set scope when component mounts
    setScope('editor')
    return () => setScope('*') // Reset to default
  }, [])

  return <div>Press Ctrl+S to save</div>
}
```

### Vue

```typescript
import { onMounted, onUnmounted } from "vue"
import { registerHotkey } from "@zag-js/hotkeys"

export function useHotkey(keys: string, handler: (event: KeyboardEvent) => void) {
  let cleanup: (() => void) | null = null

  onMounted(() => {
    cleanup = registerHotkey(keys, handler)
  })

  onUnmounted(() => {
    cleanup?.()
  })
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```typescript
import type { HotkeyCallback, HotkeyOptions, ParsedHotkey, KeyboardModifiers } from "@zag-js/hotkeys"

const callback: HotkeyCallback = (event) => {
  // event is properly typed as KeyboardEvent
  console.log("Key pressed:", event.key)
}

const options: HotkeyOptions = {
  enabled: true,
  preventDefault: true,
  // ... other options with full IntelliSense
}
```

## Best Practices

1. **Always clean up**: Use the returned cleanup function to prevent memory leaks
2. **Use managers for multiple hotkeys**: Simplifies management and cleanup
3. **Be specific with modifiers**: Use exact modifier combinations to avoid conflicts
4. **Consider form elements**: Set `enableOnFormTags` appropriately for your use case
5. **Test sequences**: Verify sequence timeouts work well for your users

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Any browser with support for:
  - `addEventListener` with capture
  - `KeyboardEvent` properties
  - `ShadowRoot` (for Shadow DOM features)

## Contribution

Yes please! See the [contributing guidelines](https://github.com/chakra-ui/zag/blob/main/CONTRIBUTING.md) for details.

## License

This project is licensed under the terms of the [MIT license](https://github.com/chakra-ui/zag/blob/main/LICENSE).
