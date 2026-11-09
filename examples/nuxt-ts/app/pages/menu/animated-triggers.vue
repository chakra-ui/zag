<script lang="ts" setup>
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu-viewport.css"

const menus = [
  { value: "file", label: "File", items: ["New file", "Open…", "Save", "Save as…"] },
  { value: "edit", label: "Edit", items: ["Undo", "Redo", "Cut", "Copy", "Paste"] },
  { value: "view", label: "View", items: ["Zoom in", "Zoom out", "Toggle full screen mode"] },
]

const service = useMachine(menu.machine, {
  id: useId(),
  positioning: { placement: "bottom-start" },
})

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <main class="menu animated-triggers">
    <div class="animated-triggers__list">
      <button v-for="item in menus" :key="item.value" v-bind="api.getTriggerProps({ value: item.value })">
        {{ item.label }}
      </button>
    </div>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getArrowProps()">
          <div v-bind="api.getArrowTipProps()" />
        </Presence>
        <Presence v-bind="api.getViewportProps()">
          <Presence v-for="item in menus" :key="item.value" v-bind="api.getContentProps({ value: item.value })">
            <div
              v-for="label in item.items"
              :key="label"
              v-bind="api.getItemProps({ value: `${item.value}:${label}` })"
            >
              {{ label }}
            </div>
          </Presence>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
