# Ark UI Hotkeys — Proposed React API

Design document for wrapping `@zag-js/hotkeys` store and recorder into Ark UI React hooks.

## Hooks

### `useHotkey` — Register a single hotkey

```tsx
import { useHotkey } from "@ark-ui/react/hotkeys"

function App() {
  useHotkey("mod+S", (event) => save(), {
    preventDefault: true,
    scopes: ["editor"],
    enabled: () => !isReadOnly,
  })

  return <div>Press Cmd+S to save</div>
}
```

Internally: creates/reuses a shared `HotkeyStore`, calls `store.register()` on mount, `store.unregister()` on unmount.
Syncs callback on every render (no stale closures).

### `useHotkeys` — Register multiple hotkeys

```tsx
import { useHotkeys } from "@ark-ui/react/hotkeys"

function Editor() {
  useHotkeys([
    { id: "save", hotkey: "mod+S", action: () => save() },
    { id: "undo", hotkey: "mod+Z", action: () => undo() },
    { id: "redo", hotkey: "mod+shift+Z", action: () => redo() },
  ])

  return <div>Editor</div>
}
```

### `useHotkeyStore` — Access the store directly

```tsx
import { useHotkeyStore } from "@ark-ui/react/hotkeys"

function App() {
  const store = useHotkeyStore({
    activeScopes: ["global"],
    conflictBehavior: "replace",
  })

  // Full store API: store.register, store.addScope, etc.
  return <div />
}
```

### `usePressedKeys` — Track currently pressed keys

```tsx
import { usePressedKeys } from "@ark-ui/react/hotkeys"

function StatusBar() {
  const pressedKeys = usePressedKeys() // ["Meta", "Shift"]

  return <div>Pressed: {pressedKeys.join("+") || "None"}</div>
}
```

Internally: `useSyncExternalStore` on the shared store's `subscribe` + `getCurrentlyPressed()`.

### `useIsKeyPressed` — Check if a specific key is held

```tsx
import { useIsKeyPressed } from "@ark-ui/react/hotkeys"

function DragHandle() {
  const isShiftPressed = useIsKeyPressed("Shift")

  return <div style={{ opacity: isShiftPressed ? 1 : 0.5 }}>Drag (Shift for precision)</div>
}
```

Internally: `useSyncExternalStore` + selector on `pressedKeys.has(key)`.

### `useHotkeyRecorder` — Record key combos and sequences

```tsx
import { useHotkeyRecorder } from "@ark-ui/react/hotkeys"

function ShortcutSettings() {
  const recorder = useHotkeyRecorder({
    onRecord(hotkey) {
      saveBinding(hotkey.value)
    },
  })

  return (
    <button onClick={() => recorder.start()}>
      {recorder.recording ? recorder.value?.display || "Press a key..." : "Click to record"}
    </button>
  )
}
```

Internally: creates a `HotkeyRecorder`, exposes state via `useSyncExternalStore`, uses `setOptions` on every render to
keep callbacks fresh. Automatically handles both single chords and multi-step sequences.

## Provider

### `HotkeysProvider` — Shared store + default options

```tsx
import { HotkeysProvider } from "@ark-ui/react/hotkeys"

function Root() {
  return (
    <HotkeysProvider activeScopes={["global"]} conflictBehavior="warn" defaultOptions={{ preventDefault: true }}>
      <App />
    </HotkeysProvider>
  )
}
```

All hooks consume the store from context. Without a provider, they create a default shared store.

## Mapping to TanStack

| TanStack                    | Ark UI (proposed)   | Backed by                                    |
| --------------------------- | ------------------- | -------------------------------------------- |
| `useHotkey`                 | `useHotkey`         | `store.register` / `store.unregister`        |
| `useHotkeys`                | `useHotkeys`        | `store.register` with array                  |
| `usePressedKeys`            | `usePressedKeys`    | `store.getCurrentlyPressed()`                |
| `useHeldKeyCodes`           | Not needed          | `store.getPressedCodes()` available directly |
| `useIsKeyPressed`           | `useIsKeyPressed`   | `store.isPressed()`                          |
| `useHotkeyRecorder`         | `useHotkeyRecorder` | `HotkeyRecorder` + `setOptions`              |
| `useHotkeySequence`         | Not needed          | `useHotkey("G > H", ...)` just works         |
| `useHotkeySequenceRecorder` | Not needed          | `useHotkeyRecorder` handles both             |
| `HotkeysProvider`           | `HotkeysProvider`   | Shared `HotkeyStore` via context             |

## Advantages over TanStack

- **Fewer APIs doing more** — no separate sequence hook or sequence recorder
- **Scopes built in** — every hook supports scopes natively
- **Zero external deps** — no `@tanstack/store` required
- **Unified recorder** — single recorder handles chords and sequences automatically
- **Command metadata** — label, description, category, keywords available on every registration
- **Priority system** — specificity-based, deterministic execution order
- **Conflict behavior** — `warn`, `error`, `replace`, `allow` modes
