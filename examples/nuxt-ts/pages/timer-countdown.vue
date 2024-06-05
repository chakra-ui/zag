<script setup lang="ts">
import * as timer from "@zag-js/timer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed } from "vue"

const [state, send] = useMachine(
  timer.machine({
    id: "v1",
    countdown: true,
    autoStart: true,
    startMs: timer.parse({ days: 2, seconds: 10 }),
    onComplete() {
      console.log("Timer completed")
    },
  }),
)

const api = computed(() => timer.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="timer">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getSegmentProps({ type: 'days' })">{{ api.formattedTime.days }}</div>
      <div v-bind="api.getSeparatorProps()">:</div>
      <div v-bind="api.getSegmentProps({ type: 'hours' })">{{ api.formattedTime.hours }}</div>
      <div v-bind="api.getSeparatorProps()">:</div>
      <div v-bind="api.getSegmentProps({ type: 'minutes' })">{{ api.formattedTime.minutes }}</div>
      <div v-bind="api.getSeparatorProps()">:</div>
      <div v-bind="api.getSegmentProps({ type: 'seconds' })">{{ api.formattedTime.seconds }}</div>
    </div>
    <div style="display: flex; gap: 4px">
      <button @click="api.start">START</button>
      <button @click="api.pause">PAUSE</button>
      <button @click="api.resume">RESUME</button>
      <button @click="api.reset">RESET</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="null" />
    </template>
  </Toolbar>
</template>
