<script lang="ts" setup>
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const hideLeft = ref(false)
const hideRight = ref(false)

const panels = computed(
  () =>
    [
      !hideLeft.value && { id: "left", minSize: 20 },
      { id: "center", minSize: 30 },
      !hideRight.value && { id: "right", minSize: 20 },
    ].filter(Boolean) as splitter.PanelData[],
)

const id = useId()
const service = useMachine(
  splitter.machine,
  computed(() => ({ id, panels: panels.value })),
)

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <pre>{{ JSON.stringify(api.getSizes()) }}</pre>
    <button @click="hideLeft = !hideLeft">{{ hideLeft ? "Show Left" : "Hide Left" }}</button>
    <button @click="hideRight = !hideRight">{{ hideRight ? "Show Right" : "Hide Right" }}</button>

    <div v-bind="api.getRootProps()">
      <template v-if="!hideLeft">
        <div v-bind="api.getPanelProps({ id: 'left' })">
          <p>Left</p>
        </div>
        <div v-bind="api.getResizeTriggerProps({ id: 'left:center' })" />
      </template>

      <div v-bind="api.getPanelProps({ id: 'center' })">
        <p>Center</p>
      </div>

      <template v-if="!hideRight">
        <div v-bind="api.getResizeTriggerProps({ id: 'center:right' })" />
        <div v-bind="api.getPanelProps({ id: 'right' })">
          <p>Right</p>
        </div>
      </template>
    </div>
  </main>
</template>
