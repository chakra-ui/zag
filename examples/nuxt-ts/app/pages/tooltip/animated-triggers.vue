<script lang="ts" setup>
import * as tooltip from "@zag-js/tooltip"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tooltip-viewport.css"

const items = [
  { value: "bold", label: "Bold", tooltip: "Bold" },
  { value: "italic", label: "Italic", tooltip: "Italic text" },
  { value: "underline", label: "Underline", tooltip: "Underline the selected text" },
]

const service = useMachine(tooltip.machine, {
  id: useId(),
  positioning: { placement: "top" },
})

const api = computed(() => tooltip.connect(service, normalizeProps))
</script>

<template>
  <main class="tooltip animated-triggers">
    <div class="animated-triggers__list">
      <button v-for="item in items" :key="item.value" v-bind="api.getTriggerProps({ value: item.value })">
        {{ item.label }}
      </button>
    </div>

    <Teleport to="#teleports">
      <div v-bind="api.getPositionerProps()">
        <Presence v-bind="api.getArrowProps()">
          <div v-bind="api.getArrowTipProps()" />
        </Presence>
        <Presence v-bind="api.getViewportProps()">
          <Presence v-for="item in items" :key="item.value" v-bind="api.getContentProps({ value: item.value })">
            {{ item.tooltip }}
          </Presence>
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
