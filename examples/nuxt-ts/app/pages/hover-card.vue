<script setup lang="ts">
import * as hoverCard from "@zag-js/hover-card"
import { hoverCardControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(hoverCardControls)

const service = useMachine(
  hoverCard.machine,
  controls.mergeProps<hoverCard.Props>({
    id: useId(),
  }),
)

const api = computed(() => hoverCard.connect(service, normalizeProps))
</script>

<template>
  <main class="hover-card">
    <div style="display: flex; gap: 50px">
      <a href="https://twitter.com/zag_js" target="_blank" v-bind="api.getTriggerProps()"> Twitter </a>

      <Teleport to="#teleports" v-if="api.open">
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getArrowProps()">
              <div v-bind="api.getArrowTipProps()" />
            </div>
            Twitter Preview
            <a href="https://twitter.com/zag_js" target="_blank"> Twitter </a>
          </div>
        </div>
      </Teleport>

      <div data-part="test-text">Test text</div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
