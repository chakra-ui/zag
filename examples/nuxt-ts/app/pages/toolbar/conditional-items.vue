<script setup lang="ts">
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as toolbar from "@zag-js/toolbar"
import "@styles/toolbar.css"

const showComment = ref(true)
const service = useMachine(toolbar.machine, { id: useId() })
const api = computed(() => toolbar.connect(service, normalizeProps))
</script>

<template>
  <main class="toolbar">
    <div v-bind="api.getRootProps()">
      <button v-bind="api.getItemProps({ value: 'cut' })">Cut</button>
      <button v-bind="api.getItemProps({ value: 'copy' })">Copy</button>
      <button v-bind="api.getItemProps({ value: 'paste' })">Paste</button>
      <button v-if="showComment" v-bind="api.getItemProps({ value: 'comment' })">Comment</button>
    </div>
    <label>
      <input v-model="showComment" type="checkbox" />
      Show Comment button
    </label>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>

