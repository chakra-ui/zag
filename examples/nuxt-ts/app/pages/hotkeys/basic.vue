<script setup lang="ts">
import { createHotkeyStore, formatHotkey } from "@zag-js/hotkeys"

let addLog: (message: string) => void = () => {}
let theme: "dark" | "light" = "dark"
let zoomLevel = 1.0
const user = "demo-user"

const store = createHotkeyStore({
  activeScopes: ["global", "editor"],
})

store.register([
  {
    id: "store-save",
    hotkey: "Alt+S",
    label: "Save (Alt)",
    description: "Save the current document with context",
    category: "file",
    keywords: ["save", "persist", "store"],
    action: async () => {
      addLog(`Alt+S: Saved by ${user} (zoom: ${zoomLevel}x)`)
    },
  },
  {
    id: "change-theme",
    hotkey: "K > T",
    label: "Log Theme",
    description: "Log the current theme (sequence)",
    category: "appearance",
    keywords: ["theme", "log"],
    action: async () => {
      addLog(`K > T: Current theme is "${theme}"`)
    },
  },
  {
    id: "store-zoom-in",
    hotkey: "Alt++",
    label: "Zoom In",
    description: "Increase zoom level",
    category: "view",
    keywords: ["zoom", "scale", "magnify"],
    action: async () => {
      const newZoom = zoomLevel * 1.1
      zoomLevel = newZoom
      addLog(`Alt++: Zoomed in to ${newZoom.toFixed(1)}x`)
    },
  },
  {
    id: "toggle-theme",
    hotkey: "Alt+T",
    label: "Toggle Theme",
    description: "Switch between dark and light themes",
    action: async () => {
      const newTheme = theme === "dark" ? "light" : "dark"
      theme = newTheme
      addLog(`Alt+T: Theme switched to "${newTheme}" (F1 help ${newTheme === "dark" ? "enabled" : "disabled"})`)
    },
  },
  {
    id: "toggle-editor-scope",
    hotkey: "Alt+E",
    label: "Toggle Editor Scope",
    description: "Enable/disable editor-specific hotkeys",
    action: () => {
      store.toggleScope("editor")
      const scopes = store.getActiveScopes()
      const editorActive = scopes.includes("editor")
      addLog(
        `Alt+E: Editor scope ${editorActive ? "enabled" : "disabled"} (Alt+Shift+F ${editorActive ? "available" : "unavailable"})`,
      )
    },
  },
  {
    id: "command-palette",
    hotkey: "Control+K",
    label: "Command Palette",
    description: "Open command palette",
    action: () => addLog("Ctrl+K: Open command palette"),
  },
  {
    id: "close-modal",
    hotkey: "Escape",
    label: "Close Modal",
    description: "Close any open modal or dialog",
    action: () => addLog("Escape: Close modal"),
  },
  {
    id: "go-home",
    hotkey: "G > H",
    label: "Go Home",
    description: "Navigate to home page (sequence)",
    action: () => addLog("G > H: Navigate to home"),
  },
  {
    id: "submit",
    hotkey: "ControlOrMeta+Enter",
    label: "Submit Form",
    description: "Submit current form (works in form fields)",
    action: () => addLog("Ctrl/Cmd+Enter: Submit form"),
    options: { enableOnFormTags: true },
  },
  {
    id: "input-only-hotkey",
    hotkey: "Control+I",
    label: "Input Only Action",
    description: "Action that only works in input fields",
    action: () => addLog("Ctrl+I: Input-only action triggered"),
    options: { enableOnFormTags: ["input"] },
  },
  {
    id: "save",
    hotkey: "mod+S",
    label: "Save (Mod)",
    description: "Save current document (cross-platform)",
    action: () => addLog("Ctrl/Cmd+S: Save document"),
    options: { preventDefault: true },
  },
  {
    id: "zoom-in",
    hotkey: "mod++",
    label: "Zoom In (Mod)",
    description: "Zoom in using platform modifier and plus key",
    action: () => addLog("Ctrl/Cmd++: Zoom in"),
    options: { preventDefault: true },
  },
  {
    id: "plus-key",
    hotkey: "+",
    label: "Plus Key",
    description: "Bare plus key press",
    action: () => addLog("+: Plus key pressed"),
  },
  {
    id: "shift-plus",
    hotkey: "Shift++",
    label: "Shift + Plus",
    description: "Shift modifier with plus key",
    action: () => addLog("Shift++: Shift+Plus pressed"),
  },
  {
    id: "arrow-up",
    hotkey: "ArrowUp",
    label: "Arrow Up",
    description: "Navigate up",
    action: () => addLog("ArrowUp: Navigate up"),
  },
  {
    id: "shift-arrow-down",
    hotkey: "shift+down",
    label: "Shift + Arrow Down",
    description: "Select downward",
    action: () => addLog("Shift+Down: Select downward"),
  },
  {
    id: "help",
    hotkey: "F1",
    label: "Help",
    description: "Show help (only when dark theme is active)",
    action: () => addLog("F1: Show help"),
    scopes: ["global", "help"],
    enabled: () => theme === "dark",
  },
  {
    id: "editor-format",
    hotkey: "Alt+Shift+F",
    label: "Format Code",
    description: "Format code (editor scope only)",
    action: () => addLog("Alt+Shift+F: Format code"),
    scopes: ["editor"],
  },
  {
    id: "undo",
    hotkey: "mod+Z",
    label: "Undo",
    description: "Undo last action",
    action: () => addLog("Ctrl/Cmd+Z: Undo"),
  },
  {
    id: "redo",
    hotkey: "mod+shift+Z",
    label: "Redo",
    description: "Redo last undone action",
    action: () => addLog("Ctrl/Cmd+Shift+Z: Redo"),
  },
])

const commands = Array.from(store.getState().commands.values())
const logs = ref<string[]>([])

onMounted(() => {
  addLog = (message: string) => {
    logs.value = [`${new Date().toLocaleTimeString()}: ${message}`, ...logs.value.slice(0, 9)]
  }

  store.init({
    target: document,
  })
})

onBeforeUnmount(() => {
  store.destroy()
})
</script>

<template>
  <main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem">Hotkeys Example</h1>

    <div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f5f5f5; border-radius: 0.5rem">
      <ul style="margin: 0.5rem 0; padding-left: 1.5rem">
        <li v-for="command in commands" :key="command.id">
          <code>{{ formatHotkey(command.hotkey, { platform: "mac" }) }}</code> : {{ command.label || command.id }}
        </li>
      </ul>
    </div>

    <div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f0f8ff; border-radius: 0.5rem">
      <h3 style="font-size: 1rem; font-weight: 600; margin-bottom: 0.5rem">Test Form Elements:</h3>
      <div style="display: flex; gap: 1rem; flex-direction: column">
        <input
          type="text"
          placeholder="Input field - try Ctrl+I and Ctrl/Cmd+Enter here"
          style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc"
        />
        <textarea
          placeholder="Textarea - try Ctrl/Cmd+Enter here (Ctrl+I won't work)"
          :rows="3"
          style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc; resize: vertical"
        />
        <select style="padding: 0.5rem; border-radius: 0.25rem; border: 1px solid #ccc">
          <option>Select dropdown - try Ctrl/Cmd+Enter here</option>
          <option>Option 2</option>
        </select>
      </div>
    </div>

    <div
      style="
        background-color: #000;
        color: #00ff00;
        padding: 1rem;
        border-radius: 0.5rem;
        font-family: monospace;
      "
    >
      <div style="margin-bottom: 0.5rem; color: #888">Event Log:</div>
      <div v-for="(log, i) in logs" :key="i" style="font-size: 0.8rem">
        {{ log }}
      </div>
      <div v-if="logs.length === 0" style="color: #666; font-style: italic">Press any hotkey to see events...</div>
    </div>
  </main>
</template>
