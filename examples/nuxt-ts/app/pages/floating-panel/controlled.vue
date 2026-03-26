<script setup lang="ts">
import styles from "../../../../../shared/src/css/floating-panel.module.css"
import * as floatingPanel from "@zag-js/floating-panel"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ArrowDownLeft, Maximize2, Minus, XIcon } from "lucide-vue-next"
import { computed, onBeforeUnmount, onMounted, ref } from "vue"

const open = ref(false)
const size = ref({ width: 360, height: 260 })
const position = ref({ x: 120, y: 120 })
const observedSize = ref({ width: 0, height: 0 })
const observedEl = ref<HTMLElement | null>(null)
const id = useId()

let observer: ResizeObserver | null = null

onMounted(() => {
  observer = new ResizeObserver(([entry]) => {
    const { width, height } = entry.contentRect
    observedSize.value = { width: Math.round(width), height: Math.round(height) }
  })
  if (observedEl.value) observer.observe(observedEl.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

const service = useMachine(
  floatingPanel.machine,
  computed(() => ({
    id,
    open: open.value,
    defaultOpen: true,
    size: size.value,
    position: position.value,
    onOpenChange(details) {
      open.value = details.open
    },
    onSizeChange(details) {
      size.value = details.size
    },
    onPositionChange(details) {
      position.value = details.position
    },
  })),
)

const api = computed(() => floatingPanel.connect(service, normalizeProps))
</script>

<template>
  <main class="floating-panel">
    <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem">
      <button @click="() => (open = !open)">{{ open ? "Close" : "Open" }} panel</button>
      <button @click="() => (size = { width: 420, height: 320 })">Set size: 420x320</button>
      <button @click="() => (position = { x: 32, y: 32 })">Set position: (32, 32)</button>
      <button @click="() => api.setSize({ width: 440, height: 300 })">API set size: 440x300</button>
      <button @click="() => api.setPosition({ x: 48, y: 48 })">API set position: (48, 48)</button>
      <button
        @click="
          () => {
            size = { width: 360, height: 260 }
            position = { x: 120, y: 120 }
          }
        "
      >
        Reset rect
      </button>
    </div>

    <div style="margin-bottom: 1rem">
      size: {{ Math.round(api.size.width) }}x{{ Math.round(api.size.height) }} | position: ({{
        Math.round(api.position.x)
      }}, {{ Math.round(api.position.y) }})
    </div>

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
            <p>Drag and resize to update external state.</p>
            <p>Use the buttons above for externally controlled size and position.</p>
            <div
              ref="observedEl"
              style="
                resize: horizontal;
                overflow: auto;
                min-width: 180px;
                max-width: 100%;
                padding: 0.5rem;
                border: 1px solid #d4d4d8;
                border-radius: 0.5rem;
              "
            >
              ResizeObserver box: {{ observedSize.width }}x{{ observedSize.height }}
            </div>
          </div>

          <div v-for="axis in floatingPanel.resizeTriggerAxes" :key="axis" v-bind="api.getResizeTriggerProps({ axis })" :class="styles.ResizeTrigger" />
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
