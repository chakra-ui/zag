<script setup lang="ts">
import * as splitter from "@zag-js/splitter"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const id = useId()
const disabled = ref(false)
const lockA = ref(false)
const disableAll = ref(false)
const resizeCount = ref(0)
const resizeEnd = ref<string[]>([])
const collapseLog = ref<string[]>([])

const service = useMachine(
  splitter.machine,
  computed(() => ({
    id,
    defaultSize: [25, 50, 25],
    disabled: disableAll.value,
    panels: [
      { id: "a", collapsible: true, collapsedSize: 5, minSize: 10, maxSize: 40, disabled: lockA.value },
      { id: "b", minSize: 20 },
      { id: "c", minSize: 20 },
    ],
    onResize() {
      resizeCount.value++
    },
    onResizeEnd({ size }) {
      resizeEnd.value = [...resizeEnd.value, size.map(Math.round).join("/")]
    },
    onCollapse({ panelId }) {
      collapseLog.value = [...collapseLog.value, `collapse:${panelId}`]
    },
    onExpand({ panelId }) {
      collapseLog.value = [...collapseLog.value, `expand:${panelId}`]
    },
  })),
)

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <div class="controls">
      <button @click="api.collapsePanel('a')">Collapse A</button>
      <button @click="api.expandPanel('a')">Expand A</button>
      <button @click="disabled = !disabled">{{ disabled ? "Enable" : "Disable" }} second handle</button>
      <button @click="api.resizePanel('a', '200px')">Resize A to 200px</button>
      <button @click="lockA = !lockA">{{ lockA ? "Unlock" : "Lock" }} A</button>
      <button @click="disableAll = !disableAll">{{ disableAll ? "Enable" : "Disable" }} splitter</button>
    </div>

    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'a' })">
        <p>A</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'a:b' })" />
      <div v-bind="api.getPanelProps({ id: 'b' })">
        <p>B</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'b:c', disabled })" />
      <div v-bind="api.getPanelProps({ id: 'c' })">
        <p>C</p>
      </div>
    </div>

    <p>
      Sizes: <output aria-label="Sizes">{{ api.getSizes().map(Math.round).join("/") }}</output>
    </p>
    <p>
      onResize calls: <output aria-label="Resize count">{{ resizeCount }}</output>
    </p>
    <p>
      onResizeEnd: <output aria-label="Resize end reports">{{ resizeEnd.join(",") || "-" }}</output>
    </p>
    <p>
      onCollapse / onExpand: <output aria-label="Collapse reports">{{ collapseLog.join(",") || "-" }}</output>
    </p>
  </main>
</template>
