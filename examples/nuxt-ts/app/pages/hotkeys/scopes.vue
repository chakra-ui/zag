<script setup lang="ts">
import { createHotkeyStore } from "@zag-js/hotkeys"

type PanelId = "editor" | "terminal"

const store = createHotkeyStore({
  activeScopes: ["editor"],
  conflictBehavior: "allow",
})

const activePanel = ref<PanelId>("editor")
const editorLogs = ref<string[]>([])
const terminalLogs = ref<string[]>([])

const logTo = (target: PanelId, message: string) => {
  const entry = `${new Date().toLocaleTimeString()}: ${message}`
  if (target === "editor") editorLogs.value = [entry, ...editorLogs.value.slice(0, 4)]
  else terminalLogs.value = [entry, ...terminalLogs.value.slice(0, 4)]
}

onMounted(() => {
  store.register([
    // Same hotkey, different scopes
    {
      id: "editor-run",
      hotkey: "mod+Enter",
      label: "Run",
      action: () => logTo("editor", "Run code in editor"),
      scopes: ["editor"],
    },
    {
      id: "terminal-run",
      hotkey: "mod+Enter",
      label: "Run",
      action: () => logTo("terminal", "Execute command in terminal"),
      scopes: ["terminal"],
    },
    {
      id: "editor-format",
      hotkey: "Alt+Shift+F",
      label: "Format",
      action: () => logTo("editor", "Format code"),
      scopes: ["editor"],
    },
    {
      id: "terminal-clear",
      hotkey: "mod+K",
      label: "Clear",
      action: () => {
        terminalLogs.value = []
        logTo("terminal", "Terminal cleared")
      },
      scopes: ["terminal"],
    },
  ])

  store.init({ target: document })
})

onBeforeUnmount(() => store.destroy())

const switchPanel = (panel: PanelId) => {
  activePanel.value = panel
  store.setScope(panel)
}

const panels = computed(() => [
  { id: "editor" as const, hints: ["⌘Enter — Run code", "Alt+Shift+F — Format"], logs: editorLogs.value },
  { id: "terminal" as const, hints: ["⌘Enter — Execute command", "⌘K — Clear"], logs: terminalLogs.value },
])

const tabStyle = (active: boolean) => ({
  padding: "6px 16px",
  fontSize: "0.8rem",
  fontWeight: active ? 600 : 400,
  backgroundColor: active ? "#1e1e1e" : "#e5e5e5",
  color: active ? "#fff" : "#666",
  border: "none",
  borderRadius: "6px 6px 0 0",
  cursor: "pointer",
})

const panelStyle = (active: boolean) => ({
  flex: 1,
  padding: "12px",
  backgroundColor: active ? "#1e1e1e" : "#f5f5f5",
  color: active ? "#d4d4d4" : "#999",
  borderRadius: "0 0 6px 6px",
  fontFamily: "monospace",
  fontSize: "0.8rem",
  cursor: "pointer",
  border: active ? "1px solid #333" : "1px solid #ddd",
  transition: "all 0.15s",
})

const kbdStyle = {
  display: "inline-block",
  padding: "2px 6px",
  fontSize: "0.8rem",
  fontFamily: "monospace",
  backgroundColor: "#f0f0f0",
  border: "1px solid #ccc",
  borderRadius: "4px",
  boxShadow: "0 1px 0 #ccc",
}
</script>

<template>
  <main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem">Hotkey Scopes</h1>
    <p style="color: #666; margin-bottom: 1rem">
      <kbd :style="kbdStyle">⌘ Enter</kbd> does different things depending on which panel is focused.
    </p>

    <div style="display: flex; gap: 2px; margin-bottom: 2px">
      <button :style="tabStyle(activePanel === 'editor')" @click="switchPanel('editor')">Editor</button>
      <button :style="tabStyle(activePanel === 'terminal')" @click="switchPanel('terminal')">Terminal</button>
    </div>

    <div style="display: flex; gap: 2px; min-height: 220px">
      <div
        v-for="panel in panels"
        :key="panel.id"
        :style="panelStyle(activePanel === panel.id)"
        @click="switchPanel(panel.id)"
      >
        <div :style="{ marginBottom: '8px', color: activePanel === panel.id ? '#888' : '#bbb' }">
          <div v-for="(hint, i) in panel.hints" :key="i">{{ hint }}</div>
        </div>
        <div v-for="(log, i) in panel.logs" :key="i" :style="{ color: activePanel === panel.id ? '#00ff00' : '#aaa' }">
          {{ log }}
        </div>
        <div v-if="panel.logs.length === 0" style="font-style: italic; color: #666">No events yet...</div>
      </div>
    </div>

    <div style="margin-top: 1rem; font-size: 0.8rem; color: #888">
      Active scope: <strong style="color: #333">{{ activePanel }}</strong>
    </div>
  </main>
</template>
