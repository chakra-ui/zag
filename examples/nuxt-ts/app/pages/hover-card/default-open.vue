<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import { hoverCardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/hover-card.css"

const controls = useControls(hoverCardControls)

const service = useMachine(
  hoverCard.machine,
  controls.mergeProps<hoverCard.Props>({
    id: useId(),
    defaultOpen: true,
  }),
)

const api = computed(() => hoverCard.connect(service, normalizeProps))
</script>

<template>
  <main class="hover-card">
    <div style="display: flex; gap: 50px">
      <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer" v-bind="api.getTriggerProps()">Twitter</a>

      <Teleport v-if="api.open" to="#teleports">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getArrowProps()">
              <div v-bind="api.getArrowTipProps()" />
            </div>
            Twitter Preview
            <a href="https://twitter.com/zag_js" target="_blank" rel="noreferrer">Twitter</a>
          </div>
        </div>
      </Teleport>

      <div data-testid="test-text">Test text</div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
