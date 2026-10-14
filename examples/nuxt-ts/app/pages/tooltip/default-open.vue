<script setup lang="ts">
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tooltip.css"

const id = "tip-1"
const id2 = "tip-2"
const service = useMachine(tooltip.machine, { id, defaultOpen: true })
const service2 = useMachine(tooltip.machine, { id: id2, defaultOpen: true })

const api = computed(() => tooltip.connect(service, normalizeProps))
const api2 = computed(() => tooltip.connect(service2, normalizeProps))
</script>

<template>
  <main class="tooltip">
    <div class="root">
      <button :data-testid="`${id}-trigger`" v-bind="api.getTriggerProps()">Hover me</button>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <Presence class="tooltip-content" :data-testid="`${id}-tooltip`" v-bind="api.getContentProps()">
            Tooltip
          </Presence>
        </div>
      </Teleport>
      <button :data-testid="`${id2}-trigger`" v-bind="api2.getTriggerProps()">Over me</button>
      <Teleport to="#teleports">
        <div v-bind="api2.getPositionerProps()">
          <Presence class="tooltip-content" :data-testid="`${id2}-tooltip`" v-bind="api2.getContentProps()">
            Tooltip 2
          </Presence>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" label="Tooltip 1" />
    <StateVisualizer :state="service2" label="Tooltip 2" />
  </Toolbar>
</template>
