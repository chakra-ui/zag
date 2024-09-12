<script setup lang="ts">
import * as timer from "@zag-js/timer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed } from "vue"

const [state, send] = useMachine(
  timer.machine({
    id: "v1",
    autoStart: true,
  }),
)

const api = computed(() => timer.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="timer">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getAreaProps()">
        <div v-bind="api.getItemProps({ type: 'days' })">{{ api.formattedTime.days }}</div>
        <div v-bind="api.getSeparatorProps()">:</div>
        <div v-bind="api.getItemProps({ type: 'hours' })">{{ api.formattedTime.hours }}</div>
        <div v-bind="api.getSeparatorProps()">:</div>
        <div v-bind="api.getItemProps({ type: 'minutes' })">{{ api.formattedTime.minutes }}</div>
        <div v-bind="api.getSeparatorProps()">:</div>
        <div v-bind="api.getItemProps({ type: 'seconds' })">{{ api.formattedTime.seconds }}</div>
      </div>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getActionTriggerProps({ action: 'start' })">START</button>
        <button v-bind="api.getActionTriggerProps({ action: 'pause' })">PAUSE</button>
        <button v-bind="api.getActionTriggerProps({ action: 'resume' })">RESUME</button>
        <button v-bind="api.getActionTriggerProps({ action: 'reset' })">RESET</button>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="null" />
    </template>
  </Toolbar>
</template>
