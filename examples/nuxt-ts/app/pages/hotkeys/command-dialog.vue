<script setup lang="ts">
import * as dialog from "@zag-js/dialog"
import { createHotkeyStore } from "@zag-js/hotkeys"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/dialog.css"

const commands = [
  { id: "new-file", label: "New File", category: "File" },
  { id: "open-file", label: "Open File", category: "File" },
  { id: "save-file", label: "Save File", category: "File" },
  { id: "toggle-sidebar", label: "Toggle Sidebar", category: "View" },
  { id: "toggle-terminal", label: "Toggle Terminal", category: "View" },
  { id: "zoom-in", label: "Zoom In", category: "View" },
  { id: "zoom-out", label: "Zoom Out", category: "View" },
  { id: "find-replace", label: "Find and Replace", category: "Edit" },
  { id: "format-document", label: "Format Document", category: "Edit" },
  { id: "go-to-line", label: "Go to Line", category: "Edit" },
  { id: "git-commit", label: "Git: Commit", category: "Git" },
  { id: "git-push", label: "Git: Push", category: "Git" },
  { id: "git-pull", label: "Git: Pull", category: "Git" },
]

const open = ref(false)
const query = ref("")
const inputRef = ref<HTMLInputElement>()

const store = createHotkeyStore()

store.register([
  {
    id: "open-command-dialog",
    hotkey: "mod+K",
    label: "Open Command Dialog",
    description: "Open the command dialog",
    action: () => (open.value = true),
    options: { preventDefault: true },
  },
  {
    id: "open-command-dialog-slash",
    hotkey: "mod+/",
    label: "Open Command Dialog (slash)",
    description: "Open the command dialog with slash",
    action: () => (open.value = true),
    options: { preventDefault: true },
  },
])

const service = useMachine(
  dialog.machine,
  computed(() => ({
    id: "command-dialog",
    open: open.value,
    onOpenChange(details: dialog.OpenChangeDetails) {
      open.value = details.open
    },
  })),
)
const api = computed(() => dialog.connect(service, normalizeProps))

const filtered = computed(() => commands.filter((cmd) => cmd.label.toLowerCase().includes(query.value.toLowerCase())))

const grouped = computed(() =>
  filtered.value.reduce(
    (acc, cmd) => {
      ;(acc[cmd.category] ??= []).push(cmd)
      return acc
    },
    {} as Record<string, typeof commands>,
  ),
)

onMounted(() => store.init({ target: document }))
onBeforeUnmount(() => store.destroy())

watch(open, (isOpen) => {
  if (isOpen) requestAnimationFrame(() => inputRef.value?.focus())
  else query.value = ""
})

const execute = (cmd: (typeof commands)[number]) => {
  open.value = false
  console.log(`Executed: ${cmd.label}`)
}

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

const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  fontSize: "1rem",
  border: "none",
  borderBottom: "1px solid #eee",
  outline: "none",
  boxSizing: "border-box" as const,
}

const listStyle = { maxHeight: "320px", overflowY: "auto" as const, padding: "8px 0" }

const categoryStyle = {
  padding: "8px 16px 4px",
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.05em",
  color: "#999",
}

const itemStyle = { padding: "8px 16px", fontSize: "0.9rem", cursor: "pointer", color: "#333" }

const emptyStyle = { padding: "24px 16px", textAlign: "center" as const, color: "#999", fontSize: "0.9rem" }
</script>

<template>
  <main style="padding: 2rem; max-width: 42rem; margin: 0 auto">
    <h1 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem">Command Dialog</h1>
    <p style="color: #666; margin-bottom: 1.5rem">
      Press <kbd :style="kbdStyle">⌘K</kbd> or <kbd :style="kbdStyle">⌘/</kbd> to open.
    </p>

    <Teleport to="#teleports">
      <Presence v-bind="api.getBackdropProps()" />
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getContentProps()">
          <h2 v-bind="api.getTitleProps()" style="display: none">Command Palette</h2>

          <input ref="inputRef" v-model="query" type="text" placeholder="Type a command..." :style="inputStyle" />

          <div :style="listStyle">
            <div v-for="(items, category) in grouped" :key="category">
              <div :style="categoryStyle">{{ category }}</div>
              <div v-for="cmd in items" :key="cmd.id" :style="itemStyle" @click="execute(cmd)">
                {{ cmd.label }}
              </div>
            </div>

            <div v-if="filtered.length === 0" :style="emptyStyle">No results found.</div>
          </div>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
