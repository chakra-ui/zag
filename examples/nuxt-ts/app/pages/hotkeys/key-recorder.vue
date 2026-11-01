<script setup lang="ts">
import {
  createHotkeyRecorder,
  formatHotkey,
  isHotkeyEqual,
  type HotkeyRecorder,
  type RecordedHotkey,
} from "@zag-js/hotkeys"

interface ShortcutBinding {
  id: string
  label: string
  hotkey: RecordedHotkey | null
}

function makeBinding(id: string, label: string, hotkey?: string): ShortcutBinding {
  return {
    id,
    label,
    hotkey: hotkey ? { value: hotkey, display: formatHotkey(hotkey, { platform: "mac" }) } : null,
  }
}

const bindings = ref<ShortcutBinding[]>([
  makeBinding("save", "Save", "mod+S"),
  makeBinding("undo", "Undo", "mod+Z"),
  makeBinding("redo", "Redo"),
  makeBinding("search", "Search"),
  makeBinding("palette", "Command Palette"),
])
const editingId = ref<string | null>(null)
const conflict = ref<string | null>(null)

let recorder: HotkeyRecorder | null = null

onMounted(() => {
  recorder = createHotkeyRecorder({
    target: document,
    onRecord(hotkey) {
      const existing = bindings.value.find(
        (b) => b.id !== editingId.value && b.hotkey && isHotkeyEqual(b.hotkey.value, hotkey.value),
      )
      if (existing) {
        conflict.value = `"${hotkey.display}" is already used by ${existing.label}`
        recorder?.start()
        return
      }
      conflict.value = null
      bindings.value = bindings.value.map((b) => (b.id === editingId.value ? { ...b, hotkey } : b))
      editingId.value = null
    },
    onCancel() {
      conflict.value = null
      editingId.value = null
    },
  })
})

onBeforeUnmount(() => recorder?.destroy())

const startEditing = (id: string) => {
  conflict.value = null
  editingId.value = id
  recorder?.start()
}

const clearBinding = (id: string) => {
  bindings.value = bindings.value.map((b) => (b.id === id ? { ...b, hotkey: null } : b))
}

const currentBindings = computed(() =>
  JSON.stringify(
    bindings.value.map((b) => ({ id: b.id, hotkey: b.hotkey?.value ?? null })),
    null,
    2,
  ),
)

const kbdBtnStyle = {
  padding: "4px 10px",
  fontSize: "0.8rem",
  fontFamily: "monospace",
  backgroundColor: "#fff",
  border: "1px solid #ddd",
  borderRadius: "4px",
  boxShadow: "0 1px 0 #eee",
  cursor: "pointer",
  minWidth: "80px",
  textAlign: "center" as const,
}

const smallBtnStyle = {
  padding: "3px 8px",
  fontSize: "0.75rem",
  backgroundColor: "transparent",
  border: "1px solid #ddd",
  borderRadius: "4px",
  cursor: "pointer",
  color: "#888",
}
</script>

<template>
  <main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 0.5rem">Key Recorder</h1>
    <p style="color: #666; margin-bottom: 1.5rem">Click a shortcut to record a new key combination.</p>

    <div style="display: flex; flex-direction: column; gap: 2px">
      <div
        v-for="binding in bindings"
        :key="binding.id"
        :style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          backgroundColor: editingId === binding.id ? '#fff7ed' : '#fafafa',
          border: editingId === binding.id ? '1px solid #f97316' : '1px solid transparent',
          borderRadius: '6px',
        }"
      >
        <span style="font-size: 0.9rem; font-weight: 500">{{ binding.label }}</span>

        <div style="display: flex; align-items: center; gap: 8px">
          <template v-if="editingId === binding.id">
            <span :style="{ fontSize: '0.8rem', color: conflict ? '#ef4444' : '#f97316', fontStyle: 'italic' }">
              {{ conflict || "Press a key combo..." }}
            </span>
            <button :style="smallBtnStyle" @click="recorder?.cancel()">Cancel</button>
          </template>
          <template v-else>
            <button
              :style="{ ...kbdBtnStyle, color: binding.hotkey ? '#333' : '#999' }"
              @click="startEditing(binding.id)"
            >
              {{ binding.hotkey?.display || "Unset" }}
            </button>
            <button v-if="binding.hotkey" :style="smallBtnStyle" @click="clearBinding(binding.id)">Clear</button>
          </template>
        </div>
      </div>
    </div>

    <div style="margin-top: 2rem; padding: 1rem; background-color: #f5f5f5; border-radius: 8px">
      <h3 style="font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; color: #666">Current Bindings</h3>
      <pre style="font-size: 0.8rem; margin: 0; overflow: auto">{{ currentBindings }}</pre>
    </div>
  </main>
</template>
