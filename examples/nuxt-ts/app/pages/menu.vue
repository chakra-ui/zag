<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { menuControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(menuControls)

const service = useMachine(
  menu.machine,
  controls.mergeProps<menu.Props>({
    id: useId(),
    onSelect: console.log,
  }),
)

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div>
      <button v-bind="api.getTriggerProps()">Actions <span v-bind="api.getIndicatorProps()">▾</span></button>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <ul v-bind="api.getContentProps()">
            <li v-bind="api.getItemProps({ value: 'edit' })">Edit</li>
            <li v-bind="api.getItemProps({ value: 'duplicate' })">Duplicate</li>
            <li v-bind="api.getItemProps({ value: 'delete' })">Delete</li>
            <li v-bind="api.getItemProps({ value: 'export' })">Export...</li>
          </ul>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
