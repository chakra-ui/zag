<script setup lang="ts">
import * as toggle from "@zag-js/toggle-group"
import { toggleGroupData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const service = useMachine(toggle.machine, {
  id: useId(),
})
const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main class="toggle-group">
    <button @click="api.setValue(['bold'])">Set Value</button>
    <div v-bind="api.getRootProps()">
      <button v-for="item in toggleGroupData" :key="item.value" v-bind="api.getItemProps({ value: item.value })">
        {{ item.label }}
      </button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
