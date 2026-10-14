<script setup lang="ts">
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tooltip.css"

const id = "tip-interactive"
const service = useMachine(tooltip.machine, {
  id,
  interactive: true,
  positioning: { gutter: 16 },
})

const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <main class="tooltip">
    <div class="root">
      <button :data-testid="`${id}-trigger`" v-bind="api.getTriggerProps()">Hover me</button>
      <span data-testid="sibling">Sibling text</span>
      <Teleport to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <Presence
            class="tooltip-content"
            :data-testid="`${id}-tooltip`"
            style="width: 240px"
            v-bind="api.getContentProps()"
          >
            Interactive tooltip.
            <a href="https://zagjs.com" target="_blank" rel="noreferrer">A link you can reach</a>
          </Presence>
        </div>
      </Teleport>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
