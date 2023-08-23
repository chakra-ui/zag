<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"

const [state, send] = useMachine(
  menu.machine({
    id: "v1",
    onSelect: console.log,
  }),
)

const api = computed(() => menu.connect(state.value, send, normalizeProps))
</script>

<template>
  <main className="context-menu">
    <div v-bind="api.contextTriggerProps">Right Click here</div>
    <Teleport to="body">
      <div v-bind="api.positionerProps">
        <ul v-bind="api.contentProps">
          <li v-bind="api.getItemProps({ id: 'edit' })">Edit</li>
          <li v-bind="api.getItemProps({ id: 'duplicate' })">Duplicate</li>
          <li v-bind="api.getItemProps({ id: 'delete' })">Delete</li>
          <li v-bind="api.getItemProps({ id: 'export' })">Export...</li>
        </ul>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
  </Toolbar>
</template>
