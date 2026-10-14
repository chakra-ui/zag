<script setup lang="ts">
import * as numberFlow from "@zag-js/number-flow"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/number-flow.css"

const value = ref(0)
const continuous = ref(true)
const playing = ref(true)

// Start the ticker on mount; setInterval is rejected during SSR
onMounted(() => {
  watchEffect((onCleanup) => {
    if (!playing.value) return
    const id = setInterval(() => {
      value.value += Math.round(Math.random() * 45 + 5)
    }, 900)
    onCleanup(() => clearInterval(id))
  })
})

const id = useId()

const service = useMachine(
  numberFlow.machine,
  computed(() => ({
    id,
    value: value.value,
    continuous: continuous.value,
    spinTiming: { duration: "800ms", easing: "cubic-bezier(0.4, 0, 0.2, 1)" },
  })),
)

const api = computed(() => numberFlow.connect(service, normalizeProps))
</script>

<template>
  <main class="number-flow">
    <div v-bind="api.getRootProps()" class="nf-hero">
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

    <!-- Continuous spins through every intermediate digit; default takes the short path -->
    <div class="nf-toggle" role="group" aria-label="Roll mode">
      <button :aria-pressed="continuous" @click="continuous = true">Continuous</button>
      <button :aria-pressed="!continuous" @click="continuous = false">Default</button>
    </div>

    <div class="hstack">
      <button @click="playing = !playing">{{ playing ? "Pause" : "Play" }}</button>
      <button @click="value = 0">Reset</button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
