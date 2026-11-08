<script setup lang="ts">
import * as radio from "@zag-js/radio-group"
import { alignOptions } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { useId } from "vue"
import "@styles/segmented-control.css"
import "@styles/radio-group.css"

const service = useMachine(radio.machine, {
  id: useId(),
  name: "align",
  orientation: "horizontal",
  defaultValue: "left",
})

const api = computed(() => radio.connect(service, normalizeProps))
</script>

<template>
  <main>
    <div class="segmented-control icon-only">
      <p class="hint">Pick an alignment, or focus one and press the arrow keys.</p>
      <div v-bind="api.getRootProps()">
        <span v-bind="api.getLabelProps()">Text alignment</span>
        <div v-bind="api.getIndicatorProps()" />
        <label
          v-for="opt in alignOptions"
          :key="opt.id"
          :data-testid="`radio-${opt.id}`"
          v-bind="api.getItemProps({ value: opt.id })"
        >
          <span :aria-label="opt.label" v-bind="api.getItemTextProps({ value: opt.id })">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path :d="opt.icon" />
            </svg>
          </span>
          <input v-bind="api.getItemHiddenInputProps({ value: opt.id })" />
        </label>
      </div>
      <p class="preview" data-testid="preview" :data-align="api.value">
        Orders placed before 3pm ship the same day. Delivery windows are estimates and may change during peak periods.
      </p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
