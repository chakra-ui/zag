<script setup lang="ts">
import styles from "../../../../../shared/src/css/floating-panel.module.css"
import * as floatingPanel from "@zag-js/floating-panel"
import { trapFocus } from "@zag-js/focus-trap"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { Minus, Maximize2, ArrowDownLeft, XIcon } from "lucide-vue-next"

const service = useMachine(floatingPanel.machine, {
  id: useId(),
  closeOnEscape: true,
})

const api = computed(() => floatingPanel.connect(service, normalizeProps))

const contentRef = ref<HTMLDivElement>()

watch(
  () => api.value.open,
  (open) => {
    if (!open) return
    const el = contentRef.value
    if (!el) return

    const cleanup = trapFocus(el)

    watch(
      () => api.value.open,
      (stillOpen) => {
        if (!stillOpen) cleanup()
      },
      { once: true },
    )
  },
  { immediate: true },
)
</script>

<template>
  <main class="floating-panel">
    <div>
      <button v-bind="api.getTriggerProps()">Toggle Panel</button>
      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()" :class="styles.Content" ref="contentRef">
          <div v-bind="api.getDragTriggerProps()">
            <div v-bind="api.getHeaderProps()" :class="styles.Header">
              <p v-bind="api.getTitleProps()">Floating Panel (Focus Trap)</p>
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
            <p>Focus is trapped within this panel when open.</p>
            <label>
              Name
              <input type="text" placeholder="Enter name" />
            </label>
            <label>
              Email
              <input type="email" placeholder="Enter email" />
            </label>
            <button type="button">Submit</button>
          </div>

          <div
            v-for="axis in floatingPanel.resizeTriggerAxes"
            :key="axis"
            v-bind="api.getResizeTriggerProps({ axis })" :class="styles.ResizeTrigger"
          />
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
