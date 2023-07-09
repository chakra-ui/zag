<script setup lang="ts">
import { stringifyState } from "@zag-js/shared"
import { isRef } from "vue"

const props = defineProps<{
  state: Record<string, any>
  label?: string
  omit?: string[]
}>()

const state = isRef(props.state) ? props.state.value : props.state
</script>

<template>
  <div class="viz">
    <pre>
        <details open>
          <summary> {{props.label || "Visualizer"}} </summary>
          <div v-html="stringifyState(state, props.omit)"></div>
        </details>
      </pre>
  </div>
</template>
