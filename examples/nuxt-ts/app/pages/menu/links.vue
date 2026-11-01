<script setup lang="ts">
import * as menu from "@zag-js/menu"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/menu.css"

const service = useMachine(menu.machine, { id: useId() })
const api = computed(() => menu.connect(service, normalizeProps))
</script>

<template>
  <div style="padding: 20px">
    <p>Use a screen reader to navigate to the menu.</p>
    <button v-bind="api.getTriggerProps()">Actions <span v-bind="api.getIndicatorProps()">▾</span></button>
    <div v-bind="api.getPositionerProps()">
      <div v-bind="api.getContentProps()">
        <a v-bind="api.getItemProps({ value: 'edit' })" href="https://google.com">Google</a>
        <a v-bind="api.getItemProps({ value: 'duplicate' })" href="https://bing.com">Bing</a>
        <a v-bind="api.getItemProps({ value: 'delete' })" href="https://github.com" target="_blank">GitHub</a>
        <a v-bind="api.getItemProps({ value: 'export' })" href="https://youtube.com" target="_blank">YouTube</a>
      </div>
    </div>
  </div>
</template>
