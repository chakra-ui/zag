<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"

const log = ref<string[]>([])

const service = useMachine(menu.machine, {
  id: useId(),
  onSelect: ({ value }) => (log.value = [...log.value, `select:${value}`]),
  onOpenChange: ({ open }) => (log.value = [...log.value, `open:${open}`]),
})

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div data-testid="open-state">{{ String(api.open) }}</div>
    <div data-testid="log">{{ log.join(",") }}</div>
    <button v-bind="api.getTriggerProps()">Actions <span v-bind="api.getIndicatorProps()">▾</span></button>
    <!-- Content stays mounted while closed and is re-parented into the portal when open -->
    <div :hidden="!api.open">
      <Teleport to="#teleports" :disabled="!api.open">
        <div v-bind="api.getPositionerProps()">
          <ul v-bind="api.getContentProps()">
            <li v-bind="api.getItemProps({ value: 'edit' })">Edit</li>
            <li v-bind="api.getItemProps({ value: 'duplicate' })">Duplicate</li>
            <li v-bind="api.getItemProps({ value: 'delete' })">Delete</li>
          </ul>
        </div>
      </Teleport>
    </div>
  </main>
</template>
