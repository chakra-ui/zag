<script setup lang="ts">
import * as floatingPanel from "@zag-js/floating-panel"
import * as popover from "@zag-js/popover"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { Minus, Maximize2, ArrowDownLeft, XIcon } from "lucide-vue-next"

const service = useMachine(floatingPanel.machine, {
  id: useId(),
  closeOnEscape: true,
  defaultSize: { width: 400, height: 300 },
})

const api = computed(() => floatingPanel.connect(service, normalizeProps))

const popoverService = useMachine(popover.machine, {
  id: useId(),
  portalled: false,
})

const popoverApi = computed(() => popover.connect(popoverService, normalizeProps))
</script>

<template>
  <main class="floating-panel">
    <div>
      <button v-bind="api.getTriggerProps()">Toggle Panel</button>
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div v-bind="api.getDragTriggerProps()">
            <div v-bind="api.getHeaderProps()">
              <p v-bind="api.getTitleProps()">Floating Panel (Nested Popover)</p>
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
            <p>Escape closes the popover first, then the panel.</p>
            <div>
              <button v-bind="popoverApi.getTriggerProps()">Open Popover</button>
              <div v-bind="popoverApi.getPositionerProps()">
                <div v-bind="popoverApi.getContentProps()">
                  <div v-bind="popoverApi.getTitleProps()">Nested Popover</div>
                  <div v-bind="popoverApi.getDescriptionProps()">
                    Press Escape to close this popover without closing the panel.
                  </div>
                  <button v-bind="popoverApi.getCloseTriggerProps()">Close Popover</button>
                </div>
              </div>
            </div>
          </div>

          <div
            v-for="placement in floatingPanel.resizeTriggerPlacements"
            :key="placement"
            v-bind="api.getResizeTriggerProps({ placement })"
          />
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
