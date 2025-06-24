<script setup lang="ts" generic="T extends MachineSchema">
import { highlightState } from "@zag-js/stringify-state"
import type { MachineSchema, Service } from "@zag-js/core"

const props = defineProps<{
  state: Service<T>
  label?: string
  omit?: string[]
  context?: Array<keyof T["context"]>
}>()

const obj = computed(() => {
  const service = props.state
  return {
    state: service.state.get(),
    event: service.event.current(),
    context: props.context
      ? Object.fromEntries(props.context.map((key) => [key, service.context.get(key)]))
      : undefined,
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
