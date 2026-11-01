<script setup lang="ts">
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tooltip.css"

const id = "tip-1"

let anchorRect: DOMRect | null = null

const service = useMachine(tooltip.machine, {
  id: "1",
  openDelay: 0,
  closeDelay: 0,
  positioning: {
    gutter: 4,
    placement: "top-start",
    getAnchorRect: () => anchorRect,
  },
})

const api = computed(() => tooltip.connect(service, normalizeProps))

const triggerProps = computed(() =>
  mergeProps(api.value.getTriggerProps(), {
    style: { width: "200px", height: "40px" },
    onPointermove(event: PointerEvent) {
      anchorRect = DOMRect.fromRect({ x: event.clientX, y: event.clientY, width: 1, height: 1 })
      api.value.reposition()
    },
  }),
)
</script>

<template>
  <main class="tooltip">
    <div class="root">
      <button :data-testid="`${id}-trigger`" v-bind="triggerProps">Hover me</button>
      <div v-bind="api.getPositionerProps()">
        <div class="tooltip-content" :data-testid="`${id}-tooltip`" v-bind="api.getContentProps()">Tooltip</div>
      </div>
    </div>
  </main>
</template>
