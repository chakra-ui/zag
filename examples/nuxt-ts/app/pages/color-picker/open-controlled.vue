<script setup lang="ts">
import * as colorPicker from "@zag-js/color-picker"
import { normalizeProps, useMachine } from "@zag-js/vue"
import "@styles/color-picker.css"

const open = ref(false)
const toggleRef = ref<HTMLButtonElement | null>(null)

const id = useId()
const service = useMachine(
  colorPicker.machine,
  computed(() => ({
    id,
    defaultValue: colorPicker.parse("#a855f7"),
    open: open.value,
    onOpenChange: (details: colorPicker.OpenChangeDetails) => {
      open.value = details.open
    },
    onInteractOutside(event: colorPicker.InteractOutsideEvent) {
      if (toggleRef.value?.contains(event.detail.target as Node)) event.preventDefault()
    },
  })),
)

const api = computed(() => colorPicker.connect(service, normalizeProps))
</script>

<template>
  <main class="color-picker">
    <p style="display: flex; gap: 12px; align-items: center">
      <button ref="toggleRef" type="button" @click="open = !open">
        {{ open ? "Close picker" : "Open picker" }}
      </button>
      <span>
        Open: <output aria-label="Open state">{{ String(open) }}</output>
      </span>
    </p>

    <div v-bind="api.getRootProps()">
      <label v-bind="api.getLabelProps()">Accent color</label>

      <div v-bind="api.getControlProps()">
        <button v-bind="api.getTriggerProps()">
          <div v-bind="api.getTransparencyGridProps({ size: '10px' })" />
          <div v-bind="api.getSwatchProps({ value: api.value })" />
        </button>
        <input v-bind="api.getChannelInputProps({ channel: 'hex' })" />
      </div>

      <div v-bind="api.getPositionerProps()">
        <div v-bind="api.getContentProps()">
          <div class="content__inner">
            <div v-bind="api.getAreaProps()">
              <div v-bind="api.getAreaBackgroundProps()" />
              <div v-bind="api.getAreaThumbProps()" />
            </div>

            <div v-bind="api.getChannelSliderProps({ channel: 'hue' })">
              <div v-bind="api.getChannelSliderTrackProps({ channel: 'hue' })" />
              <div v-bind="api.getChannelSliderThumbProps({ channel: 'hue' })" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
