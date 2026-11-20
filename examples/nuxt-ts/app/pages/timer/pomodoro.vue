<script setup lang="ts">
import * as timer from "@zag-js/timer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/timer.css"

const FOCUS_MS = 25 * 60_000

const toMs = (time: timer.Time) =>
  ((time.days * 24 + time.hours) * 60 + time.minutes) * 60_000 + time.seconds * 1000 + time.milliseconds
const pad = (value: number) => String(value).padStart(2, "0")

const service = useMachine(timer.machine, { id: useId(), countdown: true, startMs: FOCUS_MS })
const api = computed(() => timer.connect(service, normalizeProps))

const secondsLeft = computed(() => Math.ceil(toMs(api.value.time) / 1000))
const done = computed(() => Math.round((1 - api.value.progressPercent) * 100))
</script>

<template>
  <main>
    <div class="timer-pomodoro">
      <p class="hint">A 25-minute focus session. Pause for interruptions, restart to begin again.</p>
      <div v-bind="api.getRootProps()">
        <div v-bind="api.getAreaProps()">
          <div v-bind="api.getItemProps({ type: 'minutes' })">{{ pad(Math.floor(secondsLeft / 60)) }}</div>
          <div v-bind="api.getSeparatorProps()">:</div>
          <div v-bind="api.getItemProps({ type: 'seconds' })">{{ pad(secondsLeft % 60) }}</div>
        </div>
      </div>
      <div
        class="progress"
        role="progressbar"
        aria-label="Focus session"
        :aria-valuemin="0"
        :aria-valuemax="100"
        :aria-valuenow="done"
      >
        <div class="progress-bar" :style="{ width: `${done}%` }" />
      </div>
      <div v-bind="api.getControlProps()">
        <button v-bind="api.getActionTriggerProps({ action: 'start' })">Start focus</button>
        <button v-bind="api.getActionTriggerProps({ action: 'pause' })">Pause</button>
        <button v-bind="api.getActionTriggerProps({ action: 'resume' })">Resume</button>
        <button v-bind="api.getActionTriggerProps({ action: 'restart' })">Restart</button>
      </div>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
