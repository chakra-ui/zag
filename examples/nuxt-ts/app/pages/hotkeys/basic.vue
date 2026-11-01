<script setup lang="ts">
import { createHotkeyStore, formatHotkey, type HotkeyCommand } from "@zag-js/hotkeys"

const store = createHotkeyStore()

const logs = ref<string[]>([])
const commands = ref<HotkeyCommand[]>([])

const addLog = (message: string) => {
  logs.value = [`${new Date().toLocaleTimeString()}: ${message}`, ...logs.value.slice(0, 9)]
}

onMounted(() => {
  store.register([
    {
      id: "save",
      hotkey: "mod+S",
      label: "Save",
      action: () => addLog("mod+S: Save"),
      options: { preventDefault: true },
    },
    { id: "undo", hotkey: "mod+Z", label: "Undo", action: () => addLog("mod+Z: Undo") },
    { id: "redo", hotkey: "mod+shift+Z", label: "Redo", action: () => addLog("mod+shift+Z: Redo") },
    { id: "escape", hotkey: "Escape", label: "Close", action: () => addLog("Escape: Close") },
  ])

  store.init({ target: document })
  commands.value = Array.from(store.getState().commands.values())
})

onBeforeUnmount(() => store.destroy())
</script>

<template>
  <main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1.5rem">Hotkeys Example</h1>

    <div style="margin-bottom: 1.5rem; padding: 1rem; background-color: #f5f5f5; border-radius: 0.5rem">
      <ul style="margin: 0.5rem 0; padding-left: 1.5rem">
        <li v-for="cmd in commands" :key="cmd.id">
          <code>{{ formatHotkey(cmd.hotkey, { platform: "mac" }) }}</code> : {{ cmd.label || cmd.id }}
        </li>
      </ul>
    </div>

    <div style="background-color: #000; color: #00ff00; padding: 1rem; border-radius: 0.5rem; font-family: monospace">
      <div style="margin-bottom: 0.5rem; color: #888">Event Log:</div>
      <div v-for="(log, i) in logs" :key="i" style="font-size: 0.8rem">{{ log }}</div>
      <div v-if="logs.length === 0" style="color: #666; font-style: italic">Press any hotkey to see events...</div>
    </div>
  </main>
</template>
