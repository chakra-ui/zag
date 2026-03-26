<script setup lang="ts">
import styles from "../../../../../shared/src/css/toggle-group.module.css"
import * as toggle from "@zag-js/toggle-group"
import { toggleGroupControls, toggleGroupData } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(toggleGroupControls)

const service = useMachine(
  toggle.machine,
  controls.mergeProps<toggle.Props>({
    id: useId(),
  }),
)
const api = computed(() => toggle.connect(service, normalizeProps))
</script>

<template>
  <main class="toggle-group">
    <button>Outside</button>
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <button v-for="item in toggleGroupData" :key="item.value" v-bind="api.getItemProps({ value: item.value })" :class="styles.Item">
        {{ item.label }}
      </button>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
