<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(menu.machine, {
  id: useId(),
  onSelect: console.log,
})

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <main class="context-menu">
    <div v-bind="api.getContextTriggerProps()">Right Click here</div>
    <Teleport to="#teleports"">
      <div v-bind="api.getPositionerProps()">
        <ul v-bind="api.getContentProps()">
          <li v-bind="api.getItemProps({ value: 'edit' })">Edit</li>
          <li v-bind="api.getItemProps({ value: 'duplicate' })">Duplicate</li>
          <li v-bind="api.getItemProps({ value: 'delete' })">Delete</li>
          <li v-bind="api.getItemProps({ value: 'export' })">Export...</li>
        </ul>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
