<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const items = [
  { label: "Edit", value: "edit" },
  { label: "Duplicate", value: "duplicate" },
  { label: "Delete", value: "delete" },
  { label: "Export...", value: "export" },
]

const open = ref(false)

const id = useId()
const service = useMachine(
  menu.machine,
  computed(() => ({
    id,
    open: open.value,
    onOpenChange: (details: menu.OpenChangeDetails) => {
      open.value = details.open
    },
  })),
)

const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 40px; height: 200vh">
    <h1>Menu Controlled</h1>
    <h1>{{ String(open) }}</h1>

    <div style="display: flex; gap: 12px; margin-bottom: 24px">
      <button type="button" @click="open = true">Open</button>
      <button type="button" @click="open = false">Close</button>
    </div>

    <button type="button" v-bind="api.getTriggerProps()">Menu Trigger</button>
    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <ul v-bind="api.getContentProps()">
          <li v-for="item in items" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
            {{ item.label }}
          </li>
        </ul>
      </div>
    </Teleport>
  </div>
</template>
