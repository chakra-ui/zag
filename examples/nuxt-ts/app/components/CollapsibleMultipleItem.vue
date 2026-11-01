<script setup lang="ts">
import * as collapsible from "@zag-js/collapsible"
import { normalizeProps, useMachine } from "@zag-js/vue"

const props = defineProps<{ value: number; open: boolean }>()

// Counts renders; non-reactive on purpose
let renders = 0
const countRender = () => ++renders

const id = useId()
const service = useMachine(
  collapsible.machine,
  computed(() => ({
    id,
    open: props.open,
  })),
)

const api = computed(() => collapsible.connect(service, normalizeProps))
</script>

<template>
  <div v-bind="api.getRootProps()">
    <div v-bind="api.getContentProps()">
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          min-width: 400px;
          height: 64px;
          background-color: lightgray;
        "
      >
        {{ value }} {{ countRender() }}
      </div>
    </div>
    <div>{{ String(service.context.get("initial")) }}</div>
  </div>
</template>
