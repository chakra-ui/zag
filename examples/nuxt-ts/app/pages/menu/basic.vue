<script setup lang="ts">
import styles from "../../../../../shared/src/css/menu.module.css"
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
          <ul v-bind="api.getContentProps()" :class="styles.Content">
            <li v-bind="api.getItemProps({ value: 'edit' })" :class="styles.Item">Edit</li>
            <li v-bind="api.getItemProps({ value: 'duplicate' })" :class="styles.Item">Duplicate</li>
            <li v-bind="api.getItemProps({ value: 'delete' })" :class="styles.Item">Delete</li>
            <li v-bind="api.getItemProps({ value: 'export' })" :class="styles.Item">Export...</li>
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
