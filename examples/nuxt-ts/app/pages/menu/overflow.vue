<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const items = [
  ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i}`, value: `item-${i}` })),
  { label: "Zebra", value: "zebra" },
  ...Array.from({ length: 20 }, (_, i) => ({ label: `Item ${i + 20}`, value: `item-${i + 20}` })),
]

const service = useMachine(menu.machine, { id: useId() })
const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <main style="padding: 40px">
    <p style="margin-bottom: 16px; color: #666">
      Use keyboard: open with Enter/Space, then ArrowDown to navigate. The highlighted item should scroll into view.
    </p>
    <div>
      <button v-bind="api.getTriggerProps()">Actions <span v-bind="api.getIndicatorProps()">▾</span></button>
      <Teleport v-if="api.open" to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <ul v-bind="mergeProps(api.getContentProps(), { style: { maxHeight: '200px', overflowY: 'auto' } })">
            <li v-for="item in items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
              {{ item.label }}
            </li>
          </ul>
        </div>
      </Teleport>
    </div>
  </main>
</template>
