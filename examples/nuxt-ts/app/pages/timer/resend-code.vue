<script setup lang="ts">
import * as timer from "@zag-js/timer"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/timer.css"

const toMs = (time: timer.Time) =>
  ((time.days * 24 + time.hours) * 60 + time.minutes) * 60_000 + time.seconds * 1000 + time.milliseconds

const canResend = ref(false)
const sent = ref(1)

const service = useMachine(timer.machine, {
  id: useId(),
  countdown: true,
  autoStart: true,
  startMs: 30_000,
  onComplete: () => (canResend.value = true),
})
const api = computed(() => timer.connect(service, normalizeProps))
const secondsLeft = computed(() => Math.ceil(toMs(api.value.time) / 1000))

function resend() {
  canResend.value = false
  sent.value += 1
  api.value.restart()
}
</script>

<template>
  <main>
    <div class="timer-resend-code">
      <div v-bind="api.getRootProps()">
        <span class="code" aria-hidden="true">••• •••</span>
      </div>
      <button type="button" :disabled="!canResend" @click="resend">
        {{ canResend ? "Resend code" : `Resend code in ${secondsLeft}s` }}
      </button>
      <p class="sent">Sent {{ sent }} {{ sent === 1 ? "code" : "codes" }}</p>
    </div>
  </main>

  <Toolbar viz>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
