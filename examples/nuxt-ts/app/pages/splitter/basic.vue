<script lang="ts" setup>
import styles from "../../../../../shared/src/css/splitter.module.css"
import { splitterControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import * as splitter from "@zag-js/splitter"

const controls = useControls(splitterControls)

const service = useMachine(
  splitter.machine,
  controls.mergeProps<splitter.Props>({
    id: useId(),
    panels: [{ id: "a" }, { id: "b" }],
  }),
)

const api = computed(() => splitter.connect(service, normalizeProps))
</script>

<template>
  <main class="splitter">
    <div v-bind="api.getRootProps()" :class="styles.Root">
      <div v-bind="api.getPanelProps({ id: 'a' })" :class="styles.Panel">
        <p>A</p>
      </div>
      <div v-bind="api.getResizeTriggerProps({ id: 'a:b' })" :class="styles.ResizeTrigger"></div>
      <div v-bind="api.getPanelProps({ id: 'b' })" :class="styles.Panel">
        <p>B</p>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" :omit="['previousPanels', 'initialSize']" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
