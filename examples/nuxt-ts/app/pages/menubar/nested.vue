<script setup lang="ts">
import type * as menu from "@zag-js/menu"
import * as menubar from "@zag-js/menubar"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, provide, useId } from "vue"
import "@styles/menu.css"

const service = useMachine(menubar.machine, { id: useId() })
const api = computed(() => menubar.connect(service, normalizeProps))

provide<menu.MenubarContext>("menubar", api.value.getMenuContext())

const fileItems = [
  { value: "new", label: "New File" },
  { value: "open", label: "Open..." },
  { value: "save", label: "Save" },
]
const viewItems = [
  { value: "zoom-in", label: "Zoom In" },
  { value: "zoom-out", label: "Zoom Out" },
]
</script>

<template>
  <main class="menubar">
    <div v-bind="api.getRootProps()" style="display: inline-flex; gap: 4px">
      <MenubarMenu id="file" label="File" :items="fileItems" />
      <MenubarEditMenu />
      <MenubarMenu id="view" label="View" :items="viewItems" />
    </div>
  </main>
</template>
