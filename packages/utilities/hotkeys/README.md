# @zag-js/hotkeys

A TypeScript-first hotkey management system with context-aware scoping and command metadata. Built for modern
applications that need sophisticated keyboard shortcut management.

## Installation

```sh
pnpm add @zag-js/hotkeys
# or
npm i @zag-js/hotkeys
```

## Features

- 🎯 **Store-based Architecture** - Centralized hotkey management with reactive state
- 🔄 **Context-Aware** - Pass typed context to command actions
- 🎚️ **Scoped Hotkeys** - Enable/disable hotkey groups based on app state
- 📋 **Command Metadata** - Rich command information for command palettes
- 🔗 **Key Sequences** - Support for vim-like sequences (e.g., `"G > H"`)
- 🌗 **Shadow DOM** - Works in both regular DOM and Shadow DOM
- ⚡ **TypeScript** - Full type safety with generic context support
- 🧹 **Auto Cleanup** - Automatic event listener management
- 🌍 **Layout-Aware** - Automatic dual matching for both logical keys and physical positions

## Quick Start

### Simple Hotkey Checking

For simple use cases where you just want to check if a keyboard event matches a hotkey pattern:

```typescript
import { isHotKey } from "@zag-js/hotkeys"

// Check single hotkey
document.addEventListener("keydown", (event) => {
  if (isHotKey("mod+s", event)) {
    event.preventDefault()
    // Handle save
  }
})

// Check multiple hotkeys (any match returns true)
if (isHotKey(["mod+k", "ctrl+k"], event)) {
  // Open command palette
}

// With options
if (isHotKey("mod+enter", event, { enableOnFormTags: true })) {
  // Submit form
}
```

### Parsing Hotkey Strings

Use `parseHotkey` to parse hotkey strings into structured objects for analysis:

```typescript
import { parseHotkey } from "@zag-js/hotkeys"

// Parse simple hotkey
const parsed = parseHotkey("mod+s")
// Result: { keys: ["s"], alt: false, ctrl/meta: true, shift: false, isSequence: false }

// Parse with multiple modifiers
const parsed2 = parseHotkey("ctrl+shift+k")
// Result: { keys: ["k"], alt: false, ctrl: true, shift: true, meta: false, isSequence: false }

// Parse sequences
const parsed3 = parseHotkey("g > g")
// Result: {
//   keys: ["g", "g"],
//   isSequence: true,
//   sequenceSteps: [
//     { key: "g", alt: false, ctrl: false, meta: false, shift: false },
//     { key: "g", alt: false, ctrl: false, meta: false, shift: false }
//   ]
// }

// Parse special keys
const parsed4 = parseHotkey("ctrl++") // Plus key
// Result: { keys: ["+"], ctrl: true, alt: false, meta: false, shift: false }
```

This is useful for:

- Building custom hotkey UI components
- Validating hotkey strings
- Analyzing hotkey complexity
- Converting between hotkey formats

### Store-Based Management

For more complex applications with multiple hotkeys, scopes, and context:

```typescript
import { createHotkeyStore } from "@zag-js/hotkeys"

// Create store with typed context
interface AppContext {
  user: string
  theme: "dark" | "light"
}

const store = createHotkeyStore<AppContext>()

// Initialize with DOM and context
store.initialize({
  rootNode: document,
  defaultContext: { user: "john", theme: "dark" },
})

// Register commands
store.register([
  {
    id: "save",
    hotkey: "Control+S",
    label: "Save Document",
    action: (context, event) => {
      console.log(`Saving for ${context.user}`)
    },
  },
  {
    id: "toggle-theme",
    hotkey: "Control+T",
    action: (context) => {
      const newTheme = context.theme === "dark" ? "light" : "dark"
      store.setContext({ ...context, theme: newTheme })
    },
  },
])

// Cleanup when done
store.destroy()
```

## Core API

### Creating a Store

```typescript
import { createHotkeyStore } from "@zag-js/hotkeys"

// Basic store
const store = createHotkeyStore()

// With options
const store = createHotkeyStore({
  defaultActiveScopes: ["global", "editor"],
  sequenceTimeoutMs: 1500,
})

// With typed context
interface MyContext {
  userId: string
  permissions: string[]
}

const store = createHotkeyStore<MyContext>({
  defaultActiveScopes: ["app"],
})
```

### Initialization

```typescript
// Initialize with DOM and context
store.initialize({
  rootNode: document, // or shadowRoot
  defaultContext: { userId: "123", permissions: ["read", "write"] },
})
```

### Command Registration

```typescript
store.register([
  {
    id: "save-file",
    hotkey: "Control+S",
    label: "Save File",
    description: "Save the current document",
    category: "File",
    keywords: ["save", "persist", "store"],
    scopes: ["editor"],
    action: async (context, event) => {
      // Your save logic here
      console.log("Saving...")
    },
    options: {
      preventDefault: true,
      enableOnFormTags: false,
    },
  },
  {
    id: "zoom-in",
    hotkey: "Control++",
    label: "Zoom In",
    action: (context) => {
      // Handle zoom
    },
  },
])
```

### Command Definition Properties

```typescript
interface CommandDefinition<TContext = any> {
  id: string // Unique identifier
  hotkey: string // Key combination
  action: HotkeyAction<TContext> // Function to execute
  label?: string // Display name
  description?: string // What the command does
  category?: string // Grouping (File, Edit, View, etc.)
  keywords?: string[] // Search terms
  scopes?: string | string[] // When command is active
  enabled?: boolean | ((context: TContext) => boolean)
  options?: HotkeyOptions // Behavior configuration
}
```

## Scope Management

Scopes control **when** hotkeys are active, enabling context-sensitive keyboard shortcuts.

### Basic Scope Operations

```typescript
// Set active scopes (replaces current)
store.setScope(["editor", "sidebar"])

// Add scope without replacing others
store.addScope("modal")

// Remove specific scope
store.removeScope("sidebar")

// Toggle scope on/off
store.toggleScope("debug")

// Check current scopes
const scopes = store.getActiveScopes() // ["editor", "modal", "debug"]
```

### Scope Use Cases

#### 1. Modal/Overlay Management

```typescript
// Register modal-specific hotkeys
store.register([
  {
    id: "close-modal",
    hotkey: "Escape",
    scopes: ["modal"],
    action: () => closeModal(),
  },
  {
    id: "confirm-action",
    hotkey: "Enter",
    scopes: ["modal"],
    action: () => confirmAction(),
  },
])

// When modal opens
function openModal() {
  store.setScope(["modal"]) // Only modal hotkeys active
  showModal()
}

// When modal closes
function closeModal() {
  store.setScope(["global"]) // Restore global hotkeys
  hideModal()
}
```

#### 2. Application Modes

```typescript
// Register mode-specific hotkeys
store.register([
  {
    id: "vim-movement",
    hotkey: "H",
    scopes: ["vim-mode"],
    action: () => moveCursorLeft(),
  },
  {
    id: "normal-backspace",
    hotkey: "Backspace",
    scopes: ["normal-mode"],
    action: () => deleteCharacter(),
  },
])

// Switch modes
function enableVimMode() {
  store.setScope(["global", "vim-mode"])
}

function enableNormalMode() {
  store.setScope(["global", "normal-mode"])
}
```

#### 3. Feature Gating

```typescript
// Pro features
store.register([
  {
    id: "advanced-search",
    hotkey: "Control+Shift+F",
    scopes: ["pro-features"],
    action: () => openAdvancedSearch(),
  },
])

// Enable based on user subscription
if (user.isPro) {
  store.addScope("pro-features")
}
```

#### 4. Context-Sensitive Actions

```typescript
// Same hotkey, different actions
store.register([
  {
    id: "save-document",
    hotkey: "Control+S",
    scopes: ["editor"],
    action: () => saveDocument(),
  },
  {
    id: "save-settings",
    hotkey: "Control+S",
    scopes: ["settings"],
    action: () => saveSettings(),
  },
])
```

### Default Scope Behavior

- **`["*"]`** - Always active (default)
- **Empty scopes** - Same as `["*"]`
- **Multiple scopes** - Command active if ANY scope matches
- **No active scopes** - Only `["*"]` commands work

## Context Management

Pass typed data to command actions and update it dynamically.

```typescript
interface AppContext {
  user: { id: string; name: string }
  document: { id: string; modified: boolean }
  selection: { start: number; end: number }
}

const store = createHotkeyStore<AppContext>()

store.register([
  {
    id: "save",
    hotkey: "Control+S",
    action: (context, event) => {
      // Fully typed context
      saveDocument(context.document.id, context.user.id)

      // Update context
      store.setContext({
        ...context,
        document: { ...context.document, modified: false },
      })
    },
  },
  {
    id: "delete-selection",
    hotkey: "Delete",
    enabled: (context) => context.selection.start !== context.selection.end,
    action: (context) => {
      deleteText(context.selection.start, context.selection.end)
    },
  },
])

// Update context from elsewhere
function onSelectionChange(start: number, end: number) {
  const context = store.getContext()
  store.setContext({
    ...context,
    selection: { start, end },
  })
}
```

## Key Sequences

Support for vim-like key sequences with configurable timeouts.

```typescript
store.register([
  {
    id: "go-to-line",
    hotkey: "G > G", // Press G, then G within timeout
    action: () => goToFirstLine(),
  },
  {
    id: "delete-line",
    hotkey: "D > D",
    action: () => deleteLine(),
  },
])

// Configure sequence timeout
const store = createHotkeyStore({
  sequenceTimeoutMs: 1500, // 1.5 seconds to complete sequence
})
```

## Command Options

```typescript
interface HotkeyOptions {
  preventDefault?: boolean // Prevent browser default (default: true)
  stopPropagation?: boolean // Stop event bubbling (default: false)
  enableOnFormTags?: boolean | FormTagName[] // Allow in form elements
  enableOnContentEditable?: boolean // Allow in contentEditable elements
  capture?: boolean // Use capture phase (default: true)
}

store.register([
  {
    id: "submit-form",
    hotkey: "Control+Enter",
    action: () => submitForm(),
    options: {
      enableOnFormTags: true, // Works in inputs/textareas
      preventDefault: false, // Don't block default behavior
    },
  },
])
```

## State Subscription

React to store state changes for UI updates.

```typescript
// Subscribe to specific state changes
const unsubscribe = store.subscribe(
  (state, context) => state.commands.size, // Selector
  (commandCount) => {
    console.log(`${commandCount} commands registered`)
  },
)

// Subscribe to active scopes
store.subscribe(
  (state) => Array.from(state.activeScopes),
  (scopes) => updateUI(scopes),
)

// Cleanup subscription
unsubscribe()
```

## Framework Integration

### React Hook

```typescript
import { useEffect } from "react"
import { createHotkeyStore } from "@zag-js/hotkeys"

function useHotkeyStore<T>(context: T) {
  const [store] = useState(() => createHotkeyStore<T>())

  useEffect(() => {
    store.initialize({
      rootNode: document,
      defaultContext: context
    })

    return () => store.destroy()
  }, [])

  useEffect(() => {
    store.setContext(context)
  }, [context])

  return store
}

// Usage
function MyComponent() {
  const store = useHotkeyStore({ userId: "123" })

  useEffect(() => {
    store.register([
      {
        id: "save",
        hotkey: "Control+S",
        action: (context) => save(context.userId)
      }
    ])
  }, [])

  return <div>Press Ctrl+S to save</div>
}
```

### Vue Composable

```typescript
import { onMounted, onUnmounted, watch } from "vue"
import { createHotkeyStore } from "@zag-js/hotkeys"

export function useHotkeyStore<T>(context: Ref<T>) {
  const store = createHotkeyStore<T>()

  onMounted(() => {
    store.initialize({
      rootNode: document,
      defaultContext: context.value,
    })
  })

  watch(
    context,
    (newContext) => {
      store.setContext(newContext)
    },
    { deep: true },
  )

  onUnmounted(() => {
    store.destroy()
  })

  return store
}
```

## Cross-Platform Support

Handle platform differences automatically:

```typescript
store.register([
  {
    id: "save",
    hotkey: "ControlOrMeta+S", // Ctrl on Windows/Linux, Cmd on macOS
    action: () => save(),
  },
  {
    id: "copy",
    hotkey: "mod+C", // Same as ControlOrMeta
    action: () => copy(),
  },
])
```

## Layout-Aware Matching

The library automatically handles different keyboard layouts by matching both the logical key (what's printed on the
key) and the physical key position. This means your hotkeys work consistently across different keyboard layouts without
any configuration.

### How It Works

When you define a hotkey like `"Ctrl+Z"`, the library:

1. Matches the logical key (`event.key === "z"`) - works on QWERTY
2. Also matches the physical position (`event.code === "KeyZ"`) - works on QWERTZ/AZERTY

This dual matching ensures:

- **QWERTY users**: Press the "Z" key (bottom left)
- **QWERTZ users**: Press either "Z" (labeled) OR "Y" (physical Z position)
- **AZERTY users**: Press either "Z" (labeled) OR "W" (physical Z position)

### Examples

```typescript
// This automatically works across all keyboard layouts
store.register({
  id: "undo",
  hotkey: "Ctrl+Z",
  action: () => undo(),
})

// Simple hotkey checking with layout awareness
if (isHotKey("Ctrl+Z", event)) {
  // Triggers on:
  // - QWERTY: Ctrl+Z
  // - QWERTZ: Ctrl+Z or Ctrl+Y (physical Z position)
  // - AZERTY: Ctrl+Z or Ctrl+W (physical Z position)
}

// Sequences also work across layouts
store.register({
  id: "goto-line",
  hotkey: "G > G",
  action: () => goToLine(),
  // Works with both logical "G" and physical "KeyG" position
})
```

### Benefits

- **No Configuration**: Works automatically without any setup
- **International Users**: Supports users with non-US keyboard layouts
- **Layout Switching**: Works even when users switch keyboard layouts
- **Muscle Memory**: Respects physical key positions for consistency
- **Labeled Keys**: Also respects what's printed on the keys

### Supported Keys

Layout-aware matching works for:

- Letters (A-Z)
- Numbers (0-9)
- Common symbols (-, =, [, ], ;, ', `, \\, ,, ., /)
- Function keys (F1-F20)
- Navigation keys (arrows, home, end, page up/down)
- Special keys (enter, tab, space, escape, backspace, delete)

### Note

Modifier keys (Ctrl, Alt, Shift, Meta/Cmd) are always matched by their logical value, not position, as they are
consistent across layouts.

## Command Palette Integration

The metadata-rich command system is designed for command palette integration:

```typescript
// Commands with rich metadata
store.register([
  {
    id: "open-file",
    hotkey: "Control+O",
    label: "Open File",
    description: "Open a file from disk",
    category: "File",
    keywords: ["open", "load", "import", "file"],
    action: () => openFile(),
  },
])

// Get all commands for palette
const commands = Array.from(store.getState().commands.values())

// Filter by category
const fileCommands = commands.filter((cmd) => cmd.category === "File")

// Search by keywords
function searchCommands(query: string) {
  return commands.filter(
    (cmd) =>
      cmd.label?.toLowerCase().includes(query.toLowerCase()) ||
      cmd.description?.toLowerCase().includes(query.toLowerCase()) ||
      cmd.keywords?.some((keyword) => keyword.toLowerCase().includes(query.toLowerCase())),
  )
}
```

## TypeScript Support

Full type safety with generic context support:

```typescript
import type { HotkeyStore, CommandDefinition, HotkeyAction, HotkeyOptions } from "@zag-js/hotkeys"

interface MyContext {
  userId: string
  theme: "light" | "dark"
}

const store: HotkeyStore<MyContext> = createHotkeyStore<MyContext>()

const command: CommandDefinition<MyContext> = {
  id: "toggle-theme",
  hotkey: "Control+T",
  action: (context: MyContext, event: KeyboardEvent) => {
    // Fully typed context and event
    const newTheme = context.theme === "light" ? "dark" : "light"
    store.setContext({ ...context, theme: newTheme })
  },
}
```

## Best Practices

1. **Use scopes for context**: Group related hotkeys and enable/disable based on app state
2. **Provide rich metadata**: Include labels, descriptions, and keywords for better UX
3. **Type your context**: Use TypeScript generics for type-safe context handling
4. **Clean up properly**: Always call `store.destroy()` when done
5. **Consider sequences carefully**: Set appropriate timeouts for key sequences
6. **Test across platforms**: Verify cross-platform shortcuts work as expected
7. **International users**: The automatic layout-aware matching handles different keyboards

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+

## License

MIT License
