<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(menu.machine, {
  id: useId(),
  positioning: { hideWhenDetached: true },
})

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <div>
    <button v-bind="api.getTriggerProps()">Actions <span v-bind="api.getIndicatorProps()">▾</span></button>
    <div v-if="api.open" v-bind="api.getPositionerProps()">
      <ul v-bind="api.getContentProps()">
        <li v-bind="api.getItemProps({ value: 'edit' })">Edit</li>
        <li v-bind="api.getItemProps({ value: 'duplicate' })">Duplicate</li>
        <li v-bind="api.getItemProps({ value: 'delete' })">Delete</li>
        <li v-bind="api.getItemProps({ value: 'export' })">Export...</li>
      </ul>
    </div>
  </div>
</template>
