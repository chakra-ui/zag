<script setup lang="ts">
import * as tabs from "@zag-js/tabs"
import { tabsControls, tabsData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(tabsControls)

const [state, send] = useMachine(tabs.machine({ id: "1", value: "nils" }), {
  context: controls.context,
})

const api = computed(() => tabs.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="tabs">
    <div v-bind="api.rootProps">
      <div v-bind="api.indicatorProps" />
      <div v-bind="api.tablistProps">
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
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :config="controls.config" :state="controls.context" />
    </template>
  </Toolbar>
</template>
