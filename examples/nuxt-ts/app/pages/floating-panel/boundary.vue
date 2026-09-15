<script setup lang="ts">
import * as floatingPanel from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { Minus, Maximize2, ArrowDownLeft, XIcon } from "lucide-vue-next"

const boundaryRef = ref<HTMLElement | null>(null)

const service = useMachine(floatingPanel.machine, {
  id: useId(),
  getBoundaryEl: () => boundaryRef.value,
})

const api = computed(() => floatingPanel.connect(service, normalizeProps))
</script>

<template>
  <main class="floating-panel">
    <div class="scroll-area" data-testid="scroller">
      <p>Scroll this area. The panel stays inside the dashed boundary.</p>
      <div class="scroll-spacer" />
      <div class="boundary" ref="boundaryRef" data-testid="boundary">
        <button v-bind="api.getTriggerProps()">Toggle Panel</button>
        <div v-bind="api.getPositionerProps()">
          <div v-bind="api.getContentProps()">
            <div v-bind="api.getDragTriggerProps()">
              <div v-bind="api.getHeaderProps()">
                <p v-bind="api.getTitleProps()">Floating Panel</p>
                <div v-bind="api.getControlProps()">
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
            <div v-bind="api.getBodyProps()">
              <p>Some content</p>
            </div>

            <div
              v-for="axis in floatingPanel.resizeTriggerAxes"
              :key="axis"
              v-bind="api.getResizeTriggerProps({ axis })"
            />
          </div>
        </div>
      </div>
      <div class="scroll-spacer" />
    </div>
  </main>
</template>
