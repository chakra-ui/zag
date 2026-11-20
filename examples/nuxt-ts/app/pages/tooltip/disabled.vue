<script setup lang="ts">
import { tooltipControls } from "@zag-js/shared"
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tooltip.css"

const id = "tip-1"
const controls = useControls(tooltipControls)
const service = useMachine(tooltip.machine, controls.mergeProps<tooltip.Props>({ id }))
const api = computed(() => tooltip.connect(service, normalizeProps))
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
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
