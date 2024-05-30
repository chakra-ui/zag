<script setup lang="ts">
import * as floatingPanel from "@zag-js/floating-panel"
import { floatingPanelControls } from "@zag-js/shared"
import { normalizeProps, useMachine } from "@zag-js/vue"

const controls = useControls(floatingPanelControls)

const [state, send] = useMachine(floatingPanel.machine({ id: "1" }), {
  context: controls.context,
})

const api = computed(() => floatingPanel.connect(state.value, send, normalizeProps))
</script>

<template>
  <main class="floating-panel">
    <div>
      <button v-bind="api.getTriggerProps()">Toggle Panel</button>
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-bind="api.getDragTriggerProps()">
            <div v-bind="api.getHeaderProps()">
              <p v-bind="api.getTitleProps()">Floating Panel</p>
              <div data-scope="floating-panel" data-part="trigger-group">
                <button v-bind="api.getMinimizeTriggerProps()">
                  <Minus />
                </button>
                <button v-bind="api.getMaximizeTriggerProps()">
                  <Maximize2 />
                </button>
                <button v-bind="api.getRestoreTriggerProps()">
                  <ArrowDownLeft />
                </button>
                <button v-bind="api.getCloseTriggerProps()">
                  <XIcon />
                </button>
              </div>
            </div>
          </div>
          <div v-bind="api.getBodyProps()">
            <p>Some content</p>
          </div>

          <div v-bind="api.getResizeTriggerProps({ axis: 'n' })" />
          <div v-bind="api.getResizeTriggerProps({ axis: 'e' })" />
          <div v-bind="api.getResizeTriggerProps({ axis: 'w' })" />
          <div v-bind="api.getResizeTriggerProps({ axis: 's' })" />
          <div v-bind="api.getResizeTriggerProps({ axis: 'ne' })" />
          <div v-bind="api.getResizeTriggerProps({ axis: 'se' })" />
          <div v-bind="api.getResizeTriggerProps({ axis: 'sw' })" />
          <div v-bind="api.getResizeTriggerProps({ axis: 'nw' })" />
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="state" />
    <template #controls>
      <Controls :control="controls" />
    </template>
  </Toolbar>
</template>
