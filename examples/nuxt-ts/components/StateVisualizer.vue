<script setup lang="ts">
import { highlightState } from "@zag-js/stringify-state"
import type { Service } from "@zag-js/core"

const props = defineProps<{
  state: Service<any>
  label?: string
  omit?: string[]
}>()

const obj = computed(() => {
  const service = props.state
  return {
    state: service.state.get(),
    event: service.event.current(),
  }
})
</script>

<template>
  <div class="viz">
    <pre>
        <details open>
          <summary> {{props.label || "Visualizer"}} </summary>
          <div v-html="highlightState(obj, props.omit)"></div>
        </details>
      </pre>
  </div>
</template>
