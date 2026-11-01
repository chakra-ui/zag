<script lang="ts" setup>
import * as splitter from "@zag-js/splitter"
import { isEqual } from "@zag-js/utils"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/splitter.css"

const showInspector = ref(true)

const panels = computed(
  () =>
    [
      { id: "nav", minSize: 20 },
      { id: "content", minSize: 30 },
      showInspector.value && { id: "inspector", minSize: 20 },
    ].filter(Boolean) as splitter.PanelData[],
)

const {
  value: size,
  setValue: setSize,
  hydrated,
} = usePersistentMapState<number[]>({
  storageKey: "zag:splitter:persistent-layout",
  key: () => splitter.layout(panels.value),
  defaultValue: [],
})

const id = useId()
const service = useMachine(
  splitter.machine,
  computed(() => ({
    id,
    panels: panels.value,
    size: size.value,
    onResize: (details: splitter.ResizeDetails) => setSize(details.size),
  })),
)

const api = computed(() => splitter.connect(service, normalizeProps))

const ready = computed(() => hydrated.value && (size.value.length === 0 || isEqual(api.value.getSizes(), size.value)))
</script>

<template>
  <main class="splitter" :style="{ visibility: ready ? 'visible' : 'hidden' }">
    <pre>{{ JSON.stringify(api.getSizes()) }}</pre>
    <button @click="showInspector = !showInspector">
      {{ showInspector ? "Hide Inspector" : "Show Inspector" }}
    </button>

    <div v-bind="api.getRootProps()">
      <div v-bind="api.getPanelProps({ id: 'nav' })">
        <p>Nav</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'nav:content' })" />
      <div v-bind="api.getPanelProps({ id: 'content' })">
        <p>Content</p>
      </div>
      <template v-if="showInspector">
        <div v-bind="api.getResizeTriggerProps({ id: 'content:inspector' })" />
        <div v-bind="api.getPanelProps({ id: 'inspector' })">
          <p>Inspector</p>
        </div>
      </template>
    </div>
  </main>
</template>
