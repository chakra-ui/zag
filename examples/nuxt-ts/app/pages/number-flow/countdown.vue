<script setup lang="ts">
import "@styles/number-flow.css"

const START = 90 * 60

const twoDigits = { minimumIntegerDigits: 2 }

const seconds = ref(START)
const running = ref(true)

onMounted(() => {
  watchEffect((onCleanup) => {
    if (!running.value) return
    const id = setInterval(() => {
      seconds.value = Math.max(0, seconds.value - 1)
    }, 1000)
    onCleanup(() => clearInterval(id))
  })
})

const units = computed(() => [
  { label: "Hours", value: Math.floor(seconds.value / 3600) },
  { label: "Minutes", value: Math.floor((seconds.value % 3600) / 60) },
  { label: "Seconds", value: seconds.value % 60 },
])
</script>

<template>
  <main class="number-flow">
    <div class="nf-countdown" role="timer">
      <div v-for="(unit, index) in units" :key="unit.label" class="hstack gap-1 items-start">
        <span v-if="index > 0" class="nf-colon">:</span>
        <div class="nf-unit">
          <!-- trend -1: digits always roll downward, like a clock counting down -->
          <NumberFlowDisplay :value="unit.value" :format-options="twoDigits" :trend="-1" />
          <small>{{ unit.label }}</small>
        </div>
      </div>
    </div>

    <div class="hstack">
      <button @click="running = !running">{{ running ? "Pause" : "Start" }}</button>
      <button @click="seconds = START">Reset</button>
    </div>
  </main>
</template>
