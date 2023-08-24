<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { menuControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(menuControls)

const [state, send] = useMachine(menu.machine({ id: "1", onSelect: console.log }))

const api = computed(() => menu.connect(state.value, send, normalizeProps))
</script>

<template>
  <main>
    <div>
      <button v-bind="api.triggerProps">Actions <span aria-hidden>▾</span></button>
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
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
