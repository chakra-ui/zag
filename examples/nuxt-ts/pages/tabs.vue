<script setup lang="ts">
import * as tabs from "@zag-js/tabs"
import { tabsControls, tabsData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(tabsControls)

const service = useMachine(tabs.machine, {
  id: useId(),
  defaultValue: "nils",
})

const api = computed(() => tabs.connect(service, normalizeProps))
</script>

<template>
  <main class="tabs">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getIndicatorProps()" />
      <div v-bind="api.getListProps()">
        <button
          v-for="data in tabsData"
          v-bind="api.getTriggerProps({ value: data.id })"
          :key="data.id"
          :data-testid="`${data.id}-tab`"
        >
          {{ data.label }}
        </button>
      </div>

      <div
        v-for="data in tabsData"
        v-bind="api.getContentProps({ value: data.id })"
        :key="data.id"
        :data-testid="`${data.id}-tab-panel`"
      >
        <p>{{ data.content }}</p>
        <input placeholder="Agnes" v-if="data.id === 'agnes'" />
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
