<script setup lang="ts">
import { createHotkeyStore } from "@zag-js/hotkeys"

const store = createHotkeyStore()

const logs = ref<string[]>([])

const addLog = (message: string) => {
  logs.value = [`${new Date().toLocaleTimeString()}: ${message}`, ...logs.value.slice(0, 9)]
}

onMounted(() => {
  store.register([
    { id: "go-home", hotkey: "G > H", label: "Go Home", action: () => addLog("G then H: Navigate home") },
    { id: "go-issues", hotkey: "G > I", label: "Go Issues", action: () => addLog("G then I: Navigate to issues") },
    { id: "go-pulls", hotkey: "G > P", label: "Go PRs", action: () => addLog("G then P: Navigate to pull requests") },
    {
      id: "go-settings",
      hotkey: "G > S",
      label: "Go Settings",
      action: () => addLog("G then S: Navigate to settings"),
    },
    { id: "toggle-theme", hotkey: "K > T", label: "Toggle Theme", action: () => addLog("K then T: Toggle theme") },
    {
      id: "toggle-sidebar",
      hotkey: "K > S",
      label: "Toggle Sidebar",
      action: () => addLog("K then S: Toggle sidebar"),
    },
    {
      id: "mod-sequence",
      hotkey: "Ctrl+K > D",
      label: "Debug",
      action: () => addLog("Ctrl+K then D: Open debug panel"),
    },
  ])

  store.init({ target: document })
})

onBeforeUnmount(() => store.destroy())

const sections = [
  {
    title: "Navigation",
    items: [
      ["G H", "Home"],
      ["G I", "Issues"],
      ["G P", "Pull Requests"],
      ["G S", "Settings"],
    ],
  },
  {
    title: "Toggle",
    items: [
      ["K T", "Theme"],
      ["K S", "Sidebar"],
    ],
  },
  { title: "With Modifiers", items: [["Ctrl+K D", "Debug Panel"]] },
]

const kbdStyle = {
  padding: "2px 6px",
  fontSize: "0.8rem",
  fontFamily: "monospace",
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxShadow: "0 1px 0 #eee",
  marginRight: "4px",
}
</script>

<template>
  <main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem">Key Sequences</h1>
    <p style="color: #666; margin-bottom: 1.5rem">
      Press keys in sequence (vim-style). Type the first key, then the second within 1 second.
    </p>

    <div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f5f5f5; border-radius: 0.5rem">
      <template v-for="(section, si) in sections" :key="section.title">
        <div style="font-size: 0.85rem; font-weight: 600; margin-bottom: 8px">{{ section.title }}</div>
        <div
          :style="{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap',
            marginBottom: si < sections.length - 1 ? '12px' : undefined,
          }"
        >
          <template v-for="[keys, label] in section.items" :key="keys">
            <code :style="kbdStyle">{{ keys }}</code> {{ label }}
          </template>
        </div>
      </template>
    </div>

    <div style="background-color: #000; color: #00ff00; padding: 1rem; border-radius: 0.5rem; font-family: monospace">
      <div style="margin-bottom: 0.5rem; color: #888">Event Log:</div>
      <div v-for="(log, i) in logs" :key="i" style="font-size: 0.8rem">{{ log }}</div>
      <div v-if="logs.length === 0" style="color: #666; font-style: italic">Press a key sequence...</div>
    </div>
  </main>
</template>
