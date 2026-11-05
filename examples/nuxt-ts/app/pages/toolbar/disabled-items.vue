<script setup lang="ts">
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toolbar from "@zag-js/toolbar"
import "@styles/toolbar.css"

const log = ref<string[]>([])
const service = useMachine(toolbar.machine, { id: useId() })
const api = computed(() => toolbar.connect(service, normalizeProps))

function activate(label: string) {
  log.value = [...log.value, label].slice(-5)
}
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getItemProps({ value: 'cut' })" @click="activate('Cut')">Cut</button>
      <button
        v-bind="api.getItemProps({ value: 'copy', disabled: true, focusableWhenDisabled: false })"
        @click="activate('Copy')"
      >
        Copy
      </button>
      <button
        v-bind="api.getItemProps({ value: 'paste', disabled: true })"
        @click="() => !api.getItemState({ value: 'paste', disabled: true }).disabled && activate('Paste')"
      >
        Paste
      </button>
      <button v-bind="api.getItemProps({ value: 'select-all' })" @click="activate('Select All')">Select All</button>
    </div>
    <p class="toolbar-note">Activated: {{ log.join(", ") || "(none)" }}</p>
    <p class="toolbar-note">
      Copy is disabled and skipped by the arrow keys. Paste is disabled but stays reachable, so it can still be
      discovered.
    </p>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
