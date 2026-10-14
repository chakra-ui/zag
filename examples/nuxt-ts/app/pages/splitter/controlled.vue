<script lang="ts" setup>
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const size = ref<number[]>([25, 50, 25])

const id = useId()
const service = useMachine(
  splitter.machine,
  computed(() => ({
    id,
    panels: [
      { id: "left", minSize: 15 },
      { id: "center", minSize: 20 },
      { id: "right", minSize: 15 },
    ],
    size: size.value,
    onResize: (details: splitter.ResizeDetails) => {
      size.value = details.size
    },
  })),
)

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <pre>{{ JSON.stringify(size) }}</pre>
    <div style="display: flex; gap: 8px; margin-bottom: 8px">
      <button @click="size = [25, 50, 25]">Reset</button>
      <button @click="size = [50, 25, 25]">Left wide</button>
      <button @click="size = [25, 25, 50]">Right wide</button>
      <button @click="size = [15, 70, 15]">Center wide</button>
    </div>

    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'left' })">
        <p>Left</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'left:center' })" />
      <div v-bind="api.getPanelProps({ id: 'center' })">
        <p>Center</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'center:right' })" />
      <div v-bind="api.getPanelProps({ id: 'right' })">
        <p>Right</p>
      </div>
    </div>
  </main>
</template>
