<script setup lang="ts">
import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { computed, onMounted, ref, useId, watchEffect } from "vue"
import "@styles/number-flow.css"

const value = ref(0)
const continuous = ref(true)
const playing = ref(true)

// Nuxt runs `watchEffect` on the server too, and rejects `setInterval` there - so the ticker
// only ever starts once the component is mounted in the browser.
onMounted(() => {
  watchEffect((onCleanup) => {
    if (!playing.value) return
    const id = setInterval(() => {
      value.value += Math.round(Math.random() * 45 + 5)
    }, 900)
    onCleanup(() => clearInterval(id))
  })
})

const service = useMachine(numberFlow.machine, {
  id: useId(),
  get value() {
    return value.value
  },
  get continuous() {
    return continuous.value
  },
  spinTiming: { duration: "800ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
})

const api = computed(() => numberFlow.connect(service, normalizeProps))
</script>

<template>
  <main class="number-flow">
    <div v-bind="api.getRootProps()">
      <template v-for="segment in api.segments" :key="segment.key">
        <span v-if="segment.kind === 'digit'" v-bind="api.getDigitProps({ segment })">
          <span v-bind="api.getDigitTrackProps({ segment })">
            <span v-for="cell in api.digitCells" :key="cell.index" v-bind="api.getDigitCellProps({ segment, cell })">{{
              cell.glyph
            }}</span>
          </span>
        </span>
        <span v-else v-bind="api.getSymbolProps({ segment })">{{ segment.value }}</span>
      </template>
      <span v-bind="api.getValueTextProps()">{{ api.announcedValueText }}</span>
    </div>

    <div class="number-flow__actions">
      <button @click="playing = !playing">{{ playing ? "Pause" : "Play" }}</button>
      <button @click="value = 0">Reset</button>
      <label>
        <input v-model="continuous" type="checkbox" />
        continuous (spin through intermediates)
      </label>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
