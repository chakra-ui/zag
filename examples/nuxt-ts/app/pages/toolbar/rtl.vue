<script setup lang="ts">
import * as toolbar from "@zag-js/toolbar"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/toolbar.css"

const dir = ref<"ltr" | "rtl">("rtl")

const id = useId()
const service = useMachine(
  toolbar.machine,
  computed(() => ({ id, dir: dir.value })),
)
const api = computed(() => toolbar.connect(service, normalizeProps))
</script>

<template>
  <main class="toolbar" :dir="dir">
    <label>
      <input
        type="checkbox"
        :checked="dir === 'rtl'"
        @change="dir = ($event.target as HTMLInputElement).checked ? 'rtl' : 'ltr'"
      />
      RTL
    </label>

    <div v-bind="api.getRootProps()">
      <button v-bind="api.getItemProps({ value: 'cut' })">Cut</button>
      <button v-bind="api.getItemProps({ value: 'copy' })">Copy</button>
      <button v-bind="api.getItemProps({ value: 'paste' })">Paste</button>
      <button v-bind="api.getItemProps({ value: 'select-all' })">Select All</button>
    </div>

    <p>
      With <code>dir="rtl"</code>, ArrowLeft moves forward (toward the visual start) and ArrowRight moves backward —
      matching reading direction.
    </p>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
