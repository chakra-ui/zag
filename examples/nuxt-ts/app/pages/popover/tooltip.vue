<script setup lang="ts">
import * as popover from "@zag-js/popover"
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import { XIcon } from "lucide-vue-next"
import "@styles/popover.css"
import "@styles/tooltip.css"

const ids = { trigger: useId() }

const popoverService = useMachine(popover.machine, {
  id: useId(),
  ids,
})

const tooltipService = useMachine(tooltip.machine, {
  id: useId(),
  ids,
  positioning: { placement: "top" },
})

const popoverApi = computed(() => popover.connect(popoverService, normalizeProps))
const tooltipApi = computed(() => tooltip.connect(tooltipService, normalizeProps))
</script>

<template>
  <main class="popover">
    <div data-part="root">
      <button v-bind="mergeProps(popoverApi.getTriggerProps(), tooltipApi.getTriggerProps())">Click me</button>

      <div v-if="tooltipApi.open" v-bind="tooltipApi.getPositionerProps()">
        <div class="tooltip-content" v-bind="tooltipApi.getContentProps()">Tooltip</div>
      </div>

      <Teleport to="#teleports">
        <div v-bind="popoverApi.getPositionerProps()">
          <div v-bind="popoverApi.getContentProps()">
            <div v-bind="popoverApi.getTitleProps()">Popover Title</div>
            <div data-part="body" data-testid="popover-body">
              <a>Non-focusable Link</a>
              <a href="#" data-testid="focusable-link">Focusable Link</a>
              <input placeholder="input" />
              <button v-bind="popoverApi.getCloseTriggerProps()">
                <XIcon />
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    </div>
  </main>
</template>
