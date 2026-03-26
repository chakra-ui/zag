<script setup lang="ts">
import styles from "../../../../../shared/src/css/tabs.module.css"
import * as tabs from "@zag-js/tabs"
import { tabsControls, tabsData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(tabsControls)

const service = useMachine(
  tabs.machine,
  controls.mergeProps<tabs.Props>({
    id: useId(),
    defaultValue: "nils",
  }),
)

const api = computed(() => tabs.connect(service, normalizeProps))
</script>

<template>
  <main class="tabs">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <div v-bind="api.getIndicatorProps()" :class="styles.Indicator" />
      <div v-bind="api.getListProps()" :class="styles.List">
        <button
          v-for="data in tabsData"
          v-bind="api.getTriggerProps({ value: data.id })" :class="styles.Trigger"
          :key="data.id"
          :data-testid="`${data.id}-tab`"
        >
          {{ data.label }}
        </button>
      </div>

      <div
        v-for="data in tabsData"
        v-bind="api.getContentProps({ value: data.id })" :class="styles.Content"
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
