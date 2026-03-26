<script setup lang="ts">
import styles from "../../../../../shared/src/css/timer.module.css"
import * as timer from "@zag-js/timer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, useId } from "vue"

const service = useMachine(timer.machine, {
  id: useId(),
  countdown: true,
  autoStart: true,
  startMs: timer.parse({ days: 2, seconds: 10 }),
  onComplete() {
    console.log("Timer completed")
  },
})

const api = computed(() => timer.connect(service, normalizeProps))
</script>

<template>
  <main class="timer">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <div v-bind="api.getAreaProps()" :class="styles.Area">
        <div v-bind="api.getItemProps({ type: 'days' })" :class="styles.Item">{{ api.formattedTime.days }}</div>
        <div v-bind="api.getSeparatorProps()" :class="styles.Separator">:</div>
        <div v-bind="api.getItemProps({ type: 'hours' })" :class="styles.Item">{{ api.formattedTime.hours }}</div>
        <div v-bind="api.getSeparatorProps()" :class="styles.Separator">:</div>
        <div v-bind="api.getItemProps({ type: 'minutes' })" :class="styles.Item">{{ api.formattedTime.minutes }}</div>
        <div v-bind="api.getSeparatorProps()" :class="styles.Separator">:</div>
        <div v-bind="api.getItemProps({ type: 'seconds' })" :class="styles.Item">{{ api.formattedTime.seconds }}</div>
      </div>
      <div v-bind="api.getControlProps()" :class="styles.Control">
        <button v-bind="api.getActionTriggerProps({ action: 'start' })">START</button>
        <button v-bind="api.getActionTriggerProps({ action: 'pause' })">PAUSE</button>
        <button v-bind="api.getActionTriggerProps({ action: 'resume' })">RESUME</button>
        <button v-bind="api.getActionTriggerProps({ action: 'reset' })">RESET</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
