<script setup lang="ts">
import type * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const route = useRoute()
const disabled = route.query.disabled === "true"

const service = useMachine(menubar.machine, { id: useId(), disabled })
const api = computed(() => menubar.connect(service, normalizeProps))

provide<menu.MenubarContext>("menubar", api.value.getMenuContext())

const logSelect = (label: string, value: string) => console.log(`[${label}]`, value)

const menus = [
  {
    id: "file",
    label: "File",
    items: [
      { value: "new", label: "New File" },
      { value: "open", label: "Open..." },
      { value: "save", label: "Save" },
      { value: "save-as", label: "Save As..." },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      { value: "undo", label: "Undo" },
      { value: "redo", label: "Redo" },
      { value: "cut", label: "Cut" },
      { value: "copy", label: "Copy" },
      { value: "paste", label: "Paste" },
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      { value: "zoom-in", label: "Zoom In" },
      { value: "zoom-out", label: "Zoom Out" },
      { value: "fullscreen", label: "Toggle Fullscreen" },
    ],
  },
]
</script>

<template>
  <main class="menubar">
    <div v-bind="api.getRootProps()" style="display: inline-flex; gap: 4px">
      <MenubarMenu
        v-for="m in menus"
        :id="m.id"
        :key="m.id"
        :label="m.label"
        :items="m.items"
        :on-select="({ value }) => logSelect(m.label, value)"
      />
    </div>
    <p style="margin-top: 24px">hasOpenMenu: {{ String(api.hasOpenMenu) }}</p>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
