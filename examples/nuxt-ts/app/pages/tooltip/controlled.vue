<script setup lang="ts">
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tooltip.css"

const open = ref(false)

const id = useId()
const service = useMachine(
  tooltip.machine,
  computed(() => ({
    id,
    open: open.value,
    onOpenChange: (details: tooltip.OpenChangeDetails) => {
      open.value = details.open
    },
  })),
)

const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 40px; height: 200vh">
    <h1>Tooltip Controlled</h1>
    <h1>{{ String(open) }}</h1>

    <div style="display: flex; gap: 20px">
      <button type="button" @click="open = true">Open</button>
      <button type="button" @click="open = false">Close</button>

      <button v-bind="api.getTriggerProps()">Some tooltip</button>
      <Teleport v-if="api.open" to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">Tooltip Content</div>
        </div>
      </Teleport>
    </div>
  </div>
</template>
