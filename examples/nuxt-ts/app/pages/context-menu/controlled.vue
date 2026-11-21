<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const id = useId()
const open = ref(false)

const service = useMachine(
  menu.machine,
  computed<menu.Props>(() => ({
    id,
    open: open.value,
    onOpenChange: (details) => (open.value = details.open),
    onSelect: console.log,
  })),
)
const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <main class="context-menu">
    <div v-bind="api.getContextTriggerProps()">Right Click here</div>
    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <ul v-bind="api.getListProps()">
            <li v-bind="api.getItemProps({ value: 'edit' })">Edit</li>
            <li v-bind="api.getItemProps({ value: 'duplicate' })">Duplicate</li>
            <li v-bind="api.getItemProps({ value: 'delete' })">Delete</li>
            <li v-bind="api.getItemProps({ value: 'export' })">Export...</li>
          </ul>
        </div>
      </div>
    </Teleport>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
