<script setup lang="ts">
import styles from "../../../../../shared/src/css/menu.module.css"
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
    <div v-bind="api.getContextTriggerProps()" :class="styles.ContextTrigger">Right Click here</div>
    <Teleport to="#teleports"">
      <div v-bind="api.getPositionerProps()">
        <ul v-bind="api.getContentProps()" :class="styles.Content">
          <li v-bind="api.getItemProps({ value: 'edit' })" :class="styles.Item">Edit</li>
          <li v-bind="api.getItemProps({ value: 'duplicate' })" :class="styles.Item">Duplicate</li>
          <li v-bind="api.getItemProps({ value: 'delete' })" :class="styles.Item">Delete</li>
          <li v-bind="api.getItemProps({ value: 'export' })" :class="styles.Item">Export...</li>
        </ul>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
