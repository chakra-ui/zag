<script setup lang="ts">
import styles from "../../../../../shared/src/css/floating-panel.module.css"
import * as floatingPanel from "@zag-js/floating-panel"
import { floatingPanelControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { Minus, Maximize2, ArrowDownLeft, XIcon } from "lucide-vue-next"

const controls = useControls(floatingPanelControls)

const service = useMachine(
  floatingPanel.machine,
  controls.mergeProps<floatingPanel.Props>({
    id: useId(),
  }),
)

const api = computed(() => floatingPanel.connect(service, normalizeProps))
</script>

<template>
  <main class="floating-panel">
    <div>
      <button v-bind="api.getTriggerProps()">Toggle Panel</button>
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()" :class="styles.Content">
          <div v-bind="api.getDragTriggerProps()">
            <div v-bind="api.getHeaderProps()" :class="styles.Header">
              <p v-bind="api.getTitleProps()">Floating Panel</p>
              <div v-bind="api.getControlProps()" :class="styles.Control">
                <button v-bind="api.getStageTriggerProps({ stage: 'minimized' })">
                  <Minus />
                </button>
                <button v-bind="api.getStageTriggerProps({ stage: 'maximized' })">
                  <Maximize2 />
                </button>
                <button v-bind="api.getStageTriggerProps({ stage: 'default' })">
                  <ArrowDownLeft />
                </button>
                <button v-bind="api.getCloseTriggerProps()">
                  <XIcon />
                </button>
              </div>
            </div>
          </div>
          <div v-bind="api.getBodyProps()" :class="styles.Body">
            <p>Some content</p>
          </div>

          <div v-for="axis in floatingPanel.resizeTriggerAxes" :key="axis" v-bind="api.getResizeTriggerProps({ axis })" :class="styles.ResizeTrigger" />
        </div>
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
