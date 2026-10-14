<script setup lang="ts">
import type * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const service = useMachine(menubar.machine, { id: useId(), orientation: "vertical" })
const api = computed(() => menubar.connect(service, normalizeProps))

provide<menu.MenubarContext>("menubar", api.value.getMenuContext())

// Vertical menubar menus fly out to the side
const positioning = { placement: "right-start", gutter: 4 } as const

const menus = [
  {
    id: "file",
    label: "File",
    items: [
      { value: "new", label: "New File" },
      { value: "open", label: "Open..." },
      { value: "save", label: "Save" },
    ],
  },
  {
    id: "edit",
    label: "Edit",
    items: [
      { value: "undo", label: "Undo" },
      { value: "redo", label: "Redo" },
      { value: "cut", label: "Cut" },
    ],
  },
  {
    id: "view",
    label: "View",
    items: [
      { value: "zoom-in", label: "Zoom In" },
      { value: "zoom-out", label: "Zoom Out" },
    ],
  },
]
</script>

<template>
  <main class="menubar">
    <div v-bind="api.getRootProps()" style="display: inline-flex; flex-direction: column; gap: 4px; width: 160px">
      <MenubarMenu
        v-for="m in menus"
        :id="m.id"
        :key="m.id"
        :label="m.label"
        :items="m.items"
        :positioning="positioning"
      />
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
