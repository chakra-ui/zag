<script setup lang="ts">
import * as zagSwitch from "@zag-js/switch"
import * as tooltip from "@zag-js/tooltip"
import { mergeProps, normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/switch.css"
import "@styles/tooltip.css"

const switchService = useMachine(zagSwitch.machine, { id: useId(), disabled: true })
const switchApi = computed(() => zagSwitch.connect(switchService, normalizeProps))

const tooltipService = useMachine(tooltip.machine, { id: useId() })
const tooltipApi = computed(() => tooltip.connect(tooltipService, normalizeProps))
</script>

<template>
  <main class="switch">
    <!-- Switch props last, so its id and data-state win -->
    <label v-bind="mergeProps<any>(tooltipApi.getTriggerProps(), switchApi.getRootProps())">
      <input v-bind="switchApi.getHiddenInputProps()" />
      <span v-bind="switchApi.getControlProps()">
        <span v-bind="switchApi.getThumbProps()" />
      </span>
      <span v-bind="switchApi.getLabelProps()">Wi-Fi</span>
    </label>

    <Teleport to="#teleports">
      <div v-bind="tooltipApi.getPositionerProps()">
        <Presence class="tooltip-content" v-bind="tooltipApi.getContentProps()">
          Wi-Fi is managed by your organization
        </Presence>
      </div>
    </Teleport>
  </main>
</template>
