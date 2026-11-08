<script setup lang="ts">
import * as tabs from "@zag-js/tabs"
import { tabsData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/tabs.css"

const disabled = ref(false)
const addedTabs = ref<typeof tabsData>([])
const items = computed(() => [...tabsData, ...addedTabs.value])

const service = useMachine(tabs.machine, {
  id: useId(),
  defaultValue: "nils",
})

const api = computed(() => tabs.connect(service, normalizeProps))

const addTab = () => {
  const n = addedTabs.value.length + 1
  const tab = { id: `tab-${n}`, label: `Tab ${n}`, content: `Content of tab ${n}` }
  addedTabs.value = [...addedTabs.value, tab]
  api.value.setValue(tab.id)
}
</script>

<template>
  <main class="tabs">
    <div v-bind="api.getRootProps()">
      <div v-bind="api.getIndicatorProps()" />
      <div v-bind="api.getListProps()">
        <button
          v-for="data in items"
          v-bind="api.getTriggerProps({ value: data.id, disabled: data.id === 'nils' && disabled })"
          :key="data.id"
          :data-testid="`${data.id}-tab`"
        >
          {{ data.label }}
        </button>
      </div>

      <div
        v-for="data in items"
        v-bind="api.getContentProps({ value: data.id })"
        :key="data.id"
        :data-testid="`${data.id}-tab-panel`"
      >
        <p>{{ data.content }}</p>
      </div>
    </div>
    <label>
      <input type="checkbox" data-testid="disable-selected" v-model="disabled" />
      Disable the selected tab
    </label>
    <button @click="addTab">Add a tab</button>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :context="['value', 'tabStopValue']" />
  </Toolbar>
</template>
