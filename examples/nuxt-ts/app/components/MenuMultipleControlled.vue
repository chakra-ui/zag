<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"

const open = ref(false)

const id = useId()
const service = useMachine(
  menu.machine,
  computed(() => ({
    id,
    onOpenChange: (details: menu.OpenChangeDetails) => {
      open.value = details.open
    },
    open: open.value,
  })),
)

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <button v-bind="api.getTriggerProps()">Click me</button>
  <Teleport to="#teleports">
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <li v-bind="api.getItemProps({ value: 'edit' })">Edit</li>
        <li v-bind="api.getItemProps({ value: 'duplicate' })">Duplicate</li>
        <li v-bind="api.getItemProps({ value: 'delete' })">Delete</li>
        <li v-bind="api.getItemProps({ value: 'export' })">Export...</li>
      </div>
    </div>
  </Teleport>
</template>
