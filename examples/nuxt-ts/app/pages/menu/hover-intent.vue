<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const service = useMachine(menu.machine, { id: useId(), onSelect: console.log })
const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <main>
    <label> Search <input placeholder="Keep typing while the menu opens" /> </label>
    <div @pointerenter="api.setOpen(true, 'trigger-hover')" @pointerleave="api.setOpen(false, 'trigger-hover')">
      <button v-bind="api.getTriggerProps()">Actions <span v-bind="api.getIndicatorProps()">▾</span></button>
      <div v-bind="api.getPositionerProps()">
        <ul v-bind="api.getContentProps()">
          <li v-bind="api.getItemProps({ value: 'edit' })">Edit</li>
          <li v-bind="api.getItemProps({ value: 'duplicate' })">Duplicate</li>
          <li v-bind="api.getItemProps({ value: 'delete' })">Delete</li>
        </ul>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
