<script setup lang="ts">
import type * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, useMachine } from "@zag-js/vue"
import type { ComputedRef } from "vue"
import "@styles/menu.css"

const fileActions = [
  { value: "new", label: "New", shortcut: "⌘N" },
  { value: "save", label: "Save", shortcut: "⌘S" },
  { value: "export", label: "Export…", disabled: true },
]

const editActions = [
  { value: "undo", label: "Undo", shortcut: "⌘Z" },
  { value: "redo", label: "Redo", shortcut: "⇧⌘Z", disabled: true },
  { value: "select-all", label: "Select all", shortcut: "⌘A" },
]

const lastAction = ref("none")
const settings = ref({ lineNumbers: true, wordWrap: false, theme: "System" })

const service = useMachine(menubar.machine, { id: useId() })
const api = computed(() => menubar.connect(service, normalizeProps))

provide<ComputedRef<menu.MenubarContext>>(
  "menubar",
  computed(() => api.value.getMenuContext()),
)
</script>

<template>
  <main>
    <div class="menubar-app-menu">
      <div v-bind="api.getRootProps()">
        <MenubarActionMenu id="file" label="File" :actions="fileActions" @run="lastAction = $event" />
        <MenubarActionMenu id="edit" label="Edit" :actions="editActions" @run="lastAction = $event" />
        <MenubarViewMenu :settings="settings" @change="settings = $event" />
      </div>
      <p class="status">Last action: {{ lastAction }}</p>
      <p class="status">
        Line numbers {{ settings.lineNumbers ? "on" : "off" }} · Word wrap {{ settings.wordWrap ? "on" : "off" }} ·
        Theme: {{ settings.theme }}
      </p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
